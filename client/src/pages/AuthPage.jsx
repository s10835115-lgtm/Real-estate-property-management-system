import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer', phone: '' });

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const user = isRegister ? await register(form) : await login(form.email, form.password);
      toast.success(`Welcome, ${user.name}`);
      
      // Redirect based on role
      if (user.role === 'admin' || user.role === 'agent') {
        navigate('/dashboard');
      } else if (user.role === 'seller') {
        navigate('/my-listings');
      } else {
        navigate('/properties');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-bg py-5">
      <div className="container">
        <div className="card auth-card shadow">
          <div className="card-body p-4 p-md-5">
            <h1 className="h3 mb-1">{isRegister ? 'Create account' : 'Login'}</h1>
            <p className="text-secondary">Use your registered database account credentials.</p>
            <form className="row g-3" onSubmit={submit}>
              {isRegister && (
                <>
                  <div className="col-md-6"><label className="form-label">Name<input className="form-control" value={form.name} onChange={(event) => update('name', event.target.value)} required /></label></div>
                  <div className="col-md-6"><label className="form-label">Phone<input className="form-control" value={form.phone} onChange={(event) => update('phone', event.target.value)} /></label></div>
                  <div className="col-12"><label className="form-label">Role<select className="form-select" value={form.role} onChange={(event) => update('role', event.target.value)}><option value="buyer">Buyer</option><option value="seller">Seller</option><option value="agent">Agent</option></select></label></div>
                </>
              )}
              <div className="col-12"><label className="form-label">Email<input type="email" className="form-control" value={form.email} onChange={(event) => update('email', event.target.value)} required /></label></div>
              <div className="col-12"><label className="form-label">Password<input type="password" className="form-control" value={form.password} onChange={(event) => update('password', event.target.value)} required /></label></div>
              <div className="col-12"><button className="btn btn-success w-100" disabled={loading}>{loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}</button></div>
            </form>
            <p className="mt-3 mb-0 text-center">
              {isRegister ? <Link to="/login">Already have an account?</Link> : <Link to="/register">Need a new account?</Link>}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
