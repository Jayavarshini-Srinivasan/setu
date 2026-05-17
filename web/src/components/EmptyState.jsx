import "../styles/EmptyState.css";

export default function EmptyState({
  title,
  description,
}) {
  return (
    <div className="empty-state">
      <h3 className="empty-state-title">
        {title}
      </h3>

      <p className="empty-state-description">
        {description}
      </p>
    </div>
  );
}