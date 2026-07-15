import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FiCalendar, FiMapPin, FiArrowRight } from "react-icons/fi";
import galleryApi from "../../Services/api/galleryApi";
import advertsApi from "../../Services/api/advertsApi";
import { useToast } from "../../context/ToastContext";
import { Link } from "react-router-dom";
import GalleryCard from "./components/GalleryCard";
import PageHero from "../../Components/HelperComponents/PageHero/PageHero";
import HeroSearch from "../../Components/HelperComponents/HeroSearch/HeroSearch";
import heroImg from "../../assets/StatsSection/slide-2-a.webp";
import AdvertBanner from "../PetCareTips/components/AdvertBanner";
import { GALLERY_CATEGORIES, getCategoryTheme, formatEventDate } from "./galleryTheme";
import { coverUrl } from "../../utils/coverImage";
import SkeletonCard from "../../Components/HelperComponents/SkeletonCard/SkeletonCard";
import useSEO from "../../hooks/useSEO";
import "./Gallery.css";

const FeaturedHero = ({ post }) => {
  if (!post) return null;
  const theme = getCategoryTheme(post.category);
  return (
    <motion.div
      className="gal-hero-feature"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/gallery/${post.slug || post._id}`} className="gal-hero-feature-link">
        <div
          className="gal-hero-feature-img"
          style={coverUrl(post.coverImage) ? { backgroundImage: `url(${coverUrl(post.coverImage)})` } : { background: `linear-gradient(135deg, ${theme.color}, #0f3d2a)` }}
        >
          <span className="gal-card-pill" style={{ background: theme.color }}>★ Featured · {theme.label}</span>
        </div>
        <div className="gal-hero-feature-body">
          <h2 className="gal-hero-feature-title">{post.title}</h2>
          <div className="gal-card-meta">
            {post.eventDate && <span><FiCalendar size={13} aria-hidden="true" /> {formatEventDate(post.eventDate)}</span>}
            {post.location && <span><FiMapPin size={13} aria-hidden="true" /> {post.location}</span>}
          </div>
          {post.excerpt && <p className="gal-hero-feature-excerpt">{post.excerpt}</p>}
          <span className="gal-hero-feature-cta">Read the story <FiArrowRight size={14} aria-hidden="true" /></span>
        </div>
      </Link>
    </motion.div>
  );
};

const GalleryPage = () => {
  useSEO("Gallery", "See VitalPaws events, awards, and community moments from our veterinary clinic in Mauritius.");
  const [posts, setPosts] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [bannerAd, setBannerAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { addToast } = useToast();
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Featured + advert: once on mount
  useEffect(() => {
    (async () => {
      try {
        const [featRes, bannerRes] = await Promise.all([
          galleryApi.getPosts({ featured: true, limit: 1 }),
          advertsApi.getAdverts("banner"),
        ]);
        setFeatured((featRes.data || [])[0] || null);
        setBannerAd((bannerRes.data || [])[0] || null);
      } catch {
        // non-blocking
      }
    })();
  }, []);

  // Grid: refetch on filter/search change
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await galleryApi.getPosts({ category, search: debouncedSearch, limit: 30 });
        setPosts(res.data || []);
      } catch {
        addToast("Failed to load gallery posts", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [category, debouncedSearch, addToast]);

  const showFeatured = !debouncedSearch && !category && featured;

  let galleryContent;
  if (loading) {
    galleryContent = (
      <div className="gal-grid">
        <SkeletonCard variant="card" count={6} />
      </div>
    );
  } else if (posts.length === 0) {
    galleryContent = <div className="gal-empty">No posts found — try a different filter or search term.</div>;
  } else {
    galleryContent = (
      <div className="gal-grid">
        {posts.map((post) => <GalleryCard key={post._id} post={post} />)}
      </div>
    );
  }

  return (
    <div className="gal-page">
      <PageHero
        compact
        image={heroImg}
        title="Gallery"
        subtitle="The moments that make our"
        script="community"
        tagline="Events, adoption drives and milestones from the VitalPaws family."
      >
        <HeroSearch
          value={search}
          onChange={setSearch}
          placeholder="Search moments…"
          ariaLabel="Search gallery"
        />
      </PageHero>

      <div className="gal-content">
        {/* Category chips */}
        <div className="gal-chips" role="tablist" aria-label="Filter by category">
          <button className={`gal-chip${category === "" ? " is-active" : ""}`} onClick={() => setCategory("")}>All</button>
          {GALLERY_CATEGORIES.map((c) => (
            <button
              key={c.key}
              className={`gal-chip${category === c.key ? " is-active" : ""}`}
              onClick={() => setCategory(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {showFeatured && <FeaturedHero post={featured} />}

        {bannerAd && <AdvertBanner advert={bannerAd} />}

        <section className="gal-section">
          {galleryContent}
        </section>
      </div>
    </div>
  );
};

export default GalleryPage;
