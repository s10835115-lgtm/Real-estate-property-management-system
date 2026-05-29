import { db } from '../config/db.js';

export async function createBooking(data) {
  const [result] = await db().query(
    'INSERT INTO bookings (user_id, property_id, booking_date, booking_time, status) VALUES (?, ?, ?, ?, ?)',
    [data.user_id, data.property_id, data.booking_date, data.booking_time, 'pending']
  );
  return getBookingById(result.insertId);
}

export async function getBookingById(id) {
  const [rows] = await db().query(
    `SELECT b.*, p.title AS property_title, u.name AS user_name, u.email AS user_email
     FROM bookings b
     JOIN properties p ON p.id = b.property_id
     JOIN users u ON u.id = b.user_id
     WHERE b.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function listBookings(user) {
  let sql = `SELECT b.*, p.title AS property_title, p.owner_id, p.agent_id,
                    u.name AS user_name, u.email AS user_email, u.phone AS user_phone
             FROM bookings b
             JOIN properties p ON p.id = b.property_id
             JOIN users u ON u.id = b.user_id`;
  const params = [];

  if (user.role === 'admin') {
    // Admin can audit all bookings.
  } else if (user.role === 'agent') {
    sql += ' WHERE p.agent_id = ?';
    params.push(user.id);
  } else if (user.role === 'seller') {
    sql += ' WHERE p.owner_id = ?';
    params.push(user.id);
  } else {
    sql += ' WHERE b.user_id = ?';
    params.push(user.id);
  }

  sql += ' ORDER BY b.created_at DESC';
  
  const [rows] = await db().query(sql, params);
  return rows;
}

export async function updateBookingStatus(id, status, data = {}) {
  await db().query(
    'UPDATE bookings SET status = ?, reschedule_date = ?, reschedule_time = ?, cancellation_reason = ? WHERE id = ?',
    [status, data.reschedule_date || null, data.reschedule_time || null, data.cancellation_reason || null, id]
  );
  return getBookingById(id);
}
