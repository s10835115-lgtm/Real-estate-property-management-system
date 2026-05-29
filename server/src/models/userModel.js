import { db } from '../config/db.js';

export function sanitizeUser(user) {
  if (!user) return null;
  const { password, password_hash, ...safe } = user;
  return safe;
}

export async function findUserByEmail(email) {
  const [rows] = await db().query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await db().query('SELECT id, name, email, role, phone, is_suspended, suspension_reason, created_at FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function createUser(data) {
  const [result] = await db().query(
    'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
    [data.name, data.email, data.password, data.role, data.phone || null]
  );
  return findUserById(result.insertId);
}

export async function listUsers() {
  const [rows] = await db().query('SELECT id, name, email, role, phone, is_suspended, suspension_reason, created_at FROM users ORDER BY created_at DESC');
  return rows;
}

export async function deleteUser(id) {
  await db().query('DELETE FROM users WHERE id = ?', [id]);
  return true;
}

export async function updateUserRole(id, role) {
  await db().query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
  return findUserById(id);
}

export async function toggleUserSuspension(id, isSuspended, reason = null) {
  await db().query('UPDATE users SET is_suspended = ?, suspension_reason = ? WHERE id = ?', [isSuspended ? 1 : 0, isSuspended ? reason : null, id]);
  return findUserById(id);
}
