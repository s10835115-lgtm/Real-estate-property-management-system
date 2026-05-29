import { db } from '../config/db.js';

export async function flagListing(reporterId, propertyId, reason) {
  const [result] = await db().query(
    'INSERT INTO flagged_listings (reporter_id, property_id, reason) VALUES (?, ?, ?)',
    [reporterId, propertyId, reason]
  );
  return result.insertId;
}

export async function listFlagged() {
  const [rows] = await db().query(
    `SELECT fl.*, 
            u.name AS reporter_name, u.email AS reporter_email,
            p.title AS property_title, p.availability AS property_availability,
            p.removed_by_admin AS property_removed_by_admin
     FROM flagged_listings fl
     JOIN users u ON u.id = fl.reporter_id
     JOIN properties p ON p.id = fl.property_id
     ORDER BY fl.created_at DESC`
  );
  return rows;
}

export async function updateFlaggedStatus(id, status) {
  await db().query(
    'UPDATE flagged_listings SET status = ? WHERE id = ?',
    [status, id]
  );
  return true;
}
