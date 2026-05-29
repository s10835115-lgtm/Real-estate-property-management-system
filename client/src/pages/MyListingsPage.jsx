import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/client.js';
import Loading from '../components/Loading.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import PropertyForm from '../components/PropertyForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function MyListingsPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const params = user.role === 'seller' ? { owner_id: user.id } : user.role === 'agent' ? { agent_id: user.id } : {};
      const { data } = await api.get('/properties', { params });
      setProperties(data.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(payload) {
    try {
      if (editing) {
        await api.put(`/properties/${editing.id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Property updated');
        setEditing(null);
      } else {
        await api.post('/properties', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Property submitted');
      }
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function remove(id) {
    try {
      await api.delete(`/properties/${id}`);
      toast.success('Property deleted');
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <section className="py-5">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <div>
            <h1 className="mb-1">My Listings</h1>
            <p className="text-secondary mb-0">Add properties, upload images, manage status, and view your inventory.</p>
          </div>
        </div>
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h3>{editing ? 'Edit Property' : 'Add New Property'}</h3>
            {editing && <button className="btn btn-outline-secondary btn-sm" onClick={() => setEditing(null)}>Cancel Edit</button>}
          </div>
          <PropertyForm key={editing ? editing.id : 'new'} initial={editing} onSubmit={submit} submitLabel={editing ? 'Update Property' : 'Add Property'} role={user.role} />
        </div>
        {loading ? <Loading /> : (
          <div className="row g-4">
            {properties.map((property) => (
              <div className="col-md-6 col-lg-4" key={property.id}>
                <PropertyCard property={property} manage onDelete={remove} onEdit={setEditing} />
              </div>
            ))}
            {!properties.length && <div className="alert alert-light border">No listings yet.</div>}
          </div>
        )}
      </div>
    </section>
  );
}
