import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Row, Col, Container, Tab, Nav } from "react-bootstrap";
import AnchorButton from "../../../Components/HelperComponents/AnchorButton";
import ProductCard from "../../../Components/HelperComponents/ProductCard";
import ProductService from "@/Services/localServices/ProductService";

//Assets Import
import "./FeaturedProductSection.css";
import bubblesImg from "../../../assets/Decoratives/bubbles.png";

//Icon Import
import { FaArrowRight } from "react-icons/fa6";

const FeaturedProductSection = () => {
  const [key, setKey] = useState("category1");
  const [catProducts, setCatProducts] = useState([]);
  const [dogProducts, setDogProducts] = useState([]);
  const [apparelProducts, setApparelProducts] = useState([]);
  const [generalProducts, setGeneralProducts] = useState([]);

  // Fetch featured products for each category
  useEffect(() => {
    ProductService.fetchProductsByCategory("cat")
      .then((data) =>
        setCatProducts(data.filter((product) => product.isFeatured).slice(0, 4))
      )
      .catch((err) => console.error("Error fetching cat products:", err));

    ProductService.fetchProductsByCategory("dog")
      .then((data) =>
        setDogProducts(data.filter((product) => product.isFeatured).slice(0, 4))
      )
      .catch((err) => console.error("Error fetching dog products:", err));

    ProductService.fetchProductsByCategory("general")
      .then((data) =>
        setGeneralProducts(
          data.filter((product) => product.isFeatured).slice(0, 4)
        )
      )
      .catch((err) => console.error("Error fetching general products:", err));

    ProductService.fetchProductsByApparel()
      .then((data) =>
        setApparelProducts(
          data.filter((product) => product.isFeatured).slice(0, 4)
        )
      )
      .catch((err) => console.error("Error fetching apparel products:", err));
  }, []);

  return (
    <div className="">
      <Container fluid>
        <Row className="align-items-center justify-content-between p-4 featured-products-heading-container pl-40 pr-40">
          <Col xs={6} md={7}>
            <div className="d-flex gap-4 justify-content-center">
              <h1 className="caveat-Heading featured-products-heading">
                Featured Products
              </h1>
              <img src={bubblesImg} alt="" className="bubbleImg" />
            </div>
          </Col>
          <Col xs={6} md={5} className="d-flex justify-content-center ">
            <AnchorButton
              text={"View More"}
              icon={<FaArrowRight />}
              href={"/PetShop"}
            />
          </Col>
        </Row>
        <Row className="featured-products-wrapper">
          <Tab.Container
            defaultActiveKey="category1"
            activeKey={key}
            onSelect={(k) => setKey(k)}
          >
            <div className="justify-content-center featuredProductsNavTabWrapper">
              <Nav className="featuredProductsNavTab">
                <Nav.Item>
                  <Nav.Link eventKey="category1">
                    <p>Cats</p>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="category2">
                    <p>Dogs</p>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="category3">
                    <p>Apparel</p>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="category4">
                    <p>General</p>
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </div>
            <Tab.Content>
              {/* Cat Products */}
              <Tab.Pane eventKey="category1">
                <Row className="justify-content-center product-card-container">
                  {catProducts.map((product) => (
                    <ProductCard
                      id={product.id}
                      key={product.id}
                      imageUrl={product.imageUrl}
                      title={product.title}
                      price={product.price}
                      rating={product.rating}
                    />
                  ))}
                </Row>
              </Tab.Pane>
              {/* Dog Products */}
              <Tab.Pane eventKey="category2">
                <Row className="justify-content-center product-card-container">
                  {dogProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      imageUrl={product.imageUrl}
                      title={product.title}
                      price={product.price}
                      rating={product.rating}
                    />
                  ))}
                </Row>
              </Tab.Pane>
              {/* Apparel Products */}
              <Tab.Pane eventKey="category3">
                <Row className="justify-content-center product-card-container">
                  {apparelProducts.map((product) => (
                    <ProductCard
                      id={product.id}
                      key={product.id}
                      imageUrl={product.imageUrl}
                      title={product.title}
                      price={product.price}
                      rating={product.rating}
                    />
                  ))}
                </Row>
              </Tab.Pane>
              {/* General Products */}
              <Tab.Pane eventKey="category4">
                <Row className="justify-content-center product-card-container">
                  {generalProducts.map((product) => (
                    <ProductCard
                      id={product.id}
                      key={product.id}
                      imageUrl={product.imageUrl}
                      title={product.title}
                      price={product.price}
                      rating={product.rating}
                    />
                  ))}
                </Row>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Row>
      </Container>
    </div>
  );
};

export default FeaturedProductSection;
