import EmiCalculator from '../components/EmiCalculator.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Navigate } from 'react-router-dom';

export default function EmiPage() {
  const { user } = useAuth();
  if (user && user.role !== 'buyer') return <Navigate to="/properties" replace />;

  return (
    <section className="py-5">
      <div className="container">
        <h1 className="mb-4">Loan EMI Calculator</h1>
        <EmiCalculator />
      </div>
    </section>
  );
}
