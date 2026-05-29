import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/client.js';
import Loading from '../components/Loading.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import SearchFilter from '../components/SearchFilter.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function PropertyListPage({ embedded = false }) {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 9 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, limit: 9 });

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/properties', { params: filters });
      setProperties(data.data);
      setMeta({ total: data.total, page: data.page, limit: data.limit });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filters.page]);

  async function submitFilters(event) {
    event.preventDefault();
    await load();
  }

  async function saveFavorite(propertyId) {
    if (!user) return toast.info('Login to save favorites');
    if (user.role !== 'buyer') return toast.info('Only buyers can save favorite properties');
    try {
      await api.post(`/favorites/${propertyId}`);
      toast.success('Property saved to favorites');
    } catch (error) {
      toast.error(error.message);
    }
  }

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  return (
    <section className={embedded ? 'py-5 bg-soft' : 'py-5'}>
      <div className="container">
        {!embedded && <h1 className="mb-4">Property Listings</h1>}
        <div className="row g-4">
          <aside className="col-lg-3">
            <SearchFilter filters={filters} setFilters={setFilters} onSubmit={submitFilters} />
          </aside>
          <div className="col-lg-9">
            {loading ? <Loading /> : (
              <>
                <div className="row g-4">
                  {properties.map((property) => (
                    <div className="col-md-6 col-xl-4" key={property.id}>
                      <PropertyCard property={property} onFavorite={user?.role === 'buyer' ? saveFavorite : null} />
                    </div>
                  ))}
                </div>
                {!properties.length && <div className="alert alert-light border">No properties found.</div>}
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <span className="text-secondary small">Showing page {meta.page} of {totalPages}</span>
                  <div className="btn-group">
                    <button className="btn btn-outline-success" disabled={meta.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: meta.page - 1 }))}>Previous</button>
                    <button className="btn btn-outline-success" disabled={meta.page >= totalPages} onClick={() => setFilters((current) => ({ ...current, page: meta.page + 1 }))}>Next</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
