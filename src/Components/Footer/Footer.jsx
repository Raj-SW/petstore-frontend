import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { IconContext } from "react-icons";

import "./Footer.css";
import "./Footer2.css";
import qrCode from "../../assets/Decoratives/QRCode.png";
import googlePlayStoreImg from "../../assets/Decoratives/googlePlay1.png";
import appStoreImg from "../../assets/Decoratives/app-store.png";

const Footer = () => {
  return (
    <>
      <div className="footerWrapper">
        <Container className="footerContainer d-flex flex-column">
          <Row className="registerSection d-flex flex-row justify-content-around align-items-center p-4 mt-5 rounded-4 ml-1 mr-1">
            <h3 className="text-wrap text-white caveat-Heading subscribe-heading">
              Register Now So You Don't Miss Our Programs
            </h3>
            <Row className="d-flex subscribeInputContainer flex-rowp-2 rounded-3 gap-2 justify-content-around p-2">
              <input
                type="email"
                name="emailInput"
                id=""
                className="emailInput rounded-2"
              />
              <Button className="subscribeButton" variant="primary">
                Subscribe Now
              </Button>
            </Row>
          </Row>
          <Row className="footerContentSection mt-5 d-flex flex-wrap justify-content-center justify-content-lg-between">
            <div className="footerContents d-flex gap-5 fs-6 flex-wrap justify-content-center">
              <Col className="fs-6">
                <h5 className="fs-6">Shopping Categories</h5>
                <ul>
                  <li>Dog</li>
                  <li>Cats</li>
                  <li>Small Pets</li>
                  <li>Birds</li>
                </ul>
              </Col>
              <Col className="fs-6">
                <h5 className="fs-6">Shopping Categories</h5>
                <ul>
                  <li>Dog</li>
                  <li>Cats</li>
                  <li>Small Pets</li>
                  <li>Birds</li>
                </ul>
              </Col>
              <Col className="fs-6">
                <h5 className="fs-6">Shopping Categories</h5>
                <ul>
                  <li>Dog</li>
                  <li>Cats</li>
                  <li>Small Pets</li>
                  <li>Birds</li>
                </ul>
              </Col>
              <Col className="fs-6">
                <h5 className="fs-6">Shopping Categories</h5>
                <ul>
                  <li>Dog</li>
                  <li>Cats</li>
                  <li>Small Pets</li>
                  <li>Birds</li>
                </ul>
              </Col>
            </div>
            <Col className="linksWrapper d-flex flex-column gap-4 mt-4 mt-lg-0 justify-content-center align-items-center align-items-lg-end">
              <div className="d-flex gap-4">
                <IconContext.Provider value={{ size: "1.5rem" }}>
                  <FaFacebook />
                  <IoLogoWhatsapp />
                  <FaInstagram />
                  <FaYoutube />
                </IconContext.Provider>
              </div>
              <Row className="downloadLinksWrapper d-flex justify-content-center justify-content-lg-end">
                <Col className="qrWrapper d-flex justify-content-center justify-content-lg-end">
                  <img src={qrCode} alt="QR Code" />
                </Col>
                <Col className="storeContainer d-flex flex-column gap-2 align-items-center align-items-lg-end">
                  <img src={appStoreImg} alt="App Store" />
                  <img src={googlePlayStoreImg} alt="Google Play Store" />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="footerBrandSection mt-4 d-flex justify-content-between align-items-center p-3 border-top flex-column flex-md-row text-center text-md-start">
            <div className="text-muted rightsReserved">
              © 2022 VitalPaws. All rights reserved.
            </div>
            <h5 className="footerBrandName m-0 font-italic">VitalPaws</h5>
            <div className="d-flex gap-3 footerTermsOfService justify-content-center justify-content-md-end">
              <a href="#" className="text-dark text-decoration-none">
                Terms of Service
              </a>
              <a href="#" className="text-dark text-decoration-none">
                Privacy Policy
              </a>
            </div>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Footer;

// const Footer = () => {
//   return (
//     <>
//       <div className="footerWrapper">
//         <Container xs={12}>
//           <Row className="footerPlaceholderSlogan justify-content-center text-center text-md-start p-3 text-white poppins-semibold">
//             <Col xs="auto" className="d-flex align-items-center mb-2 mb-md-0">
//               <div>
//                 <p>Our Pet Specialists are here to help you</p>
//               </div>
//             </Col>
//             <Col xs="auto" className="d-flex align-items-center mb-2 mb-md-0">
//               <div>
//                 <p> +230 1234 5678</p> <IoCallOutline />
//               </div>
//             </Col>
//             <Col xs="auto" className="d-flex align-items-center mb-2 mb-md-0">
//               <div>
//                 <p>Email Us</p> <IoMdMail />
//               </div>
//             </Col>
//           </Row>
//           {/* mobile footer */}
//           <div className="d-md-none footerAccordionWrapper">
//             <Accordion className="bg-transparent text-white">
//               <Accordion.Item
//                 eventKey="0"
//                 className="bg-transparent text-white"
//               >
//                 <Accordion.Header className="bg-transparent text-white border-0 poppins-medium">
//                   Shopping Categories
//                 </Accordion.Header>
//                 <Accordion.Body className="bg-transparent text-white poppins-regular">
//                   <Row>
//                     <p>Dogs</p>
//                   </Row>
//                   <Row>
//                     <p>Cats</p>
//                   </Row>
//                   <Row>
//                     <p>Fish</p>
//                   </Row>
//                   <Row>
//                     <p>Small Pets</p>
//                   </Row>
//                   <Row>
//                     <p>Reptile</p>
//                   </Row>
//                   <Row>
//                     <p>Birds</p>
//                   </Row>
//                 </Accordion.Body>
//               </Accordion.Item>
//               <hr className="bg-white my-2" />
//               <Accordion.Item
//                 eventKey="1"
//                 className="bg-transparent text-white"
//               >
//                 <Accordion.Header className="bg-transparent text-white border-0 poppins-medium">
//                   Get to know us
//                 </Accordion.Header>
//                 <Accordion.Body className="bg-transparent text-white poppins-regular">
//                   <Row>
//                     <p>Our Success Story</p>
//                   </Row>
//                   <Row>
//                     <p>About Us</p>
//                   </Row>
//                   <Row>
//                     <p>Our Hirings</p>
//                   </Row>
//                 </Accordion.Body>
//               </Accordion.Item>
//               <hr className="bg-white my-2" />
//               <Accordion.Item
//                 eventKey="2"
//                 className="bg-transparent text-white"
//               >
//                 <Accordion.Header className="bg-transparent text-white border-0 poppins-medium">
//                   Community
//                 </Accordion.Header>
//                 <Accordion.Body className="bg-transparent text-white poppins-regular">
//                   <Row>
//                     <p>Our Events</p>
//                   </Row>
//                   <Row>
//                     <p>Pet Stardom</p>
//                   </Row>
//                   <Row>
//                     <p>Loyalty Program</p>
//                   </Row>{" "}
//                 </Accordion.Body>
//               </Accordion.Item>
//               <hr className="bg-white my-2" />
//               <Accordion.Item
//                 eventKey="3"
//                 className="bg-transparent text-white"
//               >
//                 <Accordion.Header className="bg-transparent text-white border-0 poppins-medium">
//                   Let us help you
//                 </Accordion.Header>
//                 <Accordion.Body className="bg-transparent text-white poppins-regular">
//                   <Row>
//                     <p>FAQs</p>
//                   </Row>
//                   <Row>
//                     <p>Track your Orders</p>
//                   </Row>
//                   <Row>
//                     <p>Delivery Information</p>
//                   </Row>
//                   <Row>
//                     <p>Payment Options</p>
//                   </Row>{" "}
//                 </Accordion.Body>
//               </Accordion.Item>
//               <hr className="bg-white my-2" />
//             </Accordion>
//           </div>

//           <Row className="footerSectionsWrapper justify-content-center text-md-start d-none d-md-flex text-white">
//             <Col
//               xs={12}
//               md={3}
//               className="colSection text-center border-end border-white"
//             >
//               <h6 className="caveat-Heading fs-4">Shopping Categories</h6>
//               <div className=" poppins-regular">
//                 <Row>
//                   <p>Dogs</p>
//                 </Row>
//                 <Row>
//                   <p>Cats</p>
//                 </Row>
//                 <Row>
//                   <p>Fish</p>
//                 </Row>
//                 <Row>
//                   <p>Small Pets</p>
//                 </Row>
//                 <Row>
//                   <p>Reptile</p>
//                 </Row>
//                 <Row>
//                   <p>Birds</p>
//                 </Row>
//               </div>
//             </Col>
//             <Col
//               xs={12}
//               md={3}
//               className="colSection text-center border-end border-white"
//             >
//               <h6 className="caveat-Heading fs-4">Get to know us</h6>
//               <div className=" poppins-regular">
//                 <Row>
//                   <p>Our Success Story</p>
//                 </Row>
//                 <Row>
//                   <p>About Us</p>
//                 </Row>
//                 <Row>
//                   <p>Our Hirings</p>
//                 </Row>
//               </div>
//             </Col>
//             <Col
//               xs={12}
//               md={3}
//               className="colSection text-center border-end border-white"
//             >
//               <h6 className="caveat-Heading fs-4">Community</h6>
//               <div className=" poppins-regular">
//                 <Row>
//                   <p>Our Events</p>
//                 </Row>
//                 <Row>
//                   <p>Pet Stardom</p>
//                 </Row>
//                 <Row>
//                   <p>Loyalty Program</p>
//                 </Row>
//               </div>
//             </Col>
//             <Col xs={12} md={3} className="colSection text-center ">
//               <h6 className="caveat-Heading fs-4">Let us help you</h6>
//               <div className=" poppins-regular">
//                 <Row>
//                   <p>FAQs</p>
//                 </Row>
//                 <Row>
//                   <p>Track your Orders</p>
//                 </Row>
//                 <Row>
//                   <p>Delivery Information</p>
//                 </Row>
//                 <Row>
//                   <p>Payment Options</p>
//                 </Row>
//               </div>
//             </Col>
//           </Row>

//           <Row className="p-3 text-white">
//             <Col>
//               {/* Centered downloadTheApp div with inline icons */}
//               <Row className="justify-content-center ">
//                 <div className="downloadTheApp text-center">
//                   <h3 className="d-flex align-items-center justify-content-center poppins-medium">
//                     Download the app
//                     <span className="mx-2">
//                       <IoLogoGooglePlaystore />
//                       <GrApple className="ms-2" />
//                     </span>
//                   </h3>
//                 </div>
//               </Row>
//               {/* Centered socialsFooter div with inline icons */}
//               <Row className="justify-content-center">
//                 <div className="socialsFooter text-center">
//                   <h4 className="d-flex align-items-center justify-content-center poppins-regular">
//                     Follow Us
//                     <span className="mx-2">
//                       <FaFacebook className="mx-2" />
//                       <IoLogoWhatsapp className="mx-2" />
//                       <FaInstagram className="mx-2" />
//                     </span>
//                   </h4>
//                 </div>
//               </Row>
//             </Col>
//           </Row>
//         </Container>
//       </div>
//       {/* Horizontal Red Border */}
//       <hr className="footerAccordionBottonBorder" />

//       {/* Footer Content */}
//       <Container fluid className="py-3">
//         <Row className="justify-content-center">
//           <Col
//             xs={12}
//             md="auto"
//             className="text-center text-md-start mb-2 mb-md-0"
//           >
//             <p className="mb-0 poppins-regular">
//               2024 <span className="caveat-Heading fs-5">The Petshop.</span> All
//               rights reserved
//             </p>
//           </Col>
//           <Col xs={12} md="auto" className="text-center text-md-end">
//             <p className="mb-0">
//               <a
//                 href="#"
//                 className="text-decoration-none text-dark mx-2 poppins-light"
//               >
//                 Terms of use
//               </a>
//               |
//               <a
//                 href="#"
//                 className="text-decoration-none text-dark mx-2 poppins-light"
//               >
//                 Privacy Policy
//               </a>
//               |
//               <a
//                 href="#"
//                 className="text-decoration-none text-dark mx-2 poppins-light"
//               >
//                 Site Map
//               </a>
//             </p>
//           </Col>
//         </Row>
//       </Container>
//     </>
//   );
// };
