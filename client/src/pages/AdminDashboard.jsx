import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/client.js';
import Loading from '../components/Loading.jsx';
import StatCard from '../components/StatCard.jsx';
import { money } from '../components/PropertyCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  AlertTriangle, 
  Building2, 
  Calendar, 
  CheckCircle, 
  Edit, 
  FileText, 
  Flag, 
  ShieldAlert, 
  Trash2, 
  UserCheck, 
  Users, 
  XCircle 
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [flags, setFlags] = useState([]);
  const [logs, setLogs] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  
  // Modals / Dialog State
  const [rejectingPropertyId, setRejectingPropertyId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [editingProperty, setEditingProperty] = useState(null);
  const [editReason, setEditReason] = useState('');

  const isAdmin = user?.role === 'admin';
  const isAgent = user?.role === 'agent';

  async function load() {
    setLoading(true);
    try {
      const [summaryRes, propertyRes, bookingsRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/properties', { params: { limit: 100, ...(isAgent ? { agent_id: user.id } : {}) } }),
        api.get('/bookings')
      ]);
      setStats(summaryRes.data);
      setProperties(propertyRes.data.data);
      setBookings(bookingsRes.data);

      if (isAdmin) {
        const [usersRes, flagsRes, logsRes] = await Promise.all([
          api.get('/users'),
          api.get('/flagged-listings'),
          api.get('/activity-logs')
        ]);
        setUsers(usersRes.data);
        setFlags(flagsRes.data);
        setLogs(logsRes.data);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Listing Approvals
  async function handleApprove(id) {
    try {
      await api.patch(`/properties/${id}/approval`, { status: 'approved' });
      toast.success('Listing approved');
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  function openRejectModal(id) {
    setRejectingPropertyId(id);
    setRejectionReason('');
  }

  async function handleReject(event) {
    event.preventDefault();
    if (!rejectionReason.trim()) return toast.error('Rejection reason is required');
    try {
      await api.patch(`/properties/${rejectingPropertyId}/approval`, { 
        status: 'rejected', 
        rejection_reason: rejectionReason 
      });
      toast.success('Listing rejected with reason');
      setRejectingPropertyId(null);
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  // Soft Delete Property
  async function deleteProperty(id) {
    if (!window.confirm('Are you sure you want to remove this property listing? (This will perform a secure soft-delete)')) return;
    try {
      await api.delete(`/properties/${id}`);
      toast.success('Property listing soft-deleted successfully');
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  // User Actions (Admin only)
  async function handleRoleUpdate(id, newRole) {
    try {
      await api.patch(`/users/${id}/role`, { role: newRole });
      toast.success('User role updated');
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleToggleSuspend(id, currentSuspended) {
    const actionText = currentSuspended ? 'unsuspend' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${actionText} this user account?`)) return;
    try {
      await api.patch(`/users/${id}/suspend`, { is_suspended: currentSuspended ? 0 : 1 });
      toast.success(`User successfully ${currentSuspended ? 'unsuspended' : 'suspended'}`);
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleDeleteUser(id) {
    if (!window.confirm('Are you sure you want to permanently delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User account deleted');
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  // Booking Actions
  async function cancelBooking(id) {
    if (!window.confirm('Are you sure you want to cancel this property visit booking?')) return;
    try {
      await api.patch(`/bookings/${id}/status`, { status: 'cancelled' });
      toast.success('Booking status set to cancelled');
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  // Flag Resolution Actions
  async function handleResolveFlag(id, flagStatus) {
    try {
      await api.patch(`/flagged-listings/${id}/status`, { status: flagStatus });
      toast.success(`Flag report marked as ${flagStatus}`);
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  // Admin Property Edit Form
  function openEditModal(property) {
    setEditingProperty({ ...property });
    setEditReason('');
  }

  async function handleEditProperty(event) {
    event.preventDefault();
    if (!editReason.trim()) return toast.error('Audit trail edit reason is required');
    try {
      await api.put(`/properties/${editingProperty.id}`, {
        ...editingProperty,
        admin_edit_reason: editReason
      });
      toast.success('Property updated and audited successfully');
      setEditingProperty(null);
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (loading) return <Loading />;

  return (
    <section className="py-5">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-1">Platform Governance</h1>
            <p className="text-secondary mb-0">Manage users, listings, flags, audit logs, and bookings.</p>
          </div>
          <span className="badge text-bg-success text-capitalize px-3 py-2 fs-6">
            Role: {user?.role}
          </span>
        </div>

        {/* Tab Navigation */}
        <ul className="nav nav-tabs mb-4 flex-wrap" role="tablist">
          <li className="nav-item">
            <button className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'analytics' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('analytics')}>
              <Building2 size={16} /> Analytics & Listings
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'bookings' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('bookings')}>
              <Calendar size={16} /> Visit Bookings
            </button>
          </li>
          {isAdmin && (
            <>
              <li className="nav-item">
                <button className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'users' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('users')}>
                  <Users size={16} /> User Accounts
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'flags' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('flags')}>
                  <Flag size={16} /> Flags & Reports {flags.filter(f => f.status === 'pending').length > 0 && <span className="badge bg-danger rounded-pill ms-1">{flags.filter(f => f.status === 'pending').length}</span>}
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'logs' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('logs')}>
                  <FileText size={16} /> Activity Audit Logs
                </button>
              </li>
            </>
          )}
        </ul>

        {/* Tab Contents */}
        <div className="tab-content">
          
          {/* TAB 1: ANALYTICS & LISTINGS */}
          {activeTab === 'analytics' && (
            <div>
              {/* Stat Cards */}
              <div className="row g-3 mb-4">
                {isAdmin && (
                  <>
                    <div className="col-md-3"><StatCard label="Total Buyers" value={stats?.totalBuyers} /></div>
                    <div className="col-md-3"><StatCard label="Total Sellers" value={stats?.totalSellers} /></div>
                    <div className="col-md-3"><StatCard label="Total Agents" value={stats?.totalAgents} /></div>
                  </>
                )}
                <div className="col-md-3"><StatCard label={isAgent ? 'Assigned Properties' : 'Total Properties'} value={isAgent ? stats?.assignedProperties : stats?.totalProperties} /></div>
                <div className="col-md-3"><StatCard label={isAgent ? 'Bookings This Month' : 'Total Bookings'} value={isAgent ? stats?.bookingsThisMonth : stats?.totalBookings} /></div>
                <div className="col-md-3"><StatCard label="Active Listings" value={stats?.activeListings} /></div>
                <div className="col-md-3"><StatCard label="Pending Approvals" value={stats?.pendingListings} /></div>
              </div>

              {/* Listings Reports Queue */}
              <div className="card shadow-sm">
                <div className="card-body">
                  <h4 className="card-title mb-3">{isAgent ? 'Assigned Property Portfolio' : 'Global Property Inventory'}</h4>
                  <div className="table-responsive">
                    <table className="table align-middle table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Property</th>
                          <th>City</th>
                          <th>Price</th>
                          <th>Owner</th>
                          <th>Status</th>
                          <th>Approval</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {properties.map((property) => (
                          <tr key={property.id} className={property.removed_by_admin ? 'table-danger-subtle opacity-75' : ''}>
                            <td>
                              <div className="fw-bold">{property.title}</div>
                              {property.removed_by_admin ? (
                                <span className="badge bg-danger">Removed by Admin</span>
                              ) : property.rejection_reason ? (
                                <div className="text-danger small mt-1">Rejection Reason: {property.rejection_reason}</div>
                              ) : null}
                            </td>
                            <td>{property.city}</td>
                            <td>{money(property.price)}</td>
                            <td>{property.owner_name || 'System'}</td>
                            <td>
                              <span className={`badge rounded-pill text-bg-light border text-capitalize`}>{property.availability}</span>
                            </td>
                            <td>
                              <span className={`badge text-capitalize ${property.approval_status === 'approved' ? 'bg-success' : property.approval_status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                {property.approval_status}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                {isAdmin && !property.removed_by_admin && (
                                  <>
                                    {property.approval_status !== 'approved' && (
                                      <button className="btn btn-sm btn-outline-success d-flex align-items-center gap-1" onClick={() => handleApprove(property.id)}>
                                        <CheckCircle size={14} /> Approve
                                      </button>
                                    )}
                                    {property.approval_status !== 'rejected' && (
                                      <button className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1" onClick={() => openRejectModal(property.id)}>
                                        <XCircle size={14} /> Reject
                                      </button>
                                    )}
                                    <button className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" onClick={() => openEditModal(property)}>
                                      <Edit size={14} /> Edit
                                    </button>
                                  </>
                                )}
                                {!property.removed_by_admin ? (
                                  <button className="btn btn-sm btn-danger d-flex align-items-center gap-1" onClick={() => deleteProperty(property.id)}>
                                    <Trash2 size={14} /> Remove
                                  </button>
                                ) : (
                                  <span className="text-secondary small">Deleted Archive</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {!properties.length && (
                          <tr><td colSpan="7" className="text-center py-3 text-secondary">No properties on the platform yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VISIT BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="card-title mb-3">Property Visit Bookings</h4>
                <div className="table-responsive">
                  <table className="table align-middle table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Property</th>
                        <th>User</th>
                        <th>Email</th>
                        <th>Visit Date</th>
                        <th>Visit Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td><strong>{booking.property_title}</strong></td>
                          <td>{booking.user_name}</td>
                          <td>{booking.user_email}</td>
                          <td>{String(booking.booking_date).slice(0, 10)}</td>
                          <td>{booking.booking_time}</td>
                          <td>
                            <span className={`badge rounded-pill text-capitalize text-bg-light border`}>{booking.status}</span>
                          </td>
                          <td>
                            {booking.status !== 'cancelled' && (
                              <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1" onClick={() => cancelBooking(booking.id)}>
                                <XCircle size={14} /> Cancel Booking
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {!bookings.length && (
                        <tr><td colSpan="7" className="text-center py-3 text-secondary">No booking requests found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USER ACCOUNTS (Admin only) */}
          {activeTab === 'users' && isAdmin && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="card-title mb-3">User Roster & Governance</h4>
                <div className="table-responsive">
                  <table className="table align-middle table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Current Role</th>
                        <th>Phone</th>
                        <th>Suspension</th>
                        <th>Action Buttons</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((item) => (
                        <tr key={item.id} className={item.is_suspended ? 'table-warning opacity-75' : ''}>
                          <td>
                            <div className="fw-bold">{item.name}</div>
                            {item.id === user.id && <span className="badge bg-secondary">You</span>}
                          </td>
                          <td>{item.email}</td>
                          <td>
                            <select className="form-select form-select-sm w-auto text-capitalize" value={item.role} disabled={item.id === user.id} onChange={(e) => handleRoleUpdate(item.id, e.target.value)}>
                              <option value="buyer">Buyer</option>
                              <option value="seller">Seller</option>
                              <option value="agent">Agent</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td>{item.phone || '-'}</td>
                          <td>
                            <span className={`badge ${item.is_suspended ? 'bg-danger' : 'bg-success'}`}>
                              {item.is_suspended ? 'Suspended' : 'Active'}
                            </span>
                          </td>
                          <td>
                            {item.id !== user.id && (
                              <div className="d-flex gap-2">
                                <button className={`btn btn-sm ${item.is_suspended ? 'btn-success' : 'btn-warning'} d-flex align-items-center gap-1`} onClick={() => handleToggleSuspend(item.id, item.is_suspended)}>
                                  <ShieldAlert size={14} /> {item.is_suspended ? 'Unsuspend' : 'Suspend'}
                                </button>
                                <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1" onClick={() => handleDeleteUser(item.id)}>
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FLAGS & REPORTS (Admin only) */}
          {activeTab === 'flags' && isAdmin && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="card-title mb-3">Flagged Listings & Suspicious Content Review</h4>
                <div className="table-responsive">
                  <table className="table align-middle table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Property</th>
                        <th>Reporter</th>
                        <th>Flag Reason</th>
                        <th>Date Reported</th>
                        <th>Flag Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flags.map((flag) => (
                        <tr key={flag.id}>
                          <td>
                            <div className="fw-bold">{flag.property_title}</div>
                            {flag.property_removed_by_admin ? (
                              <span className="badge bg-danger small">Deleted Listing</span>
                            ) : (
                              <span className="badge bg-light text-secondary small border">Status: {flag.property_availability}</span>
                            )}
                          </td>
                          <td>
                            <div>{flag.reporter_name}</div>
                            <div className="text-secondary small">{flag.reporter_email}</div>
                          </td>
                          <td className="text-danger small">{flag.reason}</td>
                          <td>{new Date(flag.created_at).toLocaleString()}</td>
                          <td>
                            <span className={`badge text-capitalize ${flag.status === 'pending' ? 'bg-warning text-dark' : flag.status === 'dismissed' ? 'bg-secondary' : 'bg-success'}`}>
                              {flag.status}
                            </span>
                          </td>
                          <td>
                            {flag.status === 'pending' && (
                              <div className="d-flex gap-2">
                                <button className="btn btn-outline-success btn-sm d-flex align-items-center gap-1" onClick={() => handleResolveFlag(flag.id, 'reviewed')}>
                                  <CheckCircle size={14} /> Mark Reviewed
                                </button>
                                <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={() => handleResolveFlag(flag.id, 'dismissed')}>
                                  <XCircle size={14} /> Dismiss Flag
                                </button>
                                {!flag.property_removed_by_admin && (
                                  <button className="btn btn-danger btn-sm d-flex align-items-center gap-1" onClick={() => deleteProperty(flag.property_id)}>
                                    <Trash2 size={14} /> Soft-Delete Listing
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {!flags.length && (
                        <tr><td colSpan="6" className="text-center py-3 text-secondary">No suspicious listings flagged yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT LOGS (Admin only) */}
          {activeTab === 'logs' && isAdmin && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h4 className="card-title mb-3">Platform Activity Audit Log</h4>
                <div className="table-responsive">
                  <table className="table align-middle table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Date & Time</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id}>
                          <td>{new Date(log.created_at).toLocaleString()}</td>
                          <td>
                            <div className="fw-bold">{log.user_name}</div>
                            <div className="text-secondary small">{log.user_email} · <span className="text-capitalize">{log.user_role}</span></div>
                          </td>
                          <td>
                            <span className="badge bg-secondary font-monospace">{log.action}</span>
                          </td>
                          <td className="small">{log.details}</td>
                        </tr>
                      ))}
                      {!logs.length && (
                        <tr><td colSpan="4" className="text-center py-3 text-secondary">No activity logged yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* REJECTION REASON MODAL */}
      {rejectingPropertyId && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleReject}>
              <div className="modal-header">
                <h5 className="modal-title">Reject Property Listing</h5>
                <button type="button" className="btn-close" onClick={() => setRejectingPropertyId(null)}></button>
              </div>
              <div className="modal-body">
                <p className="small text-secondary">Please provide a reason for rejecting this property. This reason will be visible to the seller so they know what to correct.</p>
                <div className="mb-3">
                  <label className="form-label fw-bold">Rejection Reason</label>
                  <textarea className="form-control" rows="4" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="e.g. Missing high-res imagery, incorrect price, incomplete address data." required></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setRejectingPropertyId(null)}>Cancel</button>
                <button type="submit" className="btn btn-danger">Confirm Rejection</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT AUDITED PROPERTY MODAL */}
      {editingProperty && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
          <div className="modal-dialog modal-lg">
            <form className="modal-content" onSubmit={handleEditProperty}>
              <div className="modal-header">
                <h5 className="modal-title">Audited Global Property Edit</h5>
                <button type="button" className="btn-close" onClick={() => setEditingProperty(null)}></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning d-flex align-items-center gap-2">
                  <AlertTriangle size={18} />
                  <div className="small">You are performing an administrative edit. Your actions, audit reason, and alterations will be fully logged in the platform audit trail.</div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Property Title</label>
                    <input type="text" className="form-control form-control-sm" value={editingProperty.title} onChange={e => setEditingProperty({ ...editingProperty, title: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Price (INR)</label>
                    <input type="number" className="form-control form-control-sm" value={editingProperty.price} onChange={e => setEditingProperty({ ...editingProperty, price: Number(e.target.value) })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">City</label>
                    <input type="text" className="form-control form-control-sm" value={editingProperty.city} onChange={e => setEditingProperty({ ...editingProperty, city: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Address</label>
                    <input type="text" className="form-control form-control-sm" value={editingProperty.address} onChange={e => setEditingProperty({ ...editingProperty, address: e.target.value })} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Bedrooms</label>
                    <input type="number" className="form-control form-control-sm" value={editingProperty.bedrooms} onChange={e => setEditingProperty({ ...editingProperty, bedrooms: Number(e.target.value) })} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Bathrooms</label>
                    <input type="number" className="form-control form-control-sm" value={editingProperty.bathrooms} onChange={e => setEditingProperty({ ...editingProperty, bathrooms: Number(e.target.value) })} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Area (sqft)</label>
                    <input type="number" className="form-control form-control-sm" value={editingProperty.area_sqft} onChange={e => setEditingProperty({ ...editingProperty, area_sqft: Number(e.target.value) })} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold">Description</label>
                    <textarea className="form-control form-control-sm" rows="3" value={editingProperty.description} onChange={e => setEditingProperty({ ...editingProperty, description: e.target.value })} required></textarea>
                  </div>
                  <div className="col-12 border-top pt-3 mt-3">
                    <label className="form-label fw-bold text-danger">Audit Edit Reason (Required)</label>
                    <textarea className="form-control" rows="2" value={editReason} onChange={e => setEditReason(e.target.value)} placeholder="Specify what you edited and why (e.g. Corrected spelling of city, updated square footage to align with property deeds)." required></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setEditingProperty(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save & Log Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
