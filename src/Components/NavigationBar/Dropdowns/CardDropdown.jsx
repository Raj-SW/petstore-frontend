import React from "react";
import "./CardDropdown.css";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import classNames from "classnames";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { Link } from "react-router-dom";
import Carousel from "react-bootstrap/Carousel";
import Serviceimg1 from "../../../assets/NavigationBarAssets/Services/img1.webp";
import Serviceimg2 from "../../../assets/NavigationBarAssets/Services/img2.webp";
import Serviceimg3 from "../../../assets/NavigationBarAssets/Services/img3.webp";
import PetStoreimg1 from "../../../assets/NavigationBarAssets/PetStore/img1.webp";
import PetStoreimg2 from "../../../assets/NavigationBarAssets/PetStore/img2.webp";
import PetStoreimg3 from "../../../assets/NavigationBarAssets/PetStore/img3.webp";
import Communityimg1 from "../../../assets/NavigationBarAssets/Community/img1.webp";
import Communityimg2 from "../../../assets/NavigationBarAssets/Community/img2.webp";
import Communityimg3 from "../../../assets/NavigationBarAssets/Community/img3.webp";
import { Image } from "react-bootstrap";
import { FaCrown } from "react-icons/fa6";

const CardDropDown = () => {
  return (
    <>
      <NavigationMenu.Root className="NavigationMenuRoot">
        <NavigationMenu.List className="NavigationMenuList">
          <NavigationMenu.Item>
            <NavigationMenu.Trigger className="NavigationMenuTrigger">
              Services <CaretDownIcon className="CaretDown" aria-hidden />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content className="NavigationMenuContent">
              <ul className="List one">
                <li style={{ gridRow: "span 7" }}>
                  <NavigationMenu.Link asChild>
                    {/* <a className="Callout" href="/"> */}
                    {/* <svg
                        aria-hidden
                        width="38"
                        height="38"
                        viewBox="0 0 25 25"
                        fill="white"
                      >
                        <path d="M12 25C7.58173 25 4 21.4183 4 17C4 12.5817 7.58173 9 12 9V25Z"></path>
                        <path d="M12 0H4V8H12V0Z"></path>
                        <path d="M17 8C19.2091 8 21 6.20914 21 4C21 1.79086 19.2091 0 17 0C14.7909 0 13 1.79086 13 4C13 6.20914 14.7909 8 17 8Z"></path>
                      </svg> */}

                    {/* <div className="CalloutHeading">Place Holder</div> */}
                    {/* <p className="CalloutText">Placeholder Description.</p> */}
                    {/* </a> */}
                    <div className="NavigationCarouselWrapper">
                      <Carousel
                        controls={false} // Show navigation controls
                        indicators={true} // Show slide position indicators
                        interval={1000} // Set interval to 2 seconds
                        pause="hover" // Pause when hovered
                        keyboard={true} // Enable keyboard navigation
                        wrap={true} // Allow continuous cycling
                      >
                        <Carousel.Item>
                          <Image
                            src={Serviceimg1}
                            style={{
                              width: "245px",
                              height: "245px",
                              objectFit: "cover",
                            }}
                          />
                        </Carousel.Item>
                        <Carousel.Item>
                          <Image
                            src={Serviceimg2}
                            style={{
                              width: "245px",
                              height: "245px",
                              objectFit: "cover",
                            }}
                          />
                        </Carousel.Item>
                        <Carousel.Item>
                          <Image
                            src={Serviceimg3}
                            style={{
                              width: "200px",
                              height: "245px",
                              objectFit: "cover",
                            }}
                          />
                        </Carousel.Item>
                      </Carousel>
                    </div>
                  </NavigationMenu.Link>
                </li>

                <ListItem href="" title="Veterinary Care"></ListItem>
                <ListItem href="" title="Wellness tracker"></ListItem>
                <ListItem href="" title="Pet Transport"></ListItem>
                <ListItem href="" title="Grooming"></ListItem>
                <ListItem href="" title="Boarding"></ListItem>
                <ListItem href="" title="Training centre"></ListItem>
                <ListItem href="" title="Pet Relocation"></ListItem>
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>

          <NavigationMenu.Item>
            <NavigationMenu.Trigger className="NavigationMenuTrigger">
              Insurance <CaretDownIcon className="CaretDown" aria-hidden />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content className="NavigationMenuContent">
              <ul className="List two">
                <ListItem href="" title="Placeholder Item"></ListItem>{" "}
                <ListItem href="" title="Placeholder Item"></ListItem>{" "}
                <ListItem href="" title="Placeholder Item"></ListItem>
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Trigger className="NavigationMenuTrigger">
              Pet Boutique <CaretDownIcon className="CaretDown" aria-hidden />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content className="NavigationMenuContent">
              <ul className="List one">
                <li style={{ gridRow: "span 7" }}>
                  <NavigationMenu.Link asChild>
                    {/* <a className="Callout" href="/">
                      <svg
                        aria-hidden
                        width="38"
                        height="38"
                        viewBox="0 0 25 25"
                        fill="white"
                      >
                        <path d="M12 25C7.58173 25 4 21.4183 4 17C4 12.5817 7.58173 9 12 9V25Z"></path>
                        <path d="M12 0H4V8H12V0Z"></path>
                        <path d="M17 8C19.2091 8 21 6.20914 21 4C21 1.79086 19.2091 0 17 0C14.7909 0 13 1.79086 13 4C13 6.20914 14.7909 8 17 8Z"></path>
                      </svg>
                      <div className="CalloutHeading">Place Holder</div>
                      <p className="CalloutText">Placeholder Description.</p>
                    </a> */}
                    <div className="NavigationCarouselWrapper">
                      <Carousel
                        controls={false} // Show navigation controls
                        indicators={true} // Show slide position indicators
                        interval={1000} // Set interval to 2 seconds
                        pause="hover" // Pause when hovered
                        keyboard={true} // Enable keyboard navigation
                        wrap={true} // Allow continuous cycling
                      >
                        <Carousel.Item>
                          <Image
                            src={PetStoreimg1}
                            style={{
                              width: "245px",
                              height: "245px",
                              objectFit: "cover",
                            }}
                          />
                        </Carousel.Item>
                        <Carousel.Item>
                          <Image
                            src={PetStoreimg2}
                            style={{
                              width: "245px",
                              height: "245px",
                              objectFit: "cover",
                            }}
                          />
                        </Carousel.Item>
                        <Carousel.Item>
                          <Image
                            src={PetStoreimg3}
                            style={{
                              width: "200px",
                              height: "245px",
                              objectFit: "cover",
                            }}
                          />
                        </Carousel.Item>
                      </Carousel>
                    </div>
                  </NavigationMenu.Link>
                </li>
                <ListItem href="" title="Placeholder Item"></ListItem>{" "}
                <ListItem href="" title="Placeholder Item"></ListItem>{" "}
                <ListItem href="" title="Placeholder Item"></ListItem>
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Trigger className="NavigationMenuTrigger">
              Community <CaretDownIcon className="CaretDown" aria-hidden />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content className="NavigationMenuContent">
              <ul className="List one">
                <li style={{ gridRow: "span 7" }}>
                  <NavigationMenu.Link asChild>
                    {/* <a className="Callout" href="/">
                      <svg
                        aria-hidden
                        width="38"
                        height="38"
                        viewBox="0 0 25 25"
                        fill="white"
                      >
                        <path d="M12 25C7.58173 25 4 21.4183 4 17C4 12.5817 7.58173 9 12 9V25Z"></path>
                        <path d="M12 0H4V8H12V0Z"></path>
                        <path d="M17 8C19.2091 8 21 6.20914 21 4C21 1.79086 19.2091 0 17 0C14.7909 0 13 1.79086 13 4C13 6.20914 14.7909 8 17 8Z"></path>
                      </svg>
                      <div className="CalloutHeading">Place Holder</div>
                      <p className="CalloutText">Placeholder Description.</p>
                    </a> */}
                    <div className="NavigationCarouselWrapper">
                      <Carousel
                        controls={false} // Show navigation controls
                        indicators={true} // Show slide position indicators
                        interval={1000} // Set interval to 2 seconds
                        pause="hover" // Pause when hovered
                        keyboard={true} // Enable keyboard navigation
                        wrap={true} // Allow continuous cycling
                      >
                        <Carousel.Item>
                          <Image
                            src={Communityimg1}
                            style={{
                              width: "245px",
                              height: "245px",
                              objectFit: "cover",
                            }}
                          />
                        </Carousel.Item>
                        <Carousel.Item>
                          <Image
                            src={Communityimg2}
                            style={{
                              width: "245px",
                              height: "245px",
                              objectFit: "cover",
                            }}
                          />
                        </Carousel.Item>
                        <Carousel.Item>
                          <Image
                            src={Communityimg3}
                            style={{
                              width: "200px",
                              height: "245px",
                              objectFit: "cover",
                            }}
                          />
                        </Carousel.Item>
                      </Carousel>
                    </div>
                  </NavigationMenu.Link>
                </li>
                <ListItem href="" title="Placeholder Item"></ListItem>
                <ListItem href="" title="Placeholder Item"></ListItem>
                <ListItem href="" title="Placeholder Item"></ListItem>
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
          <NavigationMenu.Item className="membershipNavLink ">
            <NavigationMenu.Trigger className="NavigationMenuTrigger membershipTriggerContent ">
              <p>
                Membership <FaCrown style={{ color: "gold" }} />
              </p>
              <CaretDownIcon className="CaretDown" aria-hidden />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content className="NavigationMenuContent">
              <ul className="List two">
                <ListItem href="" title="Placeholder Item"></ListItem>
                <ListItem href="" title="Placeholder Item"></ListItem>
                <ListItem href="" title="Placeholder Item"></ListItem>
                <ListItem href="" title="Placeholder Item"></ListItem>
                <ListItem href="" title="Placeholder Item"></ListItem>
                <ListItem href="" title="Placeholder Item"></ListItem>
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
        <div className="ViewportPosition">
          <NavigationMenu.Viewport className="NavigationMenuViewport" />
        </div>
      </NavigationMenu.Root>
    </>
  );
};
const ListItem = React.forwardRef(
  ({ className, children, title, ...props }, forwardedRef) => (
    <li>
      <NavigationMenu.Link asChild>
        <a
          className={classNames("ListItemLink", className)}
          {...props}
          ref={forwardedRef}
        >
          <div className="ListItemHeading">{title}</div>
          <p className="ListItemText">{children}</p>
        </a>
      </NavigationMenu.Link>
    </li>
  )
);

export default CardDropDown;
