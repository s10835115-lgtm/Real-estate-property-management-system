import { Search } from 'lucide-react';

export default function SearchFilter({ filters, setFilters, onSubmit }) {
  function update(key, value) {
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  }

  return (
    <form className="card shadow-sm sticky-filter" onSubmit={onSubmit}>
      <div className="card-body">
        <h5 className="card-title"><Search size={18} /> Search & Filter</h5>
        <div className="vstack gap-3">
          <input className="form-control" placeholder="Search title, city, address" value={filters.search || ''} onChange={(event) => update('search', event.target.value)} />
          <input className="form-control" placeholder="City" value={filters.city || ''} onChange={(event) => update('city', event.target.value)} />
          <input className="form-control" placeholder="Location" value={filters.location || ''} onChange={(event) => update('location', event.target.value)} />
          <input className="form-control" placeholder="Property type" value={filters.property_type || ''} onChange={(event) => update('property_type', event.target.value)} />
          <select className="form-select" value={filters.category || ''} onChange={(event) => update('category', event.target.value)}>
            <option value="">Any category</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
          <select className="form-select" value={filters.availability || ''} onChange={(event) => update('availability', event.target.value)}>
            <option value="">Any availability</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="sold">Sold</option>
          </select>
          <div className="row g-2">
            <div className="col"><input type="number" className="form-control" placeholder="Min price" value={filters.minPrice || ''} onChange={(event) => update('minPrice', event.target.value)} /></div>
            <div className="col"><input type="number" className="form-control" placeholder="Max price" value={filters.maxPrice || ''} onChange={(event) => update('maxPrice', event.target.value)} /></div>
          </div>
          <button className="btn btn-success w-100" type="submit">Apply Filters</button>
        </div>
      </div>
    </form>
  );
}
