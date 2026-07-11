import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

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
  it("requests vetRecommended=true active products limited to 4", async () => {
    productsApi.getProducts.mockResolvedValue({ data: makeProducts(4) });
    render(<VetRecommendedSection />);
    await waitFor(() => {
      expect(productsApi.getProducts).toHaveBeenCalledWith({
        vetRecommended: true,
        isActive: true,
        limit: 4,
      });
    });
  });

  it("renders the returned products", async () => {
    productsApi.getProducts.mockResolvedValue({ data: makeProducts(4) });
    render(<VetRecommendedSection />);
    expect(await screen.findByText("Product 0")).toBeTruthy();
    expect(screen.getByText("Product 3")).toBeTruthy();
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

  it("renders carousel arrow controls and a dot per product when there are 2+ products", async () => {
    productsApi.getProducts.mockResolvedValue({ data: makeProducts(4) });
    render(<VetRecommendedSection />);
    await screen.findByText("Product 0");
    expect(screen.getByRole("button", { name: /previous product/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /next product/i })).toBeTruthy();
    expect(screen.getAllByRole("tab")).toHaveLength(4);
  });

  it("disables the previous arrow on the first product and marks its dot active", async () => {
    productsApi.getProducts.mockResolvedValue({ data: makeProducts(3) });
    render(<VetRecommendedSection />);
    await screen.findByText("Product 0");
    expect(screen.getByRole("button", { name: /previous product/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next product/i })).not.toBeDisabled();
    expect(screen.getByRole("tab", { name: /go to product 1/i })).toHaveAttribute("aria-selected", "true");
  });

  it("clicking a dot scrolls the carousel to that product", async () => {
    productsApi.getProducts.mockResolvedValue({ data: makeProducts(3) });
    render(<VetRecommendedSection />);
    await screen.findByText("Product 0");
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;
    fireEvent.click(screen.getByRole("tab", { name: /go to product 3/i }));
    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  });

  it("does not render carousel controls for a single product", async () => {
    productsApi.getProducts.mockResolvedValue({ data: makeProducts(1) });
    render(<VetRecommendedSection />);
    await screen.findByText("Product 0");
    expect(screen.queryByRole("button", { name: /previous product/i })).toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
  });
});
