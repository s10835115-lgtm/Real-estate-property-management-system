import { db } from '../config/db.js';

function normalize(row) {
  return {
    ...row,
    price: Number(row.price),
    bedrooms: Number(row.bedrooms || 0),
    bathrooms: Number(row.bathrooms || 0),
    area_sqft: Number(row.area_sqft || 0),
    images: Array.isArray(row.images)
      ? row.images
      : row.image_urls
        ? row.image_urls.split('||').filter(Boolean)
        : []
  };
}

export async function listProperties(filters = {}, user = null) {
  const where = [];
  const params = [];

  // Exclude soft-deleted properties for non-admins
  if (!user || user.role !== 'admin') {
    where.push('p.removed_by_admin = 0');
  }

  if (filters.search) {
    where.push('(p.title LIKE ? OR p.description LIKE ? OR p.city LIKE ? OR p.address LIKE ?)');
    const like = `%${filters.search}%`;
    params.push(like, like, like, like);
  }
  if (filters.city) {
    where.push('p.city LIKE ?');
    params.push(`%${filters.city}%`);
  }
  if (filters.location) {
    where.push('p.address LIKE ?');
    params.push(`%${filters.location}%`);
  }
  ['category', 'availability', 'approval_status', 'owner_id', 'agent_id'].forEach((key) => {
    if (filters[key]) {
      where.push(`p.${key} = ?`);
      params.push(filters[key]);
    }
  });
  if (filters.property_type) {
    where.push('p.property_type LIKE ?');
    params.push(`%${filters.property_type}%`);
  }
  if (filters.minPrice) {
    where.push('p.price >= ?');
    params.push(Number(filters.minPrice));
  }
  if (filters.maxPrice) {
    where.push('p.price <= ?');
    params.push(Number(filters.maxPrice));
  }

  const page = Math.max(1, Number(filters.page || 1));
  const limit = Math.min(30, Math.max(1, Number(filters.limit || 9)));
  const offset = (page - 1) * limit;
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [countRows] = await db().query(`SELECT COUNT(*) AS total FROM properties p ${whereSql}`, params);
  const [rows] = await db().query(
    `SELECT p.*, u.name AS owner_name, GROUP_CONCAT(pi.image_url ORDER BY pi.id SEPARATOR '||') AS image_urls
     FROM properties p
     LEFT JOIN users u ON u.id = p.owner_id
     LEFT JOIN property_images pi ON pi.property_id = p.id
     ${whereSql}
     GROUP BY p.id
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return { data: rows.map(normalize), total: countRows[0].total, page, limit };
}

export async function getPropertyById(id) {
  const [rows] = await db().query(
    `SELECT p.*, 
            u.name AS owner_name, u.email AS owner_email, u.phone AS owner_phone,
            a.name AS agent_name, a.email AS agent_email, a.phone AS agent_phone,
            GROUP_CONCAT(pi.image_url ORDER BY pi.id SEPARATOR '||') AS image_urls
     FROM properties p
     LEFT JOIN users u ON u.id = p.owner_id
     LEFT JOIN users a ON a.id = p.agent_id
     LEFT JOIN property_images pi ON pi.property_id = p.id
     WHERE p.id = ?
     GROUP BY p.id`,
    [id]
  );
  return rows[0] ? normalize(rows[0]) : null;
}

export async function incrementPropertyView(id) {
  await db().query('UPDATE properties SET view_count = view_count + 1 WHERE id = ?', [id]);
}

export async function createProperty(data, imageUrls = []) {
  const connection = await db().getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query(
      `INSERT INTO properties
      (title, description, property_type, category, price, city, address, bedrooms, bathrooms, area_sqft, availability, approval_status, owner_id, agent_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.description,
        data.property_type,
        data.category,
        data.price,
        data.city,
        data.address,
        data.bedrooms,
        data.bathrooms,
        data.area_sqft,
        data.availability,
        data.approval_status || 'pending',
        data.owner_id,
        data.agent_id || null
      ]
    );
    await Promise.all(imageUrls.map((url) => connection.query('INSERT INTO property_images (property_id, image_url) VALUES (?, ?)', [result.insertId, url])));
    await connection.commit();
    return getPropertyById(result.insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateProperty(id, data, imageUrls = null) {
  await db().query(
    `UPDATE properties SET title=?, description=?, property_type=?, category=?, price=?, city=?, address=?,
     bedrooms=?, bathrooms=?, area_sqft=?, availability=?, approval_status=?, agent_id=?, rejection_reason=? WHERE id=?`,
    [
      data.title,
      data.description,
      data.property_type,
      data.category,
      data.price,
      data.city,
      data.address,
      data.bedrooms,
      data.bathrooms,
      data.area_sqft,
      data.availability,
      data.approval_status,
      data.agent_id || null,
      data.rejection_reason || null,
      id
    ]
  );
  if (imageUrls) {
    await db().query('DELETE FROM property_images WHERE property_id = ?', [id]);
    await Promise.all(imageUrls.map((url) => db().query('INSERT INTO property_images (property_id, image_url) VALUES (?, ?)', [id, url])));
  }
  return getPropertyById(id);
}

export async function deleteProperty(id, isAdmin = false, options = {}) {
  if (isAdmin) {
    await db().query(
      'UPDATE properties SET removed_by_admin = 1, deleted_at = NOW(), deleted_by = ?, removal_reason = ? WHERE id = ?',
      [options.deleted_by || null, options.removal_reason || null, id]
    );
  } else {
    await db().query('DELETE FROM properties WHERE id = ?', [id]);
  }
  return true;
}
