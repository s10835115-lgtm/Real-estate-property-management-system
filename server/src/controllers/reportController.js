import { dashboardStats } from '../models/reportModel.js';

export async function summary(req, res) {
  res.json(await dashboardStats(req.user));
}
