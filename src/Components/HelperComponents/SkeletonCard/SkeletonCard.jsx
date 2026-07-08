import Skeleton from "react-loading-skeleton";

const SkeletonCard = ({ variant = "card", count = 6 }) => {
  if (variant === "row") {
    return Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        data-testid="skeleton-row-item"
        style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem 0", borderBottom: "1px solid #f0f0f0" }}
      >
        <Skeleton circle width={48} height={48} />
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" height={16} style={{ marginBottom: 8, display: "block" }} />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
    ));
  }

  return Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      data-testid="skeleton-card-item"
      style={{ borderRadius: 8, overflow: "hidden", background: "#fff" }}
    >
      <Skeleton height={180} style={{ display: "block" }} />
      <div style={{ padding: "0.75rem" }}>
        <Skeleton width="70%" height={18} style={{ marginBottom: 8, display: "block" }} />
        <Skeleton width="100%" height={14} style={{ marginBottom: 6, display: "block" }} />
        <Skeleton width="40%" height={12} />
      </div>
    </div>
  ));
};

export default SkeletonCard;
