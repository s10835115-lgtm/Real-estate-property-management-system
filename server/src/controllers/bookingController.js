import { z } from 'zod';
import { ApiError } from '../utils/apiError.js';
import { createBooking, listBookings, updateBookingStatus, getBookingById } from '../models/bookingModel.js';
import { db } from '../config/db.js';
import { createNotification } from '../models/notificationModel.js';

const bookingSchema = z.object({
  property_id: z.coerce.number().int().positive(),
  booking_date: z.string().min(8),
  booking_time: z.string().min(4)
});

async function ensureCanManageBooking(user, booking) {
  if (user.role === 'admin') return;
  if (user.role === 'agent') {
    const [rows] = await db().query('SELECT agent_id FROM properties WHERE id = ?', [booking.property_id]);
    if (rows[0] && rows[0].agent_id === user.id) return;
  }
  if (user.role === 'seller') {
    const [rows] = await db().query('SELECT owner_id FROM properties WHERE id = ?', [booking.property_id]);
    if (rows[0] && rows[0].owner_id === user.id) return;
  }
  throw new ApiError(403, 'You do not have permission to manage this booking');
}

export async function create(req, res) {
  if (req.user.role !== 'buyer') {
    throw new ApiError(403, 'Only buyers can book property visits');
  }
  const data = bookingSchema.parse(req.body);
  const booking = await createBooking({ ...data, user_id: req.user.id });
  const [propertyRows] = await db().query('SELECT owner_id, agent_id, title FROM properties WHERE id = ?', [data.property_id]);
  const property = propertyRows[0];
  if (property) {
    await createNotification(property.agent_id || property.owner_id, 'New visit request', `${req.user.name} requested a visit for ${property.title}.`);
  }
  res.status(201).json(booking);
}

export async function index(req, res) {
  res.json(await listBookings(req.user));
}

export async function updateStatus(req, res) {
  const booking = await getBookingById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  
  await ensureCanManageBooking(req.user, booking);

  const status = z.enum(['pending', 'approved', 'rejected', 'cancelled', 'rescheduled']).parse(req.body.status);
  const updated = await updateBookingStatus(req.params.id, status, {
    reschedule_date: req.body.reschedule_date,
    reschedule_time: req.body.reschedule_time,
    cancellation_reason: req.body.cancellation_reason
  });
  await createNotification(updated.user_id, 'Booking status updated', `Your booking for ${updated.property_title} is now ${status}.`);
  res.json(updated);
}
