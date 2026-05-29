import { db } from '../config/db.js';

export async function listFavorites(userId) {
  const [rows] = await db().query(
    `SELECT p.*, GROUP_CONCAT(pi.image_url ORDER BY pi.id SEPARATOR '||') AS image_urls
     FROM favorites f
     JOIN properties p ON p.id = f.property_id
     LEFT JOIN property_images pi ON pi.property_id = p.id
     WHERE f.user_id = ?
     GROUP BY p.id`,
    [userId]
  );
  return rows.map((row) => ({ ...row, images: row.image_urls ? row.image_urls.split('||') : [] }));
}

export async function addFavorite(userId, propertyId) {
  await db().query('INSERT IGNORE INTO favorites (user_id, property_id) VALUES (?, ?)', [userId, propertyId]);
  await db().query('UPDATE properties SET save_count = save_count + 1 WHERE id = ?', [propertyId]);
  return true;
}

export async function removeFavorite(userId, propertyId) {
  await db().query('DELETE FROM favorites WHERE user_id = ? AND property_id = ?', [userId, propertyId]);
  return true;
}
