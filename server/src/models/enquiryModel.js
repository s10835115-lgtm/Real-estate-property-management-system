import { db } from '../config/db.js';

export async function createEnquiry(data) {
  const connection = await db().getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query(
      `INSERT INTO enquiries (property_id, sender_id, sender_name, sender_email, sender_phone, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.property_id, data.sender_id || null, data.sender_name, data.sender_email, data.sender_phone || null, data.message]
    );
    await connection.query('UPDATE properties SET enquiry_count = enquiry_count + 1 WHERE id = ?', [data.property_id]);
    await connection.commit();
    return { id: result.insertId, ...data };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function listEnquiries(user) {
  const params = [];
  let where = '';

  if (user.role === 'seller') {
    where = 'WHERE p.owner_id = ?';
    params.push(user.id);
  } else if (user.role === 'agent') {
    where = 'WHERE p.agent_id = ?';
    params.push(user.id);
  }

  const [rows] = await db().query(
    `SELECT e.*, p.title AS property_title
     FROM enquiries e
     JOIN properties p ON p.id = e.property_id
     ${where}
     ORDER BY e.created_at DESC`,
    params
  );
  return rows;
}
