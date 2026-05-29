import { useState } from 'react';

const blank = {
  title: '',
  description: '',
  property_type: 'Apartment',
  category: 'residential',
  price: '',
  city: '',
  address: '',
  bedrooms: 1,
  bathrooms: 1,
  area_sqft: '',
  availability: 'available',
  approval_status: 'pending',
  owner_id: '',
  image_urls: ''
};

export default function PropertyForm({ initial, onSubmit, submitLabel = 'Save Property', role }) {
  const [form, setForm] = useState(initial ? { ...blank, ...initial, image_urls: (initial.images || []).join('\n') } : blank);
  const [files, setFiles] = useState([]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value ?? ''));
    files.forEach((file) => payload.append('images', file));
    onSubmit(payload);
  }

  return (
    <form className="card shadow-sm" onSubmit={handleSubmit}>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Title<input className="form-control" value={form.title} onChange={(event) => update('title', event.target.value)} required /></label></div>
          <div className="col-md-3"><label className="form-label">Type<input className="form-control" value={form.property_type} onChange={(event) => update('property_type', event.target.value)} required /></label></div>
          <div className="col-md-3"><label className="form-label">Category<select className="form-select" value={form.category} onChange={(event) => update('category', event.target.value)}><option value="residential">Residential</option><option value="commercial">Commercial</option></select></label></div>
          <div className="col-md-4"><label className="form-label">Price<input type="number" className="form-control" value={form.price} onChange={(event) => update('price', event.target.value)} required /></label></div>
          <div className="col-md-4"><label className="form-label">City<input className="form-control" value={form.city} onChange={(event) => update('city', event.target.value)} required /></label></div>
          <div className="col-md-4"><label className="form-label">Availability<select className="form-select" value={form.availability} onChange={(event) => update('availability', event.target.value)}><option value="available">Available</option><option value="booked">Booked</option><option value="sold">Sold</option><option value="rented">Rented</option></select></label></div>
          {role === 'agent' && <div className="col-md-4"><label className="form-label">Seller Owner ID<input type="number" className="form-control" value={form.owner_id} onChange={(event) => update('owner_id', event.target.value)} required /></label></div>}
          <div className="col-12"><label className="form-label">Address<input className="form-control" value={form.address} onChange={(event) => update('address', event.target.value)} required /></label></div>
          <div className="col-md-4"><label className="form-label">Bedrooms<input type="number" className="form-control" value={form.bedrooms} onChange={(event) => update('bedrooms', event.target.value)} /></label></div>
          <div className="col-md-4"><label className="form-label">Bathrooms<input type="number" className="form-control" value={form.bathrooms} onChange={(event) => update('bathrooms', event.target.value)} /></label></div>
          <div className="col-md-4"><label className="form-label">Area Sqft<input type="number" className="form-control" value={form.area_sqft} onChange={(event) => update('area_sqft', event.target.value)} required /></label></div>
          <div className="col-12"><label className="form-label">Description<textarea className="form-control" rows="3" value={form.description} onChange={(event) => update('description', event.target.value)} required /></label></div>
          <div className="col-md-6"><label className="form-label">Image URLs<textarea className="form-control" rows="3" value={form.image_urls} onChange={(event) => update('image_urls', event.target.value)} /></label></div>
          <div className="col-md-6"><label className="form-label">Upload Images<input type="file" className="form-control" multiple accept="image/png,image/jpeg,image/webp" onChange={(event) => setFiles(Array.from(event.target.files || []))} /></label></div>
        </div>
        <button className="btn btn-success mt-3" type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}
