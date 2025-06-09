import "./CustomButton.css";

const CustomButton = ({
  title,
  onClick,
  icon,
  variant = "primary",
  size = "large", // Changed default size to large
  fullWidth = false,
  disabled = false,
  className = "",
}) => {
  return (
    <button
      className={`customButton ${variant} ${size} ${
        fullWidth ? "full-width" : ""
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {title && <span className="button-text">{title}</span>}
      {icon && <span className="button-icon">{icon}</span>}
    </button>
  );
};

export default CustomButton;
