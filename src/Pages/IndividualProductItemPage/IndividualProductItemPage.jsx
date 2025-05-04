import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

//Component import
import { Container, Row, Col, Button, Image } from "react-bootstrap";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import { LuArrowLeftCircle } from "react-icons/lu";
import { IconContext } from "react-icons";
import { FaSearch } from "react-icons/fa";
import { CaretDownIcon } from "@radix-ui/react-icons";
import "./IndividaulItemPage.css";
import CustomButton from "@/Components/HelperComponents/CustomButton/CustomButton";
import Breadcrumb from "@/Components/HelperComponents/Breadcrumb/Breadcrumb";
import SearchBar from "@/Components/HelperComponents/SearchBar/SearchBar";

//Asset Import
import productImg1 from "@/assets/FeaturedProductsAssets/Product.svg";
import ProductCard from "@/Components/HelperComponents/ProductCard";
import ProductReviewCard from "@/Components/HelperComponents/ProductReviewCard";

//service import
import ProductService from "@/Services/localServices/ProductService";

const IndividualProductItemPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    ProductService.fetchProductById(parseInt(id))
      .then((product) => {
        console.log(product);
        setProduct(product);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
        setError("Product not found.");
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) return <p>Loading product details...</p>;
  if (!product) return <p>Product not found.</p>;

  //  Decrement quantity
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Increment quantity
  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  // Search products
  const handleSearch = () => {
    let filtered = products;

    if (searchQuery.trim()) {
      filtered = products.filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setDisplayedProducts(filtered);
    setCurrentPage(1); // Reset to first page after search
    setTotalPages(Math.ceil(filtered.length / productsPerPage));
  };
  return (
    <>
      <Container className="d-flex flex-column">
        <div className="searchbarcontainer">
          <Breadcrumb
            items={[
              { label: "Home", path: "/" },
              { label: "Pet Shop", path: "/PetShop" },
              { label: product.title, path: null },
            ]}
          />
          <SearchBar />
        </div>
        <Container
          fluid
          className="p-4 Product-Item-Container border mt-2 rounded-4"
        >
          <Row className="g-4">
            <Col lg={6} className="d-flex flex-column align-items-center">
              <Image
                src={product.imageUrl}
                alt="Product"
                className="img-fluid rounded mb-3 w-100"
              />
              <div className="d-flex justify-content-center img-Thumbnail-Container ">
                {/* Thumbnail Images */}
                <Image src={product.imageUrl} className="mx-1 flex-grow-1  " />
                <Image src={product.imageUrl} className="mx-1 flex-grow-1  " />
                <Image src={product.imageUrl} className="mx-1 flex-grow-1  " />
                <Image src={product.imageUrl} className="mx-1 flex-grow-1  " />
              </div>

              {/* Guarantee Badges */}
              <div className="d-flex justify-content-center mt-3 guarantee-badge p-2 w-100 rounded-3 poppins-regular flex-wrap">
                <div className="p-1">
                  <p>100% Health guarantee</p>
                </div>
                <div className="p-1">
                  <p>100% Guarnatee of pet identification</p>
                </div>
              </div>
              {/* Share Icons */}
              <div className="d-flex w-100 justify-content-start p-3 poppins-semibold align-items-center ">
                <IconContext.Provider
                  value={{ size: "1.3rem", color: "#002A48" }}
                >
                  <FiShare2 className="mx-2" />
                  <span className="me-2 pale-green-color-font">Share:</span>
                  <FaFacebook className="mx-2" />
                  <FaTwitter className="mx-2" />
                  <FaInstagram className="mx-2" />
                </IconContext.Provider>
              </div>
            </Col>

            {/* Right Column - Product Information */}
            <Col lg={6}>
              <h2 className="mb-3 poppins-bold secondary-color-font">
                {product.title}
              </h2>
              <h4 className="mb-4 poppins-semibold secondary-color-font">
                $ {product.price}
              </h4>
              {/* Product Details */}
              <div className="mb-4 d-flex flex-column item-details-container poppins-medium ">
                <p>
                  <strong>Detail 1:</strong> #000078
                </p>
                <p>
                  <strong>Gender:</strong> Female
                </p>
                <p>
                  <strong>Age:</strong> 2 Months
                </p>
                <p>
                  <strong>Size:</strong> Small
                </p>
                <p>
                  <strong>Color:</strong> Apricot & Tan
                </p>
                <p>
                  <strong>Vaccinated:</strong> Yes
                </p>
                <p>
                  <strong>Dewormed:</strong> Yes
                </p>
                <p>
                  <strong>Cert:</strong> Yes (MKA)
                </p>
                <p>
                  <strong>Microchip:</strong> Yes
                </p>
                <p>
                  <strong>Location:</strong> Vietnam
                </p>
                <p>
                  <strong>Published Date:</strong> 12-Oct-2022
                </p>
                <p>
                  <strong>Additional Information:</strong> {product.description}
                </p>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="d-flex align-items-center mb-4 w-100 justify-content-start poppins-regular gap-3">
                <span className="me-3">
                  <strong>Quantity</strong>
                </span>
                <div className="d-flex align-items-center">
                  {/* IconContext to style the icons */}
                  <IconContext.Provider
                    value={{ size: "2rem", color: "black" }}
                  >
                    {/* Decrement Button */}
                    <LuArrowLeftCircle
                      onClick={handleDecrement}
                      style={{ cursor: "pointer" }}
                    />
                    {/* Quantity Display */}
                    <span className="mx-3">{quantity}</span>
                    {/* Increment Button */}
                    <LuArrowLeftCircle
                      style={{ transform: "rotate(180deg)", cursor: "pointer" }}
                      onClick={handleIncrement}
                    />
                  </IconContext.Provider>
                </div>
                <CustomButton title={"Add to Cart"} />
              </div>
            </Col>
          </Row>

          {/* Supplier Product Details */}
          <Row className="mt-5 Supplier-Product-Detail-Container rounded-4 border p-2">
            <Col>
              <h4 className="pale-green-color-font">
                Supplier Product Details
              </h4>
              <p>
                We have had Magie since she was able to leave her mum as a puppy
                at 8 weeks old. Magie currently lives with two children aged 7
                and 13 and has many visitors to the house, which she is great
                with. There's lots of cats and birds in the garden, and she's
                not fussed by them.
              </p>
            </Col>
          </Row>
        </Container>
        <Container className="related-purchases-container border rounded-4 mt-5 mb-5">
          <h2 className="pale-green-color-font p-4">Related Purchases</h2>
          <Row className="w-100 d-flex flex-wrap justify-content-center gap-3 mt-3 related-purchases-product mb-5">
            <ProductCard
              imageUrl={productImg1}
              title={"Pet Oatmeal Spray"}
              price={"299.9"}
              rating={4}
            />{" "}
            <ProductCard
              imageUrl={productImg1}
              title={"Pet Oatmeal Spray"}
              price={"299.9"}
              rating={4}
            />{" "}
            <ProductCard
              imageUrl={productImg1}
              title={"Pet Oatmeal Spray"}
              price={"299.9"}
              rating={4}
            />{" "}
            <ProductCard
              imageUrl={productImg1}
              title={"Pet Oatmeal Spray"}
              price={"299.9"}
              rating={4}
            />
          </Row>
        </Container>
        <Container className="productReviewsContainer d-flex flex-column text-center mt-5 mb-5">
          <h3 className="pale-green-color-font">Product Reviews</h3>
          <Row className="productReviewCardsContainer d-flex flex-wrap justify-content-center">
            <ProductReviewCard />
            <ProductReviewCard />
            <ProductReviewCard />
            <ProductReviewCard />
          </Row>
          <div className="text-center mt-5">
            <Button
              variant="success"
              type="submit"
              className="pl-2 pr-2 rounded-pill"
              style={{
                backgroundColor: "#74B49B",
                border: "none",
                width: "fit-content",
              }}
            >
              Write a Review
            </Button>
          </div>
        </Container>
      </Container>
    </>
  );
};

export default IndividualProductItemPage;
