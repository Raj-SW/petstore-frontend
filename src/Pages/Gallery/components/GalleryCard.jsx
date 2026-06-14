import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCalendar, FiMapPin } from "react-icons/fi";
import { getCategoryTheme, formatEventDate } from "../galleryTheme";

const cardMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.45, ease: "easeOut" },
};

const GalleryCard = ({ post }) => {
  const theme = getCategoryTheme(post.category);

  return (
    <motion.article className="gal-card" {...cardMotion}>
      <Link to={`/gallery/${post.slug || post._id}`} className="gal-card-link">
        <div
          className="gal-card-img"
          style={post.coverImage ? undefined : { background: `linear-gradient(135deg, ${theme.color} 0%, #0f3d2a 130%)` }}
        >
          {post.coverImage ? (
            <img src={post.coverImage} alt={post.title} loading="lazy" />
          ) : null}
          <span className="gal-card-pill" style={{ background: theme.color }}>
            {post.featured ? "★ " : ""}{theme.label}
          </span>
        </div>
        <div className="gal-card-body">
          <h3 className="gal-card-title">{post.title}</h3>
          <div className="gal-card-meta">
            {post.eventDate && (
              <span><FiCalendar size={12} aria-hidden="true" /> {formatEventDate(post.eventDate)}</span>
            )}
            {post.location && (
              <span><FiMapPin size={12} aria-hidden="true" /> {post.location}</span>
            )}
          </div>
          {post.excerpt && <p className="gal-card-excerpt">{post.excerpt}</p>}
        </div>
      </Link>
    </motion.article>
  );
};

export default GalleryCard;
