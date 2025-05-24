import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Row, Col, Container, Tab, Nav, Button } from "react-bootstrap";
import AnchorButton from "../../../Components/HelperComponents/AnchorButton/AnchorButton";
import ProductCard from "../../../Components/HelperComponents/ProductCard/ProductCard";
import ProductService from "@/Services/localServices/ProductService";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight } from "react-icons/fa6";

//Assets Import
import "./FeaturedProductSection.css";
import bubblesImg from "../../../assets/Decoratives/bubbles.png";

const FeaturedProductSection = () => {
  const [key, setKey] = useState("category1");
  const [catProducts, setCatProducts] = useState([]);
  const [dogProducts, setDogProducts] = useState([]);
  const [apparelProducts, setApparelProducts] = useState([]);
  const [generalProducts, setGeneralProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  const tabVariants = {
    inactive: { scale: 1 },
    active: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  };

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
              <motion.div
                className="featured-products-heading"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="caveat-Heading">Featured Products</h1>
              </motion.div>
              <img src={bubblesImg} alt="" className="bubbleImg" />
            </div>
          </Col>
          <Col xs={6} md={5} className="d-flex justify-content-center ">
            <motion.div
              className="text-center mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button
                href={"/PetShop"}
                className="button-primary rounded-5"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <p>
                  {" "}
                  View More <FaArrowRight />
                </p>
              </Button>
            </motion.div>
          </Col>
        </Row>
        <Row className="featured-products-wrapper">
          <Tab.Container
            defaultActiveKey="category1"
            activeKey={key}
            onSelect={(k) => setKey(k)}
          >
            <motion.div
              className="featuredProductsNavTabWrapper"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="featuredProductsNavTab rounded-5">
                <Nav className="featuredProductsNavTab rounded-5 pt-1 pb-1">
                  <Nav.Item>
                    <Nav.Link
                      eventKey="category1"
                      className="rounded-5 pt-1 pb-1"
                    >
                      <p>Cats</p>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="category2"
                      className="rounded-5 pt-1 pb-1"
                    >
                      <p>Dogs</p>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="category3"
                      className="rounded-5 pt-1 pb-1"
                    >
                      <p>Apparel</p>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      eventKey="category4"
                      className="rounded-5 pt-1 pb-1"
                    >
                      <p>General</p>
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </div>
            </motion.div>
            <Tab.Content>
              {/* Cat Products */}
              <Tab.Pane eventKey="category1">
                <Row className=" product-card-container">
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
                <Row className=" product-card-container">
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
                <Row className=" product-card-container">
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
                <Row className="product-card-container">
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
