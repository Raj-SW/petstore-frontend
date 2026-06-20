import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("../../../../Services/api/advertsApi", () => ({
  default: { getAdverts: vi.fn() },
}));

import advertsApi from "../../../../Services/api/advertsApi";
import PromoBannerCarousel from "./PromoBannerCarousel";

beforeEach(() => vi.clearAllMocks());

describe("PromoBannerCarousel", () => {
  it("requests hero adverts on mount", async () => {
    advertsApi.getAdverts.mockResolvedValue({ data: [] });
    render(<PromoBannerCarousel />);
    await waitFor(() => expect(advertsApi.getAdverts).toHaveBeenCalledWith("hero"));
  });

  it("renders nothing when there are no hero banners", async () => {
    advertsApi.getAdverts.mockResolvedValue({ data: [] });
    const { container } = render(<PromoBannerCarousel />);
    await waitFor(() => expect(advertsApi.getAdverts).toHaveBeenCalled());
    expect(container.querySelector(".pbc-root")).toBeNull();
  });

  it("renders a fetched banner with a link when provided", async () => {
    advertsApi.getAdverts.mockResolvedValue({
      data: [{ _id: "1", image: "https://x/img.jpg", title: "Promo", link: "/petshop" }],
    });
    render(<PromoBannerCarousel />);
    const img = await screen.findByAltText("Promo");
    expect(img).toBeInTheDocument();
    expect(img.closest("a")).toHaveAttribute("href", "/petshop");
  });
});
