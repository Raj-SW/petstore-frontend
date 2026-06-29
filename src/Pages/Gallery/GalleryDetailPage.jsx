import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCalendar, FiMapPin, FiArrowLeft } from "react-icons/fi";
import galleryApi from "../../Services/api/galleryApi";
import advertsApi from "../../Services/api/advertsApi";
import RichTextRenderer from "../../Components/RichText/RichTextRenderer";
import Breadcrumb from "../../Components/HelperComponents/Breadcrumb/Breadcrumb";
import AdvertBanner from "../PetCareTips/components/AdvertBanner";
import { getCategoryTheme, formatEventDate } from "./galleryTheme";
import { coverUrl } from "../../utils/coverImage";
import "./GalleryDetail.css";

const GalleryDetailPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [sidebarAd, setSidebarAd] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | notfound

  useEffect(() => {
    let active = true;
    (async () => {
      setStatus("loading");
      try {
        const [res, adRes] = await Promise.all([
          galleryApi.getPost(slug),
          advertsApi.getAdverts("sponsored").catch(() => ({ data: [] })),
        ]);
        if (!active) return;
        setPost(res.data);
        setRelated(res.related || []);
        setSidebarAd((adRes.data || [])[0] || null);
        setStatus("ready");
      } catch {
        if (active) setStatus("notfound");
      }
    })();
    return () => { active = false; };
  }, [slug]);

  if (status === "loading") {
    return <div className="gald-state">Loading…</div>;
  }
  if (status === "notfound" || !post) {
    return (
      <div className="gald-state">
        <p>This post could not be found.</p>
        <Link to="/gallery" className="gald-back"><FiArrowLeft size={14} /> Back to Gallery</Link>
      </div>
    );
  }

  const theme = getCategoryTheme(post.category);

  return (
    <div className="gald-page">
      <div className="gald-breadcrumb" style={{ maxWidth: "1100px", margin: "0 auto", padding: "1rem 1.5rem 0" }}>
        <Breadcrumb items={[{ label: "Home", path: "/" }, { label: "Gallery", path: "/gallery" }, { label: post.title }]} />
      </div>
      <div className="gald-cover" style={coverUrl(post.coverImage) ? { backgroundImage: `url(${coverUrl(post.coverImage)})` } : { background: `linear-gradient(135deg, ${theme.color}, #0f3d2a)` }}>
        <span className="gal-card-pill" style={{ background: theme.color }}>
          {post.featured ? "★ " : ""}{theme.label}
        </span>
      </div>

      <div className="gald-layout">
        <motion.article
          className="gald-article"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Link to="/gallery" className="gald-back"><FiArrowLeft size={14} /> Back to Gallery</Link>
          <span className="gald-eyebrow" style={{ color: theme.color }}>{theme.label}</span>
          <h1 className="gald-title">{post.title}</h1>
          <div className="gald-meta">
            {post.eventDate && <span><FiCalendar size={13} aria-hidden="true" /> {formatEventDate(post.eventDate)}</span>}
            {post.location && <span><FiMapPin size={13} aria-hidden="true" /> {post.location}</span>}
          </div>
          {post.tags?.length > 0 && (
            <div className="gald-tags">
              {post.tags.map((t) => <span key={t} className="gald-tag">#{t}</span>)}
            </div>
          )}
          <RichTextRenderer content={post.body} className="gald-body" />

          {Array.isArray(post.sections) && post.sections.length > 0 && (
            <div className="gald-sections">
              {[...post.sections]
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((s, i) => (
                  <section key={s.heading ? `${s.heading}-${i}` : i} className="gald-section">
                    {s.heading && <h2 className="gald-section-heading">{s.heading}</h2>}
                    {Array.isArray(s.images) && s.images.length > 0 && (
                      <div className="gald-section-images">
                        {s.images.map((img, j) => (
                          <img key={typeof img === "object" ? img.url || j : img} src={typeof img === "object" ? img.url : img} alt={s.heading || `Section image ${j + 1}`} loading="lazy" />
                        ))}
                      </div>
                    )}
                    {s.body && <RichTextRenderer content={s.body} className="gald-body" />}
                  </section>
                ))}
            </div>
          )}
        </motion.article>

        <aside className="gald-sidebar">
          <div className="gald-side-card">
            <h3 className="gald-side-h">Event details</h3>
            <ul className="gald-side-list">
              {post.eventDate && <li><FiCalendar size={13} aria-hidden="true" /> {formatEventDate(post.eventDate)}</li>}
              {post.location && <li><FiMapPin size={13} aria-hidden="true" /> {post.location}</li>}
              {post.tags?.length > 0 && <li>{post.tags.map((t) => `#${t}`).join(" ")}</li>}
            </ul>
          </div>

          {sidebarAd && (
            <div className="gald-side-ad"><AdvertBanner advert={sidebarAd} /></div>
          )}

          {related.length > 0 && (
            <div className="gald-side-card">
              <h3 className="gald-side-h">More moments</h3>
              <div className="gald-related">
                {related.map((r) => (
                  <Link key={r._id} to={`/gallery/${r.slug || r._id}`} className="gald-related-row">
                    <span
                      className="gald-related-thumb"
                      style={coverUrl(r.coverImage) ? { backgroundImage: `url(${coverUrl(r.coverImage)})` } : { background: getCategoryTheme(r.category).color }}
                    />
                    <span className="gald-related-txt">
                      <b>{r.title}</b>
                      <small>{formatEventDate(r.eventDate)}</small>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default GalleryDetailPage;
