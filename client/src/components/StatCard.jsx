export default function StatCard({ label, value }) {
  return (
    <div className="card stat-card shadow-sm">
      <div className="card-body">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
