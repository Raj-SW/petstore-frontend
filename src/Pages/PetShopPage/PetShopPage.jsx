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
import "./PetShopPage.css";

const PRODUCTS_PER_PAGE = 12;

const PetShopPage = () => {
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── Data loading ──
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    ProductService.fetchAllProducts({
      page: currentPage,
      limit: PRODUCTS_PER_PAGE,
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
  }, [currentPage, searchParams]);

  // ── Handlers ──
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (query) => {
    if (!query?.trim()) {
      setDisplayedProducts(products);
      setCurrentPage(1);
      setTotalPages(Math.ceil(products.length / PRODUCTS_PER_PAGE));
      return;
    }
    ProductService.fetchAllProducts({ search: query, page: 1, limit: PRODUCTS_PER_PAGE })
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
      { page: 1, limit: PRODUCTS_PER_PAGE }
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

  const handleSort = (sortType) => {
    const sortMap = {
      priceAsc: "price",
      priceDesc: "-price",
      alphabeticalAsc: "title",
      alphabeticalDesc: "-title",
    };
    const sortParam = sortMap[sortType] || "-createdAt";

    ProductService.fetchProductsWithFilters(
      {},
      { page: currentPage, limit: PRODUCTS_PER_PAGE, sort: sortParam }
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
          {Array.from({ length: 6 }).map((_, i) => (
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
        transition={{ duration: 0.4 }}
      >
        {displayedProducts.map((p, i) => (
          <motion.div
            key={p.id || i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.4) }}
          >
            <ProductCard
              id={p.id}
              imageUrl={p.imageUrl}
              title={p.title}
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
      {/* Top banner */}
      <section className="ps-hero">
        <div className="ps-hero-inner">
          <Breadcrumb
            items={[
              { label: "Home", path: "/" },
              { label: "Pet Shop", path: "/petshop" },
            ]}
          />
          <h1 className="ps-hero-title">Everything for your beloved pet</h1>
          <p className="ps-hero-subtitle">
            Curated essentials, premium nutrition, and unique finds — all in one place.
          </p>
          <SearchBar showInPages={["/petshop"]} />
        </div>
      </section>

      {/* Main body */}
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
                <h2 className="ps-section-title">Products</h2>
                <span className="ps-result-count">
                  {isLoading ? "Loading..." : `${displayedProducts.length} items`}
                </span>
              </div>
              <div className="ps-toolbar-right">
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

      {/* Mobile filter drawer */}
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
