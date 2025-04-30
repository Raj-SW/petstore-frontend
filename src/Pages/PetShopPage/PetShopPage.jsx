import React, { useState, useEffect } from "react";
import "./PetShopPage.css";

// Component Import
import {
  Container,
  Row,
  Col,
  Pagination,
  Button,
  Offcanvas,
} from "react-bootstrap";
import ProductCard from "../../Components/HelperComponents/ProductCard";
import SortDropdown from "@/Components/HelperComponents/SortDropDown/SortDropDown";
import { FaSearch } from "react-icons/fa";

// Local service import
import ProductService from "@/Services/localServices/ProductService";
import FilterComponent from "./FilterComponent";

const PetShopPage = () => {
  const [products, setProducts] = useState([]); // Original product list
  const [displayedProducts, setDisplayedProducts] = useState([]); // Products shown after sorting, searching, and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    ProductService.fetchAllProducts()
      .then((data) => {
        setProducts(data);
        setDisplayedProducts(data); // Initialize displayedProducts
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  // Search products
  const handleSearch = () => {
    let filtered = products;

    if (searchQuery.trim()) {
      filtered = products.filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setDisplayedProducts(filtered); // Update displayed products based on search
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

  return (
    <>
      {/* Search Bar */}
      <div className="searchbarcontainer">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={handleSearch}>
            <FaSearch />
          </button>
        </div>
      </div>

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
                <p className="poppins-semibold fs-5 primary-color-font ">
                  Products
                </p>
              </div>
              <div className="ProductItemQuickSort">
                <SortDropdown onSort={handleSort} />
                <Button
                  variant="primary"
                  className="d-md-none mb-3 m-1"
                  onClick={handleShow}
                >
                  Filter
                </Button>
              </div>
            </div>

            <div className="ProductItemBody">
              <Row className="ProductItemContainer">
                {displayedProducts.map((product) => (
                  <Col
                    key={product.id}
                    xs={6}
                    sm={6}
                    md={4}
                    lg={3}
                    className="mb-4"
                  >
                    <ProductCard
                      id={product.id}
                      imageUrl={product.imageUrl}
                      title={product.title}
                      price={product.price}
                      rating={product.rating}
                    />
                  </Col>
                ))}
              </Row>

              {/* Centered Pagination */}
              <div className="paginationWrapper">
                <Pagination className="d-flex">
                  <Pagination.First />
                  <Pagination.Prev />
                  <Pagination.Item active>{1}</Pagination.Item>
                  <Pagination.Item>{2}</Pagination.Item>
                  <Pagination.Item>{3}</Pagination.Item>
                  <Pagination.Ellipsis />
                  <Pagination.Next />
                  <Pagination.Last />
                </Pagination>
              </div>
            </div>
          </Col>
        </Container>
      </div>
      <div className="d-md-none">
        <Offcanvas show={showFilters} onHide={handleClose} responsive="md">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Filters</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <FilterComponent onApplyFilters={handleApplyFilters} />
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    </>
  );
};

export default PetShopPage;
