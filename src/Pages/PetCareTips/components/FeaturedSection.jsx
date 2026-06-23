import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiClock } from "react-icons/fi";
import { getAnimalTheme, capitalize } from "../tipTheme";
import { coverUrl } from "../../../utils/coverImage";

const FeaturedSection = ({ tips }) => {
  if (!tips || tips.length === 0) return null;
  const [main, ...rest] = tips;
  const mainTheme = getAnimalTheme(main.animalType);
  const MainIcon = mainTheme.icon;

  return (
    <section className="pct-section">
      <div className="pct-eyebrow">Featured this week</div>
      <div className="pct-featured-layout">
        <motion.div
          className="pct-feat-main pct-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to={`/pet-care-tips/${main.slug || main._id}`} className="pct-card-link">
            <div className="pct-feat-main-img" style={{ background: mainTheme.tint }}>
              <span className="pct-badge pct-feat-float">Featured</span>
              {coverUrl(main.coverImage) ? (
                <img src={coverUrl(main.coverImage)} alt={main.title} />
              ) : (
                <MainIcon size={56} style={{ color: mainTheme.color, opacity: 0.3 }} aria-hidden="true" />
              )}
            </div>
            <div className="pct-card-body">
              <div className="pct-badges">
                <span className="pct-badge" style={{ background: mainTheme.tint, color: mainTheme.color }}>
                  {mainTheme.label}
                </span>
                <span className="pct-badge pct-badge-cat">{main.category}</span>
                <span className="pct-badge pct-badge-cat">{capitalize(main.difficulty)}</span>
              </div>
              <h3 className="pct-feat-title">{main.title}</h3>
              <div className="pct-card-meta">
                <FiClock size={12} aria-hidden="true" />
                <span>{main.readTime} min read{main.breed ? ` · ${main.breed}` : ""}</span>
              </div>
            </div>
          </Link>
        </motion.div>

        <div className="pct-feat-stack">
          {rest.slice(0, 2).map((tip, i) => {
            const theme = getAnimalTheme(tip.animalType);
            const Icon = theme.icon;
            return (
              <motion.div
                key={tip._id}
                className="pct-feat-small pct-card"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.12 * (i + 1) }}
              >
                <Link to={`/pet-care-tips/${tip.slug || tip._id}`} className="pct-card-link pct-feat-small-link">
                  <div className="pct-feat-small-img" style={{ background: theme.tint }}>
                    {coverUrl(tip.coverImage) ? (
                      <img src={coverUrl(tip.coverImage)} alt={tip.title} loading="lazy" />
                    ) : (
                      <Icon size={26} style={{ color: theme.color, opacity: 0.4 }} aria-hidden="true" />
                    )}
                  </div>
                  <div className="pct-feat-small-body">
                    <div className="pct-badges">
                      <span className="pct-badge" style={{ background: theme.tint, color: theme.color }}>
                        {theme.label}
                      </span>
                      <span className="pct-badge pct-badge-cat">{tip.category}</span>
                    </div>
                    <h3 className="pct-feat-small-title">{tip.title}</h3>
                    <div className="pct-card-meta">
                      <FiClock size={11} aria-hidden="true" />
                      <span>{tip.readTime} min · {capitalize(tip.difficulty)}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
