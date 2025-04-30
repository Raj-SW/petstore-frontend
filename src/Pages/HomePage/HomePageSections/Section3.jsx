import React from "react";
import "./Section3.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Row,
  Button,
  Form,
  Col,
  Container,
  Tab,
  Nav,
  Card,
} from "react-bootstrap";
import { LiaPawSolid } from "react-icons/lia";
import member1Img from "../../assets/MainPageTeamSectioningAssets/teammember1.png";
import member2Img from "../../assets/MainPageTeamSectioningAssets/teammember2.png";
import member3Img from "../../assets/MainPageTeamSectioningAssets/teammember3.png";
import member4Img from "../../assets/MainPageTeamSectioningAssets/teammember4.png";
import { FaTwitter } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { IconContext } from "react-icons";

const Section3 = () => {
  return (
    <>
      <Container className=" ">
        <Row>
          <div className="d-flex teamHeaderWrapper">
            <IconContext.Provider
              value={{
                color: "black",
                size: "2.2rem",
                style: { padding: "0.1rem" },
              }}
            >
              <LiaPawSolid />
            </IconContext.Provider>
            <h3>Our Team</h3>
          </div>
        </Row>
        <Row className="p-5 justify-content-center">
          <Card style={{ width: "17rem" }} className="border-0">
            <Card.Img src={member1Img}></Card.Img>
            <Card.Body>
              <Card.Title>Dr Abcd</Card.Title>
              <Card.Text>Specilist dns tel zafr</Card.Text>
            </Card.Body>
            <Card.Footer className="p-2">
              <IconContext.Provider
                value={{
                  color: "black",
                  size: "1.5rem",
                  style: { padding: "0.1rem" },
                }}
              >
                <FaTwitter />
                <FaLinkedin />
                <IoLogoWhatsapp />
              </IconContext.Provider>
            </Card.Footer>
          </Card>
          <Card style={{ width: "17rem" }} className="border-0">
            <Card.Img src={member2Img}></Card.Img>
            <Card.Body>
              <Card.Title>Dr Abcd</Card.Title>
              <Card.Text>Specilist dns tel zafr</Card.Text>
            </Card.Body>
            <Card.Footer className="p-2">
              <IconContext.Provider
                value={{
                  color: "black",
                  size: "1.5rem",
                  style: { padding: "0.1rem" },
                }}
              >
                <FaTwitter />
                <FaLinkedin />
                <IoLogoWhatsapp />
              </IconContext.Provider>
            </Card.Footer>
          </Card>
          <Card style={{ width: "17rem" }} className="border-0">
            <Card.Img src={member3Img}></Card.Img>
            <Card.Body>
              <Card.Title>Dr Abcd</Card.Title>
              <Card.Text>Specilist dns tel zafr</Card.Text>
            </Card.Body>
            <Card.Footer className="p-2">
              <IconContext.Provider
                value={{
                  color: "black",
                  size: "1.5rem",
                  style: { padding: "0.1rem" },
                }}
              >
                <FaTwitter />
                <FaLinkedin />
                <IoLogoWhatsapp />
              </IconContext.Provider>
            </Card.Footer>
          </Card>
          <Card style={{ width: "17rem" }} className="border-0">
            <Card.Img src={member4Img}></Card.Img>
            <Card.Body>
              <Card.Title>Dr Abcd</Card.Title>
              <Card.Text>Specilist dns tel zafr</Card.Text>
            </Card.Body>
            <Card.Footer className="p-2">
              <IconContext.Provider
                value={{
                  color: "black",
                  size: "1.5rem",
                  style: { padding: "0.1rem" },
                }}
              >
                <FaTwitter />
                <FaLinkedin />
                <IoLogoWhatsapp />
              </IconContext.Provider>
            </Card.Footer>
          </Card>
        </Row>
      </Container>
    </>
  );
};

export default Section3;
