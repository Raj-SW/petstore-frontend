import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./BackButton.css";

/** Replaces breadcrumbs on drill-in pages: history back with a safe fallback. */
const BackButton = ({ fallbackTo, label = "Back" }) => {
  const navigate = useNavigate();
  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(fallbackTo);
  };
  return (
    <button type="button" className="back-btn" onClick={goBack}>
      <FaArrowLeft size={12} aria-hidden="true" /> {label}
    </button>
  );
};

export default BackButton;
