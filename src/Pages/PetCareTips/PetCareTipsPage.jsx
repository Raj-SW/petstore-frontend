import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import PageHero from "../../Components/HelperComponents/PageHero/PageHero";
import HeroSearch from "../../Components/HelperComponents/HeroSearch/HeroSearch";
import heroImg from "../../assets/StatsSection/vet-with-dog.jpg";
import tipsApi from "../../Services/api/tipsApi";
import advertsApi from "../../Services/api/advertsApi";
import { useToast } from "../../context/ToastContext";
import TipCard, { SponsoredCard } from "./components/TipCard";
import FeaturedSection from "./components/FeaturedSection";
import AnimalStrip from "./components/AnimalStrip";
import CategoryChips from "./components/CategoryChips";
import AdvertBanner from "./components/AdvertBanner";
import SkeletonCard from "../../Components/HelperComponents/SkeletonCard/SkeletonCard";
import useSEO from "../../hooks/useSEO";
import "./PetCareTips.css";

const SPONSORED_EVERY = 5; // inject a sponsored card after every 5th tip

const PetCareTipsPage = () => {
  useSEO("Pet Care Tips", "Browse expert pet care tips for dogs, cats, birds and more from the VitalPaws team in Mauritius.");
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

  let tipsGridContent;
  if (loading) {
    tipsGridContent = <div className="pct-grid"><SkeletonCard variant="card" count={6} /></div>;
  } else if (gridItems.length === 0) {
    tipsGridContent = (
      <div className="pct-empty">
        No tips found — try a different filter or search term.
      </div>
    );
  } else {
    tipsGridContent = (
      <div className="pct-grid">
        {gridItems.map((item, i) =>
          item.type === "tip" ? (
            <TipCard key={item.data._id} tip={item.data} />
          ) : (
            <SponsoredCard key={item.data?._id ? `ad-${item.data._id}` : `ad-${i}`} advert={item.data} />
          )
        )}
      </div>
    );
  }

  return (
    <div className="pct-page">
      {/* Hero — shared PageHero standard (Services-page treatment) */}
      <PageHero
        compact
        image={heroImg}
        title="Pet Care Tips"
        subtitle="Advice written with"
        script="love"
        tagline="From golden retrievers to bearded dragons — trusted advice tailored to your pet's breed, age, and needs."
      >
        <HeroSearch
          value={search}
          onChange={setSearch}
          placeholder="Search by pet, breed, or topic…"
          ariaLabel="Search tips"
        />
      </PageHero>

      <div className="pct-content">
        <AnimalStrip selected={animalType} onSelect={setAnimalType} />

        {!debouncedSearch && !animalType && !category && (
          <FeaturedSection tips={featured} />
        )}

        <AdvertBanner advert={bannerAds[0]} />

        <section className="pct-section">
          <div className="pct-eyebrow">Browse all tips</div>
          <CategoryChips selected={category} onSelect={setCategory} />

          {tipsGridContent}
        </section>
      </div>
    </div>
  );
};

export default PetCareTipsPage;
