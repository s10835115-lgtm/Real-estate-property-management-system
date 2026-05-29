export default function Loading({ label = 'Loading data...' }) {
  return (
    <div className="d-flex align-items-center justify-content-center py-5 text-secondary">
      <div className="spinner-border spinner-border-sm me-2" role="status" />
      {label}
    </div>
  );
}
