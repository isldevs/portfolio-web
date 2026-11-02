export default function Loading() {
  return (
    <div className="loading-shell" role="status" aria-label="Loading content">
      <div className="skeleton" style={{ width: 160 }} />
      <div className="skeleton title" />
      <div className="skeleton" />
      <div className="skeleton" style={{ width: '70%' }} />
      <div className="skeleton card" />
    </div>
  );
}
