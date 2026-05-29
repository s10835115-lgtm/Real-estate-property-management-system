import { db } from '../config/db.js';

export async function dashboardStats(user) {
  if (user.role === 'agent') {
    const [
      [assigned],
      [active],
      [pending],
      [bookings],
      [completed]
    ] = await Promise.all([
      db().query('SELECT COUNT(*) AS count FROM properties WHERE agent_id = ?', [user.id]),
      db().query("SELECT COUNT(*) AS count FROM properties WHERE agent_id = ? AND availability = 'available'", [user.id]),
      db().query("SELECT COUNT(*) AS count FROM properties WHERE agent_id = ? AND approval_status = 'pending'", [user.id]),
      db().query(
        `SELECT COUNT(*) AS count
         FROM bookings b
         JOIN properties p ON p.id = b.property_id
         WHERE p.agent_id = ? AND b.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)`,
        [user.id]
      ),
      db().query(
        `SELECT COUNT(*) AS count
         FROM bookings b
         JOIN properties p ON p.id = b.property_id
         WHERE p.agent_id = ? AND b.status = 'approved'`,
        [user.id]
      )
    ]);

    return {
      assignedProperties: assigned[0].count,
      activeListings: active[0].count,
      pendingListings: pending[0].count,
      bookingsThisMonth: bookings[0].count,
      visitsCompleted: completed[0].count
    };
  }

  const [
    [users],
    [properties],
    [bookings],
    [active],
    [pending],
    [buyers],
    [sellers],
    [agents]
  ] = await Promise.all([
    db().query('SELECT COUNT(*) AS count FROM users'),
    db().query('SELECT COUNT(*) AS count FROM properties'),
    db().query('SELECT COUNT(*) AS count FROM bookings'),
    db().query("SELECT COUNT(*) AS count FROM properties WHERE availability = 'available'"),
    db().query("SELECT COUNT(*) AS count FROM properties WHERE approval_status = 'pending'"),
    db().query("SELECT COUNT(*) AS count FROM users WHERE role = 'buyer'"),
    db().query("SELECT COUNT(*) AS count FROM users WHERE role = 'seller'"),
    db().query("SELECT COUNT(*) AS count FROM users WHERE role = 'agent'")
  ]);

  return {
    totalUsers: users[0].count,
    totalBuyers: buyers[0].count,
    totalSellers: sellers[0].count,
    totalAgents: agents[0].count,
    totalProperties: properties[0].count,
    totalBookings: bookings[0].count,
    activeListings: active[0].count,
    pendingListings: pending[0].count
  };
}
