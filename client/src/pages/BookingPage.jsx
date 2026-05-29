import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/client.js';
import Loading from '../components/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function BookingPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const canApprove = ['agent', 'admin', 'seller'].includes(user?.role);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings');
      setBookings(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id, status) {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      toast.success(`Booking ${status}`);
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <section className="py-5">
      <div className="container">
        <h1 className="mb-4">Booking History</h1>
        <div className="card shadow-sm">
          <div className="card-body">
            {loading ? <Loading /> : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr><th>Property</th><th>User</th><th>Date</th><th>Time</th><th>Status</th><th>Notification</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>{booking.property_title}</td>
                        <td>{booking.user_name || user.name}</td>
                        <td>{String(booking.booking_date).slice(0, 10)}</td>
                        <td>{booking.booking_time}</td>
                        <td><span className="badge rounded-pill text-bg-light border text-capitalize">{booking.status}</span></td>
                        <td className="text-secondary small">{booking.notification || 'Status updates appear here.'}</td>
                        <td>
                          {canApprove ? (
                            <select className="form-select form-select-sm" value={booking.status} onChange={(event) => updateStatus(booking.id, event.target.value)}>
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : <span className="text-secondary small">Read only</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!bookings.length && <div className="alert alert-light border">No bookings found.</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
