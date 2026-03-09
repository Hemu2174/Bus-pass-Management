const StatusBadge = ({ status }) => {
  const normalizedStatus = typeof status === "string" && status.trim() ? status : "UNKNOWN";

  const cls =
    normalizedStatus === "ACTIVE" || normalizedStatus === "SUCCESS"
      ? "status-active"
      : normalizedStatus === "EXPIRED" || normalizedStatus === "FAILED"
      ? "status-expired"
      : "status-not-purchased";

  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${cls}`}>
      {normalizedStatus.replaceAll("_", " ")}
    </span>
  );
};

export default StatusBadge;
