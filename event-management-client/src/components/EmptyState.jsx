export default function EmptyState({ title, text }) {
  return (
    <div className="container">
      <h3>{title}</h3>
      <p className="muted">{text}</p>
    </div>
  );
}