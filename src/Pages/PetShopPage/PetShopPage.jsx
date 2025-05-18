import React, { useState, useEffect } from "react";
import "./PetShopPage.css";
import { useParams, useSearchParams } from "react-router-dom";

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

  useEffect(() => {
    ProductService.fetchAllProducts()
      .then((data) => {
        setProducts(data);
        setDisplayedProducts(data); // Initialize displayedProducts
        setTotalPages(Math.ceil(data.length / productsPerPage));
        setIsLoading(false);

        // Check for search params after products are loaded
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
    setCurrentPage(1); // Reset to first page after filtering
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

  // Generate pagination items
  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    if (
      number === 1 ||
      number === totalPages ||
      (number >= currentPage - 1 && number <= currentPage + 1)
    ) {
      paginationItems.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    } else if (number === currentPage - 2 || number === currentPage + 2) {
      paginationItems.push(
        <Pagination.Ellipsis key={`ellipsis-${number}`} disabled />
      );
    }
  }

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

            <div className="ProductItemBody">
              <Row className="ProductItemContainer">
                {currentProducts.map((product) => (
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

              <div className="paginationWrapper">
                <Pagination className="d-flex">
                  <Pagination.First
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    style={{ fontSize: "1.5rem" }}
                  />
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  {paginationItems}
                  <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  />
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
