import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiClock, FiExternalLink } from "react-icons/fi";
import { getAnimalTheme, capitalize } from "../tipTheme";
import { coverUrl } from "../../../utils/coverImage";

const cardMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.45, ease: "easeOut" },
};

const TipCard = ({ tip }) => {
  const theme = getAnimalTheme(tip.animalType);
  const Icon = theme.icon;
  const cover = coverUrl(tip.coverImage);

  return (
    <motion.article className="pct-card" {...cardMotion}>
      <Link to={`/pet-care-tips/${tip.slug || tip._id}`} className="pct-card-link">
        <div className="pct-card-strip" style={{ background: theme.color }} />
        <div
          className="pct-card-img"
          style={cover ? undefined : { background: `linear-gradient(135deg, ${theme.tint} 0%, #fffdf9 135%)` }}
        >
          {cover ? (
            <img src={cover} alt={tip.title} loading="lazy" />
          ) : (
            <span className="pct-card-img-badge">
              <Icon style={{ color: theme.color }} size={26} aria-hidden="true" />
            </span>
          )}
        </div>
        <div className="pct-card-body">
          <div className="pct-badges">
            <span className="pct-badge" style={{ background: theme.tint, color: theme.color }}>
              {theme.label}
            </span>
            <span className="pct-badge pct-badge-cat">{tip.category}</span>
          </div>
          <h3 className="pct-card-title">{tip.title}</h3>
          <div className="pct-card-meta">
            <FiClock size={12} aria-hidden="true" />
            <span>{tip.readTime} min · {capitalize(tip.difficulty)}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export const SponsoredCard = ({ advert }) => (
  <motion.article className="pct-card pct-card-sponsored" {...cardMotion}>
    <a
      href={advert.link}
      className="pct-card-link"
      target={advert.link.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
    >
      <div className="pct-card-strip" style={{ background: "#B4B2A9" }} />
      <div className="pct-card-img pct-card-img-sponsored">
        {advert.image ? (
          <img src={advert.image} alt={advert.title} loading="lazy" />
        ) : (
          <FiExternalLink size={26} style={{ color: "#888780", opacity: 0.5 }} aria-hidden="true" />
        )}
      </div>
      <div className="pct-card-body">
        <div className="pct-badges">
          <span className="pct-badge pct-badge-sponsored">Sponsored</span>
        </div>
        <h3 className="pct-card-title">{advert.title}</h3>
        <div className="pct-card-meta">
          <FiExternalLink size={12} aria-hidden="true" />
          <span>Learn more</span>
        </div>
      </div>
    </a>
  </motion.article>
);

export default TipCard;
