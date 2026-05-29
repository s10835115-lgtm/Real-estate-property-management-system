import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/client.js';
import Loading from '../components/Loading.jsx';
import PropertyCard from '../components/PropertyCard.jsx';

export default function FavoritesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/favorites');
      setProperties(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(propertyId) {
    try {
      await api.delete(`/favorites/${propertyId}`);
      toast.success('Removed from favorites');
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <section className="py-5">
      <div className="container">
        <h1 className="mb-4">Favorite Properties</h1>
        {loading ? <Loading /> : (
          <div className="row g-4">
            {properties.map((property) => (
              <div className="col-md-6 col-lg-4" key={property.id}>
                <PropertyCard property={property} onFavorite={remove} />
              </div>
            ))}
            {!properties.length && <div className="alert alert-light border">No favorites saved yet.</div>}
          </div>
        )}
      </div>
    </section>
  );
}
