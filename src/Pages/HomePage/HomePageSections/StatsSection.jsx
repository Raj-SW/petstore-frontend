import { useState, useEffect, useRef } from "react";
import {
  motion, AnimatePresence, useInView, useReducedMotion, animate,
} from "framer-motion";
import { FaPaw, FaStar, FaRegStar } from "react-icons/fa";
import feedbackApi from "../../../Services/api/feedbackApi";
import vetWithDogImg from "../../../assets/StatsSection/vet-with-dog.jpg";
import "./StatsSection.css";

const ease = [0.25, 0.46, 0.45, 0.94];
const toPhotoUrl = (p) => (typeof p === "string" ? p : p?.url);

// Fallback when the API errors or returns nothing (kept from the old section).
const TESTIMONIALS = [
  { id: 1, author: "John Corner, Melbourne", rating: 5,
    text: "So far, this pet shop has proven to be the best in the area when it comes to providing expert and reliable services for pet owners. Their team operates with genuine care and passion." },
  { id: 2, author: "Sarah Mitchell, Sydney", rating: 5,
    text: "I've been bringing my golden retriever here for over two years. The staff is knowledgeable, kind, and truly passionate about what they do. Couldn't recommend them more." },
  { id: 3, author: "David Lim, Auckland", rating: 5,
    text: "The grooming service is exceptional and my cat actually enjoys going there now. The products are top-notch and the team always gives the best advice." },
  { id: 4, author: "Priya Nair, Wellington", rating: 5,
    text: "Absolutely love this place. From the moment we walked in, the team made both me and my rabbit feel welcome. The care they provide is second to none." },
  { id: 5, author: "James Okafor, Brisbane", rating: 5,
    text: "Five stars without hesitation. The veterinary team diagnosed my dog quickly and the follow-up care was outstanding. This is the only pet store I'll ever trust." },
];

// Placeholder truth — swap real figures here. value: null = live average rating.
const TRUST_STATS = [
  { value: 100, suffix: "+", decimals: 0, label: "Successful Relocations" },
  { value: 11, suffix: "", decimals: 0, label: "Certified Professionals" },
  { value: null, suffix: "★", decimals: 1, label: "Average Rating", fallback: 4.8 },
];

const AUTO_ADVANCE_MS = 7000;
const initialOf = (author = "") => (author.trim()[0] || "?").toUpperCase();
const firstNameOf = (author = "") => author.split(/[\s,]+/).filter(Boolean)[0] || "";

// Gold count-up numeral; renders the final value immediately under reduced motion.
const CountUp = ({ to, decimals, suffix }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const [val, setVal] = useState(reduced ? to : 0);
  useEffect(() => {
    if (!inView) return undefined;
    if (reduced) { setVal(to); return undefined; }
    const controls = animate(0, to, {
      duration: 1.2, ease, onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, reduced, to]);
  return (
    <span ref={ref} className="ts-stat-value">
      {val.toFixed(decimals)}{suffix}
    </span>
  );
};

const Stars = ({ rating, size = 14 }) => {
  if (!rating || rating <= 0) return null;
  const full = Math.round(rating);
  return (
    <span className="ts-stars" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) =>
        i < full
          ? <FaStar key={i} size={size} aria-hidden="true" />
          : <FaRegStar key={i} size={size} className="ts-star-empty" aria-hidden="true" />
      )}
    </span>
  );
};

