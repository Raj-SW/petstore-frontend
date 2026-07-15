import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

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
    useInView: () => true,
  };
});

// Carousel mocked to lightweight passthroughs — embla needs real layout/ResizeObserver.
// setApi is fed a fake embla api reporting 2 snaps so the section shows its arrows
// (they are hidden when everything fits in one view).
vi.mock("@/Components/ui/carousel", async () => {
  const React = await import("react");
  const fakeApi = {
    scrollSnapList: () => [0, 1],
    selectedScrollSnap: () => 0,
    scrollTo: () => {},
    on: () => {},
    off: () => {},
  };
  return {
    Carousel: ({ children, setApi }) => {
      React.useEffect(() => { setApi?.(fakeApi); }, [setApi]);
      return <div data-testid="carousel">{children}</div>;
    },
    CarouselContent: ({ children }) => <div>{children}</div>,
    CarouselItem: ({ children }) => <div>{children}</div>,
    CarouselPrevious: () => <button type="button">prev</button>,
    CarouselNext: () => <button type="button">next</button>,
  };
});

vi.mock("../../../../Components/HelperComponents/ProductCard/ProductCardV2", () => ({
  default: ({ title }) => <div>{title}</div>,
}));

vi.mock("@/Services/api/productsApi", () => ({
  default: { getProducts: vi.fn() },
}));

import productsApi from "@/Services/api/productsApi";
import VetRecommendedSection from "./VetRecommendedSection";

const makeProducts = (n) =>
  Array.from({ length: n }, (_, i) => ({
    _id: `p${i}`,
    name: `Product ${i}`,
    price: 10,
    images: [{ url: "" }],
  }));

beforeEach(() => vi.clearAllMocks());

describe("VetRecommendedSection", () => {
  it("requests vetRecommended=true active products beyond one desktop view", async () => {
    productsApi.getProducts.mockResolvedValue({ data: makeProducts(4) });
    render(<VetRecommendedSection />);
    await waitFor(() => {
      expect(productsApi.getProducts).toHaveBeenCalledWith({
        vetRecommended: true,
        isActive: true,
        limit: 8,
      });
    });
  });

  it("renders the returned products inside the shared Carousel", async () => {
    productsApi.getProducts.mockResolvedValue({ data: makeProducts(4) });
    render(<VetRecommendedSection />);
    expect(await screen.findByTestId("carousel")).toBeTruthy();
    expect(screen.getByText("Product 0")).toBeTruthy();
    expect(screen.getByText("Product 3")).toBeTruthy();
  });

  it("renders the carousel prev/next controls", async () => {
    productsApi.getProducts.mockResolvedValue({ data: makeProducts(4) });
    render(<VetRecommendedSection />);
    await screen.findByText("Product 0");
    expect(screen.getByRole("button", { name: /prev/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /next/i })).toBeTruthy();
  });

  it("renders the section title and Explore the Store CTA", async () => {
    productsApi.getProducts.mockResolvedValue({ data: makeProducts(2) });
    render(<VetRecommendedSection />);
    await screen.findByText("Product 0");
    expect(screen.getByText("Vet Recommended This Month")).toBeTruthy();
    expect(screen.getByRole("link", { name: /explore the store/i })).toBeTruthy();
  });

  it("renders nothing when there are no vet recommended products", async () => {
    productsApi.getProducts.mockResolvedValue({ data: [] });
    const { container } = render(<VetRecommendedSection />);
    await waitFor(() => expect(productsApi.getProducts).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it("logs and does not crash when the request fails", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    productsApi.getProducts.mockRejectedValue(new Error("network fail"));
    const { container } = render(<VetRecommendedSection />);
    await waitFor(() => expect(errSpy).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
    errSpy.mockRestore();
  });
});
