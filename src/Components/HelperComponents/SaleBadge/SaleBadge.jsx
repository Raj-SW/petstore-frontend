import "./SaleBadge.css";

/** "−X% OFF" pill. Renders nothing when percent is falsy/0. */
const SaleBadge = ({ percent, className = "" }) => {
  if (!percent || percent <= 0) return null;
  return <span className={`sale-badge ${className}`}>-{percent}% OFF</span>;
};

export default SaleBadge;