const StatsSection = () => {
  const reduced = useReducedMotion();
  const [testimonials, setTestimonials] = useState(TESTIMONIALS);
  const [avgRating, setAvgRating] = useState(null);
  const [active, setActive] = useState(0);
  const [userTookControl, setUserTookControl] = useState(false);
  const [hovering, setHovering] = useState(false);

  const missionRef = useRef(null);
  const missionInView = useInView(missionRef, { once: true, amount: 0.3 });

  useEffect(() => {
    feedbackApi
      .getFeedback({ limit: 12 })
      .then((res) => {
        const items = res?.data;
        if (Array.isArray(items) && items.length > 0) {
          setTestimonials(
            items.map((fb, i) => ({
              id: fb._id || i,
              author: fb.role ? `${fb.name}, ${fb.role}` : fb.name,
              text: fb.message,
              rating: fb.rating,
              photos: (fb.photos || []).map(toPhotoUrl).filter(Boolean),
            }))
          );
          const rated = items.filter((fb) => Number(fb.rating) > 0);
          if (rated.length > 0) {
            setAvgRating(rated.reduce((s, fb) => s + Number(fb.rating), 0) / rated.length);
          }
        }
      })
      .catch(() => { /* keep hardcoded fallback */ });
  }, []);

  useEffect(() => {
    if (reduced || userTookControl || hovering || testimonials.length < 2) return undefined;
    const id = setInterval(
      () => setActive((i) => (i + 1) % testimonials.length),
      AUTO_ADVANCE_MS,
    );
    return () => clearInterval(id);
  }, [reduced, userTookControl, hovering, testimonials.length]);

  const pick = (i) => { setActive(i); setUserTookControl(true); };

  const featured = testimonials[active];
  const photo = featured?.photos?.[0];

  // Two drifting rows when there's enough material, otherwise one.
  const twoRows = testimonials.length >= 6;
  const rows = twoRows
    ? [testimonials.filter((_, i) => i % 2 === 0), testimonials.filter((_, i) => i % 2 === 1)]
    : [testimonials];

  const chip = (t) => {
    const i = testimonials.indexOf(t);
    return (
      <button
        key={t.id}
        type="button"
        className={`ts-chip${i === active ? " ts-chip--active" : ""}`}
        aria-pressed={i === active}
        onClick={() => pick(i)}
      >
        <Stars rating={t.rating} size={9} />
        {/* ponytail: active chip's quote is already shown in the featured note
            above — omitting it here avoids a byte-identical text collision
            with the blockquote when the message is short (<=60 chars). */}
        {i !== active && (
          <span className="ts-chip-quote">{t.text.slice(0, 60)}…</span>
        )}
        <span className="ts-chip-name">— {firstNameOf(t.author)}</span>
      </button>
    );
  };

  return (
    <section className="ts-band">
      {/* ── 1. Mission ── */}
      <div className="ts-mission" ref={missionRef}>
        <motion.div
          className="ts-mission-media"
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: -40 }}
          animate={missionInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease }}
        >
          <img src={vetWithDogImg} alt="Veterinarian examining a dog" loading="lazy" />
        </motion.div>
        <motion.div
          className="ts-mission-copy"
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: 40 }}
          animate={missionInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease }}
        >
          <p className="ts-eyebrow">Our Promise</p>
          <h2 className="ts-mission-heading">
            Your pets, at the heart of everything we do
          </h2>
          <p className="ts-mission-body">
            From grooming to wellness, we cover every aspect of your pet's
            needs. Our team stays updated on the latest in pet care to provide
            the best solutions for you and your furry friends.
          </p>
        </motion.div>
      </div>

      {/* ── 2. Trust strip ── */}
      <div className="ts-strip">
        {TRUST_STATS.map((s) => (
          <div key={s.label} className="ts-stat">
            <CountUp
              to={s.value ?? avgRating ?? s.fallback}
              decimals={s.decimals}
              suffix={s.suffix}
            />
            <span className="ts-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── 3. Wall of love ── */}
      <div
        className="ts-wall"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="ts-header">
          <div className="ts-deco" aria-hidden="true">
            <span className="ts-deco-line" />
            <FaPaw className="ts-deco-paw" />
            <span className="ts-deco-line" />
          </div>
          <h3 className="ts-title">What Our Clients Say</h3>
          <p className="ts-script">real words from real pet parents</p>
        </div>

        <div className="ts-note-stage" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.figure
              key={featured?.id ?? active}
              className="ts-note"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18, rotate: -1.5 }}
              animate={{ opacity: 1, y: 0, rotate: 0.5 }}
              exit={{ opacity: 0, y: -14, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <div className="ts-polaroid" aria-hidden="true">
                {photo ? (
                  <img src={photo} alt="" loading="lazy" />
                ) : (
                  <span className="ts-monogram" data-testid="ts-monogram">
                    {initialOf(featured?.author)}
                  </span>
                )}
              </div>
              <div className="ts-note-body">
                <Stars rating={featured?.rating} />
                <blockquote className="ts-quote">{featured?.text}</blockquote>
                <figcaption className="ts-author">— {featured?.author}</figcaption>
              </div>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="ts-dots">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              type="button"
              className={`ts-dot${i === active ? " ts-dot--active" : ""}`}
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => pick(i)}
            />
          ))}
        </div>

        <div className={`ts-marquee${reduced ? " ts-marquee--static" : ""}`}>
          {rows.map((row, r) => (
            <div key={r} className={`ts-row ts-row--${r === 1 ? "reverse" : "forward"}`}>
              <div className="ts-track">{row.map(chip)}</div>
              {!reduced && (
                <div className="ts-track" aria-hidden="true">
                  {row.map((t) => {
                    const i = testimonials.indexOf(t);
                    return (
                      <button
                        key={`dup-${t.id}`}
                        type="button"
                        tabIndex={-1}
                        className={`ts-chip${i === active ? " ts-chip--active" : ""}`}
                        onClick={() => pick(i)}
                      >
                        <Stars rating={t.rating} size={9} />
                        {i !== active && (
                          <span className="ts-chip-quote">{t.text.slice(0, 60)}…</span>
                        )}
                        <span className="ts-chip-name">— {firstNameOf(t.author)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
