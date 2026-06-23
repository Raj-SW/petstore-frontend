import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiClock, FiCalendar, FiUser, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import tipsApi from "../../Services/api/tipsApi";
import advertsApi from "../../Services/api/advertsApi";
import { RichTextRenderer } from "../../Components/RichText";
import Breadcrumb from "../../Components/HelperComponents/Breadcrumb/Breadcrumb";
import { getAnimalTheme, capitalize } from "./tipTheme";
import { coverUrl } from "../../utils/coverImage";
import "./TipDetail.css";

const TipDetailPage = () => {
  const { slug } = useParams();
  const [tip, setTip] = useState(null);
  const [related, setRelated] = useState([]);
  const [advert, setAdvert] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | notfound

  useEffect(() => {
    (async () => {
      try {
        setStatus("loading");
        window.scrollTo(0, 0);
        const res = await tipsApi.getTip(slug);
        const loaded = res.data;
        setTip(loaded);
        setStatus("ready");

        const [relRes, adRes] = await Promise.all([
          tipsApi.getTips({ animalType: loaded.animalType, exclude: loaded._id, limit: 3 }),
          advertsApi.getAdverts("sponsored"),
        ]);
        setRelated(relRes.data || []);
        setAdvert((adRes.data || [])[0] || null);
      } catch {
        setStatus("notfound");
      }
    })();
  }, [slug]);

  if (status === "loading") {
    return <div className="ptd-state">Loading tip…</div>;
  }
  if (status === "notfound") {
    return (
      <div className="ptd-state">
        <p>Tip not found.</p>
        <Link to="/pet-care-tips" className="ptd-back">
          <FiArrowLeft size={14} aria-hidden="true" /> Back to tips
        </Link>
      </div>
    );
  }

  const theme = getAnimalTheme(tip.animalType);
  const Icon = theme.icon;

  return (
    <motion.div
      className="ptd-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Breadcrumb */}
      <div className="ptd-breadcrumb">
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "Pet Care Tips", path: "/pet-care-tips" },
            { label: theme.label },
            { label: capitalize(tip.category) },
          ]}
        />
      </div>

      {/* Cover hero */}
      <div className="ptd-cover" style={{ background: theme.tint }}>
        {coverUrl(tip.coverImage) ? (
          <img src={coverUrl(tip.coverImage)} alt="" className="ptd-cover-img" />
        ) : (
          <Icon className="ptd-cover-icon" style={{ color: theme.color }} aria-hidden="true" />
        )}
        <div className="ptd-cover-overlay">
          <div className="ptd-badges">
            <span className="ptd-badge" style={{ background: theme.tint, color: theme.color }}>
              {theme.label}
            </span>
            <span className="ptd-badge ptd-badge-amber">{capitalize(tip.category)}</span>
            {tip.breed && <span className="ptd-badge ptd-badge-amber">{tip.breed}</span>}
            <span className="ptd-badge ptd-badge-amber">{capitalize(tip.difficulty)}</span>
          </div>
          <h1 className="ptd-title">{tip.title}</h1>
        </div>
      </div>

      {/* Body */}
      <div className="ptd-layout">
        <article className="ptd-article">
          <div className="ptd-meta">
            <span><FiClock size={13} aria-hidden="true" /> {tip.readTime} min read</span>
            <span>
              <FiCalendar size={13} aria-hidden="true" />{" "}
              {new Date(tip.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </span>
            <span><FiUser size={13} aria-hidden="true" /> VitalPaws team</span>
          </div>
          <RichTextRenderer content={tip.body} className="ptd-body" />

          {Array.isArray(tip.sections) && tip.sections.length > 0 && (
            <div className="ptd-sections">
              {[...tip.sections]
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((s, i) => (
                  <section key={i} className="ptd-section">
                    {s.heading && <h2 className="ptd-section-heading">{s.heading}</h2>}
                    {Array.isArray(s.images) && s.images.length > 0 && (
                      <div className="ptd-section-images">
                        {s.images.map((img, j) => (
                          <img key={j} src={typeof img === "object" ? img.url : img} alt={s.heading || `Section image ${j + 1}`} loading="lazy" />
                        ))}
                      </div>
                    )}
                    {s.body && <RichTextRenderer content={s.body} className="ptd-body" />}
                  </section>
                ))}
            </div>
          )}
        </article>

        <aside className="ptd-sidebar">
          <div className="ptd-side-card">
            <p className="ptd-side-title">About this tip</p>
            <dl className="ptd-facts">
              <div><dt>Animal</dt><dd>{theme.label}</dd></div>
              {tip.breed && <div><dt>Breed</dt><dd>{tip.breed}</dd></div>}
              <div><dt>Category</dt><dd>{capitalize(tip.category)}</dd></div>
              <div><dt>Difficulty</dt><dd>{capitalize(tip.difficulty)}</dd></div>
              <div><dt>Read time</dt><dd>{tip.readTime} min</dd></div>
            </dl>
          </div>

          {advert && (
            <a
              href={advert.link}
              className="ptd-side-card ptd-ad"
              target={advert.link.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
            >
              <p className="ptd-ad-tag">Sponsored</p>
              {advert.image && <img src={advert.image} alt="" className="ptd-ad-img" loading="lazy" />}
              <p className="ptd-ad-title">{advert.title}</p>
              <span className="ptd-ad-cta">
                Shop now <FiArrowRight size={12} aria-hidden="true" />
              </span>
            </a>
          )}

          {related.length > 0 && (
            <div className="ptd-side-card">
              <p className="ptd-side-title">You might also like</p>
              {related.map((r) => {
                const rTheme = getAnimalTheme(r.animalType);
                const RIcon = rTheme.icon;
                return (
                  <Link key={r._id} to={`/pet-care-tips/${r.slug || r._id}`} className="ptd-related">
                    <span className="ptd-related-thumb" style={{ background: rTheme.tint }}>
                      <RIcon size={16} style={{ color: rTheme.color }} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="ptd-related-title">{r.title}</span>
                      <span className="ptd-related-meta">
                        {rTheme.label} · {capitalize(r.category)} · {r.readTime} min
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </motion.div>
  );
};

export default TipDetailPage;
