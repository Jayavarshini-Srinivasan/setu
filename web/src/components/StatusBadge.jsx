import "../styles/StatusBadge.css";

export default function StatusBadge({
  status,
}) {
  const getStatusClass =
    () => {
      switch (
        status
      ) {
        case "shortlisted":
          return "status-shortlisted";

        case "reviewed":
          return "status-reviewed";

        case "rejected":
          return "status-rejected";

        case "active":
          return "status-active";

        case "inactive":
          return "status-inactive";

        default:
          return "status-default";
      }
    };

  return (
    <span
      className={`status-badge ${getStatusClass()}`}
    >
      {status}
    </span>
  );
}