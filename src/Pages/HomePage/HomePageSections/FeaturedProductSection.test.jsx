import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// framer-motion's AnimatePresence mode="wait" never completes its exit
// animation in jsdom, which blocks the next tab's content from mounting.
// Stub it to plain elements so tab switching is deterministic.
vi.mock("framer-motion", async () => {
  const React = await import("react");
  const FRAMER_PROPS = new Set([
    "initial", "animate", "exit", "transition", "whileInView", "whileHover",
    "whileTap", "viewport", "layoutId", "layout", "variants",
  ]);
  const motion = new Proxy(
    {},
    {
      get: (_t, tag) =>
        React.forwardRef(({ children, ...props }, ref) => {
          const rest = {};
          for (const k of Object.keys(props)) {
            if (!FRAMER_PROPS.has(k)) rest[k] = props[k];
          }
          return React.createElement(tag, { ref, ...rest }, children);
        }),
    }
  );
  return {
    motion,
    AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
    useInView: () => true,
  };
});

// Carousel mocked to lightweight passthroughs — embla needs real layout/ResizeObserver
vi.mock("@/components/ui/carousel", () => ({
  Carousel: ({ children }) => <div data-testid="carousel">{children}</div>,
  CarouselContent: ({ children }) => <div>{children}</div>,
  CarouselItem: ({ children }) => <div>{children}</div>,
  CarouselPrevious: () => <button type="button">prev</button>,
  CarouselNext: () => <button type="button">next</button>,
}));

// Autoplay plugin construction is not exercised here
vi.mock("./featuredAutoplay", () => ({ buildCarouselPlugins: () => [] }));

// ProductCardV2 depends on CartContext; stub it to its title so this test
// stays focused on the section's data + layout logic.
vi.mock("../../../Components/HelperComponents/ProductCard/ProductCardV2", () => ({
  default: ({ title }) => <div>{title}</div>,
}));

vi.mock("@/Services/api/productsApi", () => ({
  default: { getFeaturedByCategory: vi.fn() },
}));

import productsApi from "@/Services/api/productsApi";
import FeaturedProductSection from "./FeaturedProductSection";

const make = (name) => [{ _id: name, name, price: 100, images: [{ url: "" }] }];

beforeEach(() => {
  vi.clearAllMocks();
  productsApi.getFeaturedByCategory.mockImplementation((key) =>
    Promise.resolve(make(`${key}-product`))
  );
});

describe("FeaturedProductSection carousel", () => {
  it("requests up to 100 featured items per category", async () => {
    render(<FeaturedProductSection />, { wrapper: MemoryRouter });
    await waitFor(() => {
      expect(productsApi.getFeaturedByCategory).toHaveBeenCalledWith("general", 100);
      expect(productsApi.getFeaturedByCategory).toHaveBeenCalledWith("dogs", 100);
      expect(productsApi.getFeaturedByCategory).toHaveBeenCalledWith("cats", 100);
      expect(productsApi.getFeaturedByCategory).toHaveBeenCalledWith("fish", 100);
    });
  });

  it("renders the active category's products inside the carousel", async () => {
    render(<FeaturedProductSection />, { wrapper: MemoryRouter });
    const carousel = await screen.findByTestId("carousel");
    expect(await within(carousel).findByText("general-product")).toBeInTheDocument();
  });

  it("switches the carousel contents when another tab is clicked", async () => {
    render(<FeaturedProductSection />, { wrapper: MemoryRouter });
    await screen.findByTestId("carousel");
    fireEvent.click(screen.getByRole("button", { name: "Dogs" }));
    const carousel = await screen.findByTestId("carousel");
    expect(await within(carousel).findByText("dogs-product")).toBeInTheDocument();
  });
});
