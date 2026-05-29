import { z } from 'zod';
import { createEnquiry, listEnquiries } from '../models/enquiryModel.js';

const enquirySchema = z.object({
  property_id: z.coerce.number().int().positive(),
  sender_name: z.string().min(2),
  sender_email: z.string().email(),
  sender_phone: z.string().optional().or(z.literal('')),
  message: z.string().min(5)
});

export async function create(req, res) {
  const data = enquirySchema.parse(req.body);
  const sender = req.user
    ? {
        sender_id: req.user.id,
        sender_name: data.sender_name || req.user.name,
        sender_email: data.sender_email || req.user.email
      }
    : {};
  const enquiry = await createEnquiry({ ...data, ...sender });
  res.status(201).json(enquiry);
}

export async function index(req, res) {
  res.json(await listEnquiries(req.user));
}
