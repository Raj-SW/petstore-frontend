import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import { FaPaw } from "react-icons/fa";
import tipsApi from "../../Services/api/tipsApi";
import advertsApi from "../../Services/api/advertsApi";
import { useToast } from "../../context/ToastContext";
import TipCard, { SponsoredCard } from "./components/TipCard";
import FeaturedSection from "./components/FeaturedSection";
import AnimalStrip from "./components/AnimalStrip";
import CategoryChips from "./components/CategoryChips";
import AdvertBanner from "./components/AdvertBanner";
import "./PetCareTips.css";

const SPONSORED_EVERY = 5; // inject a sponsored card after every 5th tip

const PetCareTipsPage = () => {
  const [tips, setTips] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [bannerAds, setBannerAds] = useState([]);
  const [sponsoredAds, setSponsoredAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animalType, setAnimalType] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { addToast } = useToast();
  const debounceRef = useRef(null);

  // Debounce search input → API param
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Featured + adverts: once on mount
  useEffect(() => {
    (async () => {
      try {
        const [featRes, bannerRes, sponsoredRes] = await Promise.all([
          tipsApi.getTips({ featured: true, limit: 3 }),
          advertsApi.getAdverts("banner"),
          advertsApi.getAdverts("sponsored"),
        ]);
        setFeatured(featRes.data || []);
        setBannerAds(bannerRes.data || []);
        setSponsoredAds(sponsoredRes.data || []);
      } catch {
        // Featured/ads failing shouldn't block the page; grid fetch shows its own toast
      }
    })();
  }, []);

  // Grid: refetch on filter/search change
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await tipsApi.getTips({
          animalType,
          category,
          search: debouncedSearch,
          limit: 30,
        });
        setTips(res.data || []);
      } catch {
        addToast("Failed to load tips", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [animalType, category, debouncedSearch, addToast]);

  // Interleave sponsored cards into the grid
  const gridItems = useMemo(() => {
    const items = [];
    let adIndex = 0;
    tips.forEach((tip, i) => {
      items.push({ type: "tip", data: tip });
      if ((i + 1) % SPONSORED_EVERY === 0 && sponsoredAds.length > 0) {
        items.push({ type: "ad", data: sponsoredAds[adIndex % sponsoredAds.length] });
        adIndex += 1;
      }
    });
    return items;
  }, [tips, sponsoredAds]);

  return (
    <div className="pct-page">
      {/* Hero */}
      <header className="pct-hero">
        <FaPaw className="pct-hero-paw" aria-hidden="true" />
        <motion.p
          className="pct-hero-label"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          Expert knowledge, for every pet
        </motion.p>
        <motion.h1
          className="pct-hero-title"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          Care tips written with love, for every animal you love
        </motion.h1>
        <motion.p
          className="pct-hero-sub"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          From golden retrievers to bearded dragons — trusted advice tailored to
          your pet&apos;s breed, age, and needs.
        </motion.p>
        <motion.div
          className="pct-search"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
        >
          <FiSearch size={17} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by pet, breed, or topic…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search tips"
          />
        </motion.div>
      </header>

      <div className="pct-content">
        <AnimalStrip selected={animalType} onSelect={setAnimalType} />

        {!debouncedSearch && !animalType && !category && (
          <FeaturedSection tips={featured} />
        )}

        <AdvertBanner advert={bannerAds[0]} />

        <section className="pct-section">
          <div className="pct-eyebrow">Browse all tips</div>
          <CategoryChips selected={category} onSelect={setCategory} />

          {loading ? (
            <div className="pct-empty">Loading tips…</div>
          ) : gridItems.length === 0 ? (
            <div className="pct-empty">
              No tips found — try a different filter or search term.
            </div>
          ) : (
            <div className="pct-grid">
              {gridItems.map((item, i) =>
                item.type === "tip" ? (
                  <TipCard key={item.data._id} tip={item.data} />
                ) : (
                  <SponsoredCard key={`ad-${i}`} advert={item.data} />
                )
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PetCareTipsPage;
