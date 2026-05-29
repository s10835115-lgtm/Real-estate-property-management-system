import { z } from 'zod';
import { flagListing, listFlagged, updateFlaggedStatus } from '../models/flaggedModel.js';
import { logActivity } from '../models/activityLogModel.js';

const flagSchema = z.object({
  property_id: z.coerce.number().int().positive(),
  reason: z.string().min(2)
});

export async function create(req, res) {
  const data = flagSchema.parse(req.body);
  const id = await flagListing(req.user.id, data.property_id, data.reason);
  res.status(201).json({ id, success: true });
}

export async function index(req, res) {
  res.json(await listFlagged());
}

export async function updateStatus(req, res) {
  const status = z.enum(['reviewed', 'dismissed']).parse(req.body.status);
  await updateFlaggedStatus(req.params.id, status);
  await logActivity(
    req.user.id,
    'RESOLVE_FLAG',
    `Flagged item ID ${req.params.id} marked as ${status}`
  );
  res.json({ success: true });
}
