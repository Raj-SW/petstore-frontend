import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaFilter, FaTimes, FaSearch } from "react-icons/fa";

import ProductCard from "../../Components/HelperComponents/ProductCard/ProductCardV2";
import SortDropDown from "@/Components/HelperComponents/SortDropDown/SortDropDown";
import Breadcrumb from "@/Components/HelperComponents/Breadcrumb/Breadcrumb";
import SearchBar from "@/Components/HelperComponents/SearchBar/SearchBar";
import FilterComponent from "./FilterComponent";
import ProductService from "@/Services/localServices/ProductService";
import petshopBanner from "@/assets/PetShopPageAssets/PetshopBannerBackgroundImg.png";
import "./PetShopPage.css";

const PER_PAGE_OPTIONS = [25, 50, 100];
const QUICK_CATS = ["All", "Dog", "Cat", "Bird", "Fish", "Small Pets", "General"];

const PetShopPage = () => {
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [totalPages, setTotalPages] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCat, setActiveCat] = useState("All");

  // ── Data loading ──
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    ProductService.fetchAllProducts({
      page: currentPage,
      limit: perPage,
      sort: "-createdAt",
    })
      .then(({ products: data, pagination }) => {
        const transformed = data.map((p) => ({ ...p, id: p._id || p.id }));
        setProducts(transformed);
        setDisplayedProducts(transformed);
        setTotalPages(pagination.pages);
        setIsLoading(false);

        const query = searchParams.get("search");
        if (query) handleSearch(query);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError(err.message);
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, perPage, searchParams]);

  // ── Handlers ──
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (query) => {
    if (!query?.trim()) {
      setDisplayedProducts(products);
      setCurrentPage(1);
      setTotalPages(Math.ceil(products.length / perPage));
      return;
    }
    ProductService.fetchAllProducts({ search: query, page: 1, limit: perPage })
      .then(({ products: data, pagination }) => {
        const transformed = data.map((p) => ({ ...p, id: p._id || p.id }));
        setDisplayedProducts(transformed);
        setCurrentPage(1);
        setTotalPages(pagination.pages);
      })
      .catch((err) => setError(err.message));
  };

  const handleApplyFilters = ({ minPrice, maxPrice, categories, rating }) => {
    const priceFilters = {};
    if (minPrice && minPrice > 0) priceFilters.minPrice = minPrice;
    if (maxPrice && maxPrice < Infinity) priceFilters.maxPrice = maxPrice;

    ProductService.fetchProductsWithFilters(
      {
        category: categories.length > 0 ? categories[0] : undefined,
        ...priceFilters,
        minRating: rating || undefined,
      },
      { page: 1, limit: perPage }
    )
      .then(({ products: data, pagination }) => {
        const transformed = data.map((p) => ({ ...p, id: p._id || p.id }));
        setDisplayedProducts(transformed);
        setCurrentPage(1);
        setTotalPages(pagination.pages);
        setDrawerOpen(false);
      })
      .catch((err) => setError(err.message));
  };

  const handleCategoryClick = (cat) => {
    setActiveCat(cat);
    if (cat === "All") {
      handleApplyFilters({ minPrice: 0, maxPrice: Infinity, categories: [], rating: 0 });
    } else {
      handleApplyFilters({ minPrice: 0, maxPrice: Infinity, categories: [cat.toLowerCase()], rating: 0 });
    }
  };

  const handleSort = (sortType) => {
    const sortMap = {
      priceAsc: "price",
      priceDesc: "-price",
      alphabeticalAsc: "name",
      alphabeticalDesc: "-name",
    };
    const sortParam = sortMap[sortType] || "-createdAt";
    ProductService.fetchProductsWithFilters(
      {},
      { page: currentPage, limit: perPage, sort: sortParam }
    )
      .then(({ products: data, pagination }) => {
        setDisplayedProducts(data.map((p) => ({ ...p, id: p._id || p.id })));
        setTotalPages(pagination.pages);
      })
      .catch((err) => setError(err.message));
  };

  // ── Pagination ──
  const buildPaginationItems = () => {
    const items = [];
    const maxShow = 4;
    for (let i = 1; i <= Math.min(maxShow, totalPages); i++) items.push(i);
    if (totalPages > maxShow + 1) items.push("ellipsis");
    if (totalPages > maxShow) items.push(totalPages);
    return items;
  };

  // ── Render states ──
  const renderGrid = () => {
    if (isLoading) {
      return (
        <div className="ps-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="ps-skeleton" />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="ps-state">
          <FaTimes size={40} />
          <h3>Something went wrong</h3>
          <p>{error}</p>
        </div>
      );
    }

    if (displayedProducts.length === 0) {
      return (
        <div className="ps-state">
          <FaSearch size={40} />
          <h3>No products found</h3>
          <p>Try adjusting your filters or search query.</p>
        </div>
      );
    }

    return (
      <motion.div
        key={currentPage}
        className="ps-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        {displayedProducts.map((p, i) => (
          <motion.div
            key={p.id || i}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: Math.min(i * 0.05, 0.5) }}
          >
            <ProductCard
              id={p.id}
              imageUrl={p.images?.[0]?.url || (typeof p.images?.[0] === 'string' ? p.images[0] : null) || p.imageUrl}
              title={p.name || p.title}
              price={p.price}
              description={p.description}
            />
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <>
      {/* ── Hero ── */}
      <section
        className="ps-hero"
        style={{ backgroundImage: `url(${petshopBanner})` }}
      >
        <div className="ps-hero-overlay" />
        <div className="ps-hero-inner">
          <Breadcrumb
            items={[
              { label: "Home", path: "/" },
              { label: "Pet Shop", path: "/petshop" },
            ]}
          />
          <motion.h1
            className="ps-hero-title"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Everything for your{" "}
            <span className="ps-hero-accent">beloved pet</span>
          </motion.h1>
          <motion.p
            className="ps-hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
          >
            Curated essentials, premium nutrition, and unique finds — all in one place.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <SearchBar showInPages={["/petshop"]} />
          </motion.div>
        </div>
      </section>

      {/* ── Category quick-filter strip ── */}
      <div className="ps-cat-strip">
        <div className="ps-cat-strip-inner">
          {QUICK_CATS.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`ps-cat-chip${activeCat === cat ? " ps-cat-chip--active" : ""}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main body ── */}
      <section className="ps-body">
        <div className="ps-body-inner">

          {/* Desktop sidebar */}
          <aside className="ps-sidebar">
            <FilterComponent onApplyFilters={handleApplyFilters} />
          </aside>

          {/* Products column */}
          <div className="ps-main">
            <div className="ps-toolbar">
              <div className="ps-toolbar-left">
                <h2 className="ps-section-title">
                  {activeCat === "All" ? "All Products" : activeCat}
                </h2>
                <span className="ps-result-count">
                  {isLoading ? "Loading…" : `${displayedProducts.length} items`}
                </span>
              </div>
              <div className="ps-toolbar-right">
                <label className="ps-perpage">
                  <span>Show</span>
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    aria-label="Products per page"
                  >
                    {PER_PAGE_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <SortDropDown onSort={handleSort} />
                <button
                  type="button"
                  className="ps-filter-mobile-btn"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open filters"
                >
                  <FaFilter size={14} />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {renderGrid()}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="ps-pagination">
                <button
                  type="button"
                  className="ps-page-btn ps-page-arrow"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  &#8592;
                </button>

                {buildPaginationItems().map((item, idx) =>
                  item === "ellipsis" ? (
                    <span key={`e-${idx}`} className="ps-page-ellipsis">…</span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      className={`ps-page-btn${item === currentPage ? " ps-page-btn--active" : ""}`}
                      onClick={() => handlePageChange(item)}
                    >
                      {item}
                    </button>
                  )
                )}

                <button
                  type="button"
                  className="ps-page-btn ps-page-arrow"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  &#8594;
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Mobile filter drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="ps-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              className="ps-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="ps-drawer-header">
                <h3>Filters</h3>
                <button
                  type="button"
                  className="ps-drawer-close"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close"
                >
                  <FaTimes size={18} />
                </button>
              </div>
              <div className="ps-drawer-body">
                <FilterComponent onApplyFilters={handleApplyFilters} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PetShopPage;
