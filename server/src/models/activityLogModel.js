import { db } from '../config/db.js';

export async function logActivity(userId, action, details) {
  const [result] = await db().query(
    'INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)',
    [userId, action, details]
  );
  return result.insertId;
}

export async function listActivityLogs() {
  const [rows] = await db().query(
    `SELECT al.*, u.name AS user_name, u.email AS user_email, u.role AS user_role
     FROM activity_logs al
     JOIN users u ON u.id = al.user_id
     ORDER BY al.created_at DESC`
  );
  return rows;
}
