import { Link } from 'react-router-dom';
import PropertyListPage from './PropertyListPage.jsx';

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-copy">
            <p className="text-uppercase fw-semibold mb-2">Real Estate Property Management</p>
            <h1>Find, manage, book, and approve properties from one role-based platform.</h1>
            <div className="d-flex flex-wrap gap-2 mt-4">
              <Link className="btn btn-success btn-lg" to="/properties">Browse Properties</Link>
              <Link className="btn btn-light btn-lg" to="/register">Create Account</Link>
            </div>
          </div>
        </div>
      </section>
      <PropertyListPage embedded />
    </>
  );
}
