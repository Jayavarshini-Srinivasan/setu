import "../styles/ErrorState.css";

export default function ErrorState({
  message,
}) {
  return (
    <div className="error-state">
      <h3 className="error-state-title">
        Something went wrong
      </h3>

      <p className="error-state-message">
        {message}
      </p>
    </div>
  );
}