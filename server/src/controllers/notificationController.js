import { listNotifications, markNotificationRead } from '../models/notificationModel.js';

export async function index(req, res) {
  res.json(await listNotifications(req.user.id));
}

export async function markRead(req, res) {
  await markNotificationRead(req.user.id, req.params.id);
  res.json({ updated: true });
}
