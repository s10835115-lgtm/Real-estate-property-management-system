import { z } from 'zod';
import { ApiError, notFound } from '../utils/apiError.js';
import { createProperty, deleteProperty, getPropertyById, incrementPropertyView, listProperties, updateProperty } from '../models/propertyModel.js';
import { logActivity } from '../models/activityLogModel.js';
import { db } from '../config/db.js';

const propertySchema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  property_type: z.string().min(2),
  category: z.enum(['residential', 'commercial']),
  price: z.coerce.number().positive(),
  city: z.string().min(2),
  address: z.string().min(3),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  area_sqft: z.coerce.number().int().positive(),
  availability: z.enum(['available', 'booked', 'sold', 'rented']).default('available'),
  approval_status: z.enum(['pending', 'approved', 'rejected']).optional(),
  agent_id: z.coerce.number().int().positive().optional().or(z.literal('')),
  image_urls: z.union([z.array(z.string().url()), z.string()]).optional(),
  rejection_reason: z.string().optional().nullable()
});

function parseImages(req) {
  const uploaded = (req.files || []).map((file) => `/uploads/${file.filename}`);
  const raw = req.body.image_urls;
  const provided = Array.isArray(raw)
    ? raw
    : typeof raw === 'string' && raw.trim()
      ? raw.split('\n').map((url) => url.trim()).filter(Boolean)
      : [];
  return [...uploaded, ...provided];
}

function ensureCanManageProperty(user, property) {
  if (user.role === 'admin') return;
  if (user.role === 'agent' && property?.agent_id === user.id) return;
  if (user.role === 'seller' && property?.owner_id === user.id) return;
  throw new ApiError(403, 'You can only manage properties assigned to you or owned by you');
}

async function canViewExactAddress(user, property) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'seller' && property.owner_id === user.id) return true;
  if (user.role === 'agent' && property.agent_id === user.id) return true;
  if (user.role === 'buyer') {
    const [rows] = await db().query(
      "SELECT id FROM bookings WHERE user_id = ? AND property_id = ? AND status = 'approved' LIMIT 1",
      [user.id, property.id]
    );
    return rows.length > 0;
  }
  return false;
}

async function applyAddressPrivacy(user, property) {
  if (await canViewExactAddress(user, property)) return property;
  return {
    ...property,
    exact_address_locked: true,
    address: property.city
  };
}

export async function index(req, res) {
  const filters = { ...req.query };
  if (!req.user || req.user.role === 'buyer') filters.approval_status = 'approved';
  const result = await listProperties(filters, req.user);
  const data = await Promise.all(result.data.map((property) => applyAddressPrivacy(req.user, property)));
  res.json({ ...result, data });
}

export async function show(req, res) {
  const property = await getPropertyById(req.params.id);
  if (!property) throw notFound('Property not found');
  await incrementPropertyView(req.params.id);
  res.json(await applyAddressPrivacy(req.user, property));
}

export async function create(req, res) {
  if (req.user.role === 'admin') {
    throw new ApiError(403, 'Admin accounts cannot create property listings');
  }
  const parsed = propertySchema.parse(req.body);
  if (req.user.role === 'agent' && !req.body.owner_id) {
    throw new ApiError(400, 'Agents must assign a seller owner_id when creating a listing on behalf of a seller');
  }
  const property = await createProperty(
    {
      ...parsed,
      owner_id: req.user.role === 'seller' ? req.user.id : Number(req.body.owner_id || req.user.id),
      agent_id: req.user.role === 'agent' ? req.user.id : parsed.agent_id || null,
      approval_status: 'pending'
    },
    parseImages(req)
  );
  res.status(201).json(property);
}

export async function update(req, res) {
  const existing = await getPropertyById(req.params.id);
  if (!existing) throw notFound('Property not found');
  ensureCanManageProperty(req.user, existing);

  // Require audit log reason for admin edits
  if (req.user.role === 'admin' && !req.body.admin_edit_reason) {
    throw new ApiError(400, 'Admin edit reason is required for platform auditing');
  }

  const parsed = propertySchema.parse(req.body);
  
  // Block admin from uploading or altering images (Admins have no reason to edit photos)
  const images = req.user.role === 'admin' ? null : parseImages(req);

  const property = await updateProperty(req.params.id, {
    ...parsed,
    approval_status: parsed.approval_status || existing.approval_status,
    agent_id: parsed.agent_id || existing.agent_id
  }, images && images.length ? images : null);

  if (req.user.role === 'admin') {
    await logActivity(
      req.user.id,
      'EDIT_PROPERTY_ADMIN',
      `Edited property ID ${req.params.id} ("${property.title}"). Reason: ${req.body.admin_edit_reason}`
    );
  }

  res.json(property);
}

export async function destroy(req, res) {
  const existing = await getPropertyById(req.params.id);
  if (!existing) throw notFound('Property not found');
  ensureCanManageProperty(req.user, existing);
  
  const isAdmin = req.user.role === 'admin';
  await deleteProperty(req.params.id, isAdmin, {
    deleted_by: req.user.id,
    removal_reason: req.body?.removal_reason || null
  });
  
  if (isAdmin) {
    await logActivity(
      req.user.id,
      'DELETE_PROPERTY_ADMIN',
      `Soft-deleted property ID ${req.params.id} ("${existing.title}")`
    );
  }
  res.json({ deleted: true });
}

export async function approve(req, res) {
  const existing = await getPropertyById(req.params.id);
  if (!existing) throw notFound('Property not found');
  const status = z.enum(['approved', 'rejected', 'pending']).parse(req.body.status);
  
  let rejectionReason = null;
  if (status === 'rejected') {
    if (!req.body.rejection_reason) {
      throw new ApiError(400, 'Rejection reason is required');
    }
    rejectionReason = req.body.rejection_reason;
  }

  const property = await updateProperty(req.params.id, { 
    ...existing, 
    approval_status: status,
    rejection_reason: rejectionReason
  }, null);

  await logActivity(
    req.user.id,
    `LISTING_${status.toUpperCase()}`,
    `Listing ID ${req.params.id} ("${existing.title}") status updated to ${status}${rejectionReason ? ` with reason: ${rejectionReason}` : ''}`
  );

  res.json(property);
}
