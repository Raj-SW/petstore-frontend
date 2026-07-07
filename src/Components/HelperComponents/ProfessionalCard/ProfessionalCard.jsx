import { isValidElement } from "react";
import { FiArrowRight, FiAward } from "react-icons/fi";
import "./ProfessionalCard.css";

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='280'%3E%3Crect width='400' height='280' fill='%23f0ebe4'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-size='64' fill='%23c9baa8'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E";

const ProfessionalCard = ({
  name,
  specialty,
  experience,
  image,
  badgeIcon: BadgeIcon,
  badgeLabel,
  onBook,
}) => {
  const avatarUrl = image || PLACEHOLDER;

  return (
    <article className="pro-card">
      <div className="pro-card-img-wrap">
        <img
          src={avatarUrl}
          alt={name}
          className="pro-card-img"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
        />
        {badgeLabel && (
          <span className="pro-card-chip">
            {(() => {
              if (isValidElement(BadgeIcon)) return BadgeIcon;
              if (typeof BadgeIcon === "function") return <BadgeIcon aria-hidden="true" />;
              return null;
            })()}
            {badgeLabel}
          </span>
        )}
      </div>

      <div className="pro-card-info">
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
      </div>
    </article>
  );
};

export default ProfessionalCard;
