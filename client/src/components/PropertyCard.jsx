import { Bath, BedDouble, Edit, Heart, MapPin, Ruler, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ASSET_BASE_URL } from '../api/client.js';

function imageUrl(url) {
  if (!url) return '';
  return url.startsWith('/uploads') ? `${ASSET_BASE_URL}${url}` : url;
}

export function money(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default function PropertyCard({ property, onFavorite, onDelete, onEdit, manage = false }) {
  return (
    <div className="card property-card h-100 shadow-sm">
      {property.images?.[0] ? (
        <img src={imageUrl(property.images[0])} className="card-img-top" alt={property.title} />
      ) : (
        <div className="no-image card-img-top">No image uploaded</div>
      )}
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between gap-3">
          <div>
            <h5 className="card-title mb-1">{property.title}</h5>
            <p className="text-secondary small mb-2"><MapPin size={15} /> {property.address}</p>
          </div>
          <span className={`status-pill ${property.availability}`}>{property.availability}</span>
        </div>
        <p className="fw-bold text-success fs-5 mb-2">{money(property.price)}</p>
        <div className="property-meta mb-3">
          <span><BedDouble size={16} /> {property.bedrooms}</span>
          <span><Bath size={16} /> {property.bathrooms}</span>
          <span><Ruler size={16} /> {property.area_sqft} sqft</span>
        </div>
        <p className="text-secondary small flex-grow-1">{property.description}</p>
        <div className="d-flex flex-wrap gap-2">
          <Link className="btn btn-success btn-sm" to={`/properties/${property.id}`}>View Details</Link>
          {onFavorite && <button className="btn btn-outline-danger btn-sm" onClick={() => onFavorite(property.id)}><Heart size={16} /> Save</button>}
          {manage && (
            <div className="d-flex gap-2">
              {onEdit && <button className="btn btn-outline-primary btn-sm" onClick={() => onEdit(property)}><Edit size={16} /> Edit</button>}
              {onDelete && <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(property.id)}><Trash2 size={16} /> Delete</button>}
            </div>
          )}
        </div>
      </div>
      {property.approval_status && <div className="card-footer bg-white small text-secondary">Listing status: <strong className="text-capitalize">{property.approval_status}</strong></div>}
    </div>
  );
}
