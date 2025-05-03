import React from "react";
import "./CardDropdown.css";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import classNames from "classnames";
import { CaretDownIcon } from "@radix-ui/react-icons";
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

// Navigation menu configuration
const MENU_ITEMS = [
  {
    title: "Services",
    images: [Serviceimg1, Serviceimg2, Serviceimg3],
    links: [
      { title: "Veterinary Appointment", href: "/vet" },
      { title: "Pet Taxi Appointment", href: "/taxi" },
      { title: "Grooming Appointment", href: "/grooming" },
      { title: "Pet Relocation", href: "/relocation" },
    ],
  },
];

// Reusable carousel component
const NavigationCarousel = ({ images }) => (
  <Carousel
    controls={false}
    indicators={true}
    interval={1000}
    pause="hover"
    keyboard={true}
    wrap={true}
  >
    {images.map((image, index) => (
      <Carousel.Item key={index}>
        <Image
          src={image}
          style={{
            width: index === 2 ? "200px" : "245px",
            height: "245px",
            objectFit: "cover",
          }}
        />
      </Carousel.Item>
    ))}
  </Carousel>
);

// List item component
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

const CardDropDown = () => {
  return (
    <NavigationMenu.Root className="NavigationMenuRoot">
      <NavigationMenu.List className="NavigationMenuList">
        <NavigationMenu.Item>
          <NavigationMenu.Trigger className="NavigationMenuTrigger fs-5">
            Services{" "}
            <CaretDownIcon
              className="CaretDown"
              aria-hidden
              style={{ width: "1.5rem", height: "1.5rem" }}
            />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="NavigationMenuContent">
            <ul className="List one">
              <li style={{ gridRow: "span 7" }}>
                <NavigationMenu.Link asChild>
                  <div className="NavigationCarouselWrapper">
                    <Carousel
                      controls={false}
                      indicators={true}
                      interval={1000}
                      pause="hover"
                      keyboard={true}
                      wrap={true}
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

              <ListItem href="" title="Veterinary Appointment"></ListItem>
              <ListItem href="" title="Pet Taxi Appointment"></ListItem>
              <ListItem href="" title="Grooming Appointment"></ListItem>
              <ListItem href="" title="Pet Relocation"></ListItem>
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Trigger className="NavigationMenuTrigger fs-5">
            Pet Boutique{" "}
            <CaretDownIcon
              className="CaretDown"
              aria-hidden
              style={{ width: "1.5rem", height: "1.5rem" }}
            />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="NavigationMenuContent">
            <ul className="List one">
              <li style={{ gridRow: "span 7" }}>
                <NavigationMenu.Link asChild>
                  <div className="NavigationCarouselWrapper">
                    <Carousel
                      controls={false}
                      indicators={true}
                      interval={1000}
                      pause="hover"
                      keyboard={true}
                      wrap={true}
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
              <ListItem href="" title="Placeholder Item"></ListItem>
              <ListItem href="" title="Placeholder Item"></ListItem>
              <ListItem href="" title="Placeholder Item"></ListItem>
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger className="NavigationMenuTrigger fs-5">
            Community{" "}
            <CaretDownIcon
              className="CaretDown"
              aria-hidden
              style={{ width: "1.5rem", height: "1.5rem" }}
            />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="NavigationMenuContent">
            <ul className="List one">
              <li style={{ gridRow: "span 7" }}>
                <NavigationMenu.Link asChild>
                  <div className="NavigationCarouselWrapper">
                    <Carousel
                      controls={false}
                      indicators={true}
                      interval={1000}
                      pause="hover"
                      keyboard={true}
                      wrap={true}
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
      </NavigationMenu.List>
      <div className="ViewportPosition">
        <NavigationMenu.Viewport className="NavigationMenuViewport" />
      </div>
    </NavigationMenu.Root>
  );
};

export default CardDropDown;
