import { listActivityLogs } from '../models/activityLogModel.js';

export async function index(req, res) {
  res.json(await listActivityLogs());
}
