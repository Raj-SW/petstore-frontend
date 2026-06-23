import { isValidElement } from "react";
import { FiArrowRight, FiAward } from "react-icons/fi";
import "./ProfessionalCard.css";

/**
 * Professional directory card (Epic 4) — token-styled, no react-bootstrap.
 * Shows avatar, name, a role/specialty chip and experience; the primary action
 * opens the professional's profile. Ratings + contact block were removed (the
 * directory rebuild descoped reviews; contact lives on the detail page).
 */
const ProfessionalCard = ({
  name,
  specialty,
  experience,
  image,
  badgeIcon: BadgeIcon,
  badgeLabel,
  onBook,
}) => {
  const avatarUrl =
    image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Pro")}&background=74B49B&color=fff&size=160`;

  return (
    <article className="pro-card">
      <div className="pro-card-top">
        <div className="pro-card-avatar">
          <img src={avatarUrl} alt={`${name} avatar`} loading="lazy" />
        </div>
        {badgeLabel && (
          <span className="pro-card-chip">
            {/* badgeIcon may arrive as a JSX element (current callers) or a component */}
            {isValidElement(BadgeIcon) ? BadgeIcon : (typeof BadgeIcon === "function" ? <BadgeIcon aria-hidden="true" /> : null)}
            {badgeLabel}
          </span>
        )}
      </div>

      <h3 className="pro-card-name">{name}</h3>

      {specialty && <p className="pro-card-specialty">{specialty}</p>}

      {(experience || experience === 0) && (
        <p className="pro-card-exp">
          <FiAward aria-hidden="true" /> {experience} years experience
        </p>
      )}

      <button type="button" className="pro-card-btn" onClick={onBook}>
        View profile <FiArrowRight aria-hidden="true" />
      </button>
    </article>
  );
};

export default ProfessionalCard;
