import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { ASSET_BASE_URL } from '../api/client.js';
import Loading from '../components/Loading.jsx';
import EmiCalculator from '../components/EmiCalculator.jsx';
import { money } from '../components/PropertyCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function img(url) {
  return url?.startsWith('/uploads') ? `${ASSET_BASE_URL}${url}` : url;
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ booking_date: '', booking_time: '' });
  const [activeImage, setActiveImage] = useState(0);
  const [flagReason, setFlagReason] = useState('');
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [enquiry, setEnquiry] = useState({ sender_name: user?.name || '', sender_email: user?.email || '', sender_phone: user?.phone || '', message: '' });

  useEffect(() => {
    api.get(`/properties/${id}`)
      .then(({ data }) => setProperty(data))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function submitBooking(event) {
    event.preventDefault();
    if (!user) return toast.info('Login to book a visit');
    try {
      await api.post('/bookings', { ...booking, property_id: Number(id) });
      toast.success('Visit request submitted');
      setBooking({ booking_date: '', booking_time: '' });
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function submitFlag(event) {
    event.preventDefault();
    if (!user) return toast.info('Login to report this listing');
    try {
      await api.post('/flagged-listings', { property_id: Number(id), reason: flagReason });
      toast.success('Listing has been flagged for admin review');
      setFlagReason('');
      setShowFlagForm(false);
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function submitEnquiry(event) {
    event.preventDefault();
    try {
      await api.post('/enquiries', { ...enquiry, property_id: Number(id) });
      toast.success('Enquiry sent');
      setEnquiry({ sender_name: user?.name || '', sender_email: user?.email || '', sender_phone: user?.phone || '', message: '' });
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (loading) return <Loading />;
  if (!property) return <div className="container py-5"><div className="alert alert-warning">Property not found.</div></div>;

  return (
    <section className="py-5">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-8">
            {property.images?.length ? (
              <div className="gallery-carousel shadow-sm rounded overflow-hidden">
                <img src={img(property.images[activeImage])} className="d-block w-100" alt={property.title} />
                <div className="gallery-thumbs">
                  {property.images.map((image, index) => (
                    <button
                      className={index === activeImage ? 'active' : ''}
                      key={image}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      style={{ backgroundImage: `url(${img(image)})` }}
                      aria-label={`Show image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-image detail-no-image rounded shadow-sm">No property images uploaded</div>
            )}
            <div className="mt-4">
              <span className="badge text-bg-success text-capitalize">{property.category}</span>
              <h1 className="mt-2">{property.title}</h1>
              <p className="lead text-secondary">{property.address}{property.exact_address_locked ? ' (approximate area)' : ''}</p>
              <p className="fs-3 fw-bold text-success">{money(property.price)}</p>
              <p>{property.description}</p>
            </div>
          </div>
          <aside className="col-lg-4">
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h5>Property Details</h5>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between"><span>Type</span><strong>{property.property_type}</strong></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Bedrooms</span><strong>{property.bedrooms}</strong></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Bathrooms</span><strong>{property.bathrooms}</strong></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Area</span><strong>{property.area_sqft} sqft</strong></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Availability</span><strong className="text-capitalize">{property.availability}</strong></li>
                </ul>
              </div>
            </div>
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h5>Contact Information</h5>
                {property.agent_name ? (
                  <div className="mb-3">
                    <p className="mb-0 text-secondary small">Agent</p>
                    <p className="mb-0 fw-bold">{property.agent_name}</p>
                    <p className="mb-0 small">{property.agent_email}</p>
                    {property.agent_phone && <p className="mb-0 small">{property.agent_phone}</p>}
                  </div>
                ) : (
                  <div className="mb-3">
                    <p className="mb-0 text-secondary small">Owner</p>
                    <p className="mb-0 fw-bold">{property.owner_name}</p>
                    <p className="mb-0 small">{property.owner_email}</p>
                    {property.owner_phone && <p className="mb-0 small">{property.owner_phone}</p>}
                  </div>
                )}
              </div>
            </div>
            {(!user || user.role === 'buyer') && <div className="card shadow-sm mb-3"><div className="card-body"><EmiCalculator /></div></div>}

            {user?.role === 'buyer' && (
              <form className="card shadow-sm mb-3" onSubmit={submitBooking}>
                <div className="card-body">
                  <h5>Book Property Visit</h5>
                  <label className="form-label w-100">Date<input type="date" className="form-control" value={booking.booking_date} onChange={(event) => setBooking({ ...booking, booking_date: event.target.value })} required /></label>
                  <label className="form-label w-100">Time<input type="time" className="form-control" value={booking.booking_time} onChange={(event) => setBooking({ ...booking, booking_time: event.target.value })} required /></label>
                  <button className="btn btn-success w-100" type="submit">Submit Visit Request</button>
                </div>
              </form>
            )}

            <form className="card shadow-sm mb-3" onSubmit={submitEnquiry}>
              <div className="card-body">
                <h5>Send Enquiry</h5>
                <input className="form-control mb-2" placeholder="Your name" value={enquiry.sender_name} onChange={(event) => setEnquiry({ ...enquiry, sender_name: event.target.value })} required />
                <input type="email" className="form-control mb-2" placeholder="Your email" value={enquiry.sender_email} onChange={(event) => setEnquiry({ ...enquiry, sender_email: event.target.value })} required />
                <input className="form-control mb-2" placeholder="Phone" value={enquiry.sender_phone} onChange={(event) => setEnquiry({ ...enquiry, sender_phone: event.target.value })} />
                <textarea className="form-control mb-2" rows="3" placeholder="Message" value={enquiry.message} onChange={(event) => setEnquiry({ ...enquiry, message: event.target.value })} required />
                <button className="btn btn-outline-success w-100" type="submit">Send Enquiry</button>
              </div>
            </form>

            {user && ['buyer', 'seller'].includes(user.role) && (
              <div className="card shadow-sm border-danger-subtle mb-3">
                <div className="card-body">
                  <h5 className="text-danger">Report Suspicious Listing</h5>
                  <p className="text-secondary small">If you believe this listing is fraudulent, duplicate, or contains incorrect details, please flag it for admin review.</p>
                  {!showFlagForm ? (
                    <button className="btn btn-outline-danger btn-sm w-100" onClick={() => setShowFlagForm(true)}>Flag Listing</button>
                  ) : (
                    <form onSubmit={submitFlag}>
                      <textarea className="form-control form-control-sm mb-2" rows="2" placeholder="Specify reason for reporting..." value={flagReason} onChange={(e) => setFlagReason(e.target.value)} required />
                      <div className="d-flex gap-2">
                        <button className="btn btn-danger btn-sm flex-grow-1" type="submit">Submit Report</button>
                        <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setShowFlagForm(false)}>Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
