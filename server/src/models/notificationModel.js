import { db } from '../config/db.js';

export async function createNotification(userId, title, message) {
  if (!userId) return null;
  const [result] = await db().query(
    'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
    [userId, title, message]
  );
  return { id: result.insertId, user_id: userId, title, message };
}

export async function listNotifications(userId) {
  const [rows] = await db().query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
}

export async function markNotificationRead(userId, id) {
  await db().query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
  return true;
}
