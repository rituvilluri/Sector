export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="sector-toast">
      <span className="dot" style={{ background: 'var(--gold)' }} />
      <span>{message}</span>
    </div>
  );
}
