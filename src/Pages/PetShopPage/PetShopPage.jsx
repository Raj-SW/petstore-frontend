import React, { useState, useEffect } from "react";
import "./PetShopPage.css";
import { useParams, useSearchParams } from "react-router-dom";
import { motion, useInView } from "framer-motion";

// Component Import
import {
  Container,
  Row,
  Col,
  Pagination,
  Button,
  Offcanvas,
} from "react-bootstrap";
import ProductCard from "../../Components/HelperComponents/ProductCard/ProductCard";
import SortDropdown from "@/Components/HelperComponents/SortDropDown/SortDropDown";
import Breadcrumb from "@/Components/HelperComponents/Breadcrumb/Breadcrumb";
import SearchBar from "@/Components/HelperComponents/SearchBar/SearchBar";

// Local service import
import ProductService from "@/Services/localServices/ProductService";
import FilterComponent from "./FilterComponent";

const PetShopPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]); // Original product list
  const [displayedProducts, setDisplayedProducts] = useState([]); // Products shown after sorting, searching, and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(0);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  useEffect(() => {
    ProductService.fetchAllProducts()
      .then((data) => {
        setProducts(data);
        setDisplayedProducts(data);
        setTotalPages(Math.ceil(data.length / productsPerPage));
        setIsLoading(false);

        const query = searchParams.get("search");
        if (query) {
          setSearchQuery(query);
          handleSearch(query);
        }
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError(err.message);
        setIsLoading(false);
      });
  }, [productsPerPage, searchParams]);

  // Get current products for pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = displayedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Change page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of product grid
    const productGrid = document.querySelector(".ProductItemBody");
    if (productGrid) {
      productGrid.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Update handleSearch to search across multiple product fields
  const handleSearch = (query = searchQuery) => {
    let filtered = products;

    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(" ");

      filtered = products.filter((product) => {
        const searchableText = [
          product.title,
          product.description,
          product.category,
          product.brand,
        ]
          .map((text) => text?.toLowerCase() || "")
          .join(" ");

        return searchTerms.every((term) => searchableText.includes(term));
      });
    }

    setDisplayedProducts(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / productsPerPage));
  };

  // Apply filters
  const handleApplyFilters = (filters) => {
    const { minPrice, maxPrice, categories, rating } = filters;

    const filtered = products.filter((product) => {
      const matchesCategory =
        categories.length === 0 ||
        categories.some(
          (category) =>
            category.toLowerCase() === product.category.toLowerCase()
        );
      const matchesPrice =
        (!minPrice || parseFloat(product.price) >= parseFloat(minPrice)) &&
        (!maxPrice || parseFloat(product.price) <= parseFloat(maxPrice));
      const matchesRating =
        !rating || parseFloat(product.rating) >= parseFloat(rating);

      return matchesCategory && matchesPrice && matchesRating;
    });

    setDisplayedProducts(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / productsPerPage));
  };

  // Sort products
  const handleSort = (sortType) => {
    let sorted = [...displayedProducts];
    switch (sortType) {
      case "priceAsc":
        sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "priceDesc":
        sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "alphabeticalAsc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "alphabeticalDesc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }
    setDisplayedProducts(sorted);
  };

  const [showFilters, setShowFilters] = useState(false);
  const handleClose = () => setShowFilters(false);
  const handleShow = () => setShowFilters(true);

  if (isLoading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  // Generate custom pagination items
  const renderPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 4;

    // Always show first 4 pages
    for (let i = 1; i <= Math.min(maxPagesToShow, totalPages); i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
          className={
            i === currentPage
              ? "custom-pagination-active"
              : "custom-pagination-item"
          }
        >
          {i}
        </Pagination.Item>
      );
    }

    // Show ellipsis if needed
    if (totalPages > maxPagesToShow + 1 && currentPage < totalPages - 2) {
      items.push(
        <span key="ellipsis" className="custom-pagination-ellipsis">
          ...
        </span>
      );
    }

    // Always show last page
    if (totalPages > maxPagesToShow) {
      items.push(
        <Pagination.Item
          key={totalPages}
          active={currentPage === totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={
            currentPage === totalPages
              ? "custom-pagination-active"
              : "custom-pagination-item"
          }
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    return items;
  };

  return (
    <>
      <Container>
        <div className="searchbarcontainer">
          <Breadcrumb
            items={[
              { label: "Home", path: "/" },
              { label: "Pet Shop", path: "/PetShop" },
            ]}
          />
          <SearchBar />
        </div>
      </Container>

      <div className="petshopContainer pt-3">
        <Container className="petShopBanner">
          Here You could add a banner text or advertisement or so
        </Container>
        <Container className="petShopBody">
          <Col className="filtersContainer d-none d-md-flex">
            <FilterComponent onApplyFilters={handleApplyFilters} />
          </Col>
          <Col className="ProductItemsWrapper">
            <div className="ProductItemsHeaders d-flex justify-content-between w-100 pb-3">
              <div>
                <p className="poppins-semibold fs-5 secondary-color-font ">
                  Products
                </p>
              </div>
              <div className="ProductItemQuickSort">
                <SortDropdown onSort={handleSort} />
                <Button
                  variant="primary"
                  className="d-md-none filter-button-mobile"
                  onClick={handleShow}
                >
                  Filter
                </Button>
              </div>
            </div>

            <div className="ProductItemBody ">
              <motion.div
                key={currentPage}
                className="ProductItemContainer"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                viewport={{ once: false, amount: 0.2 }}
              >
                <Row className="ProductItemContainer d-flex justify-content-center ">
                  {currentProducts.map((product) => (
                    <Col
                      key={product.id}
                      xs={5}
                      sm={6}
                      md={4}
                      lg={3}
                      className="mb-4"
                    >
                      <motion.div
                        variants={itemVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                      >
                        <ProductCard
                          id={product.id}
                          imageUrl={product.imageUrl}
                          title={product.title}
                          price={product.price}
                          rating={product.rating}
                        />
                      </motion.div>
                    </Col>
                  ))}
                </Row>
              </motion.div>

              <div className="paginationWrapper">
                <Pagination className="d-flex custom-pagination">
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="custom-pagination-arrow"
                  >
                    &#8592;
                  </Pagination.Prev>
                  {renderPaginationItems()}
                  <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="custom-pagination-arrow"
                  >
                    &#8594;
                  </Pagination.Next>
                </Pagination>
              </div>
            </div>
          </Col>
        </Container>
      </div>

      <Offcanvas
        show={showFilters}
        onHide={handleClose}
        placement="end"
        className="filter-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filters</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <FilterComponent onApplyFilters={handleApplyFilters} />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default PetShopPage;
