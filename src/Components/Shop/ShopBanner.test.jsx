import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("../../Services/api/advertsApi", () => ({
  default: { getAdverts: vi.fn() },
}));

import advertsApi from "../../Services/api/advertsApi";
import ShopBanner from "./ShopBanner";

describe("ShopBanner", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders an advert's title and a Shop now CTA", async () => {
    advertsApi.getAdverts.mockResolvedValue({
      data: [{ _id: "a1", title: "Mega Pet Sale", image: "https://cdn.x/s.jpg", link: "/petshop" }],
    });
    render(<ShopBanner />);
    await waitFor(() => expect(screen.getByText("Mega Pet Sale")).toBeInTheDocument());
    expect(screen.getByText(/shop now/i)).toBeInTheDocument();
  });

  it("renders the branded fallback when there are no shop adverts", async () => {
    advertsApi.getAdverts.mockResolvedValue({ data: [] });
    render(<ShopBanner />);
    await waitFor(() => expect(screen.getByText(/beloved pet/i)).toBeInTheDocument());
  });
});
