import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TipCard, { SponsoredCard } from "./TipCard";

const tip = {
  _id: "t1",
  slug: "how-to-feed-your-dog",
  title: "How to feed your dog",
  animalType: "dog",
  category: "nutrition",
  difficulty: "beginner",
  readTime: 5,
  coverImage: "",
};

describe("TipCard", () => {
  it("renders title, badges and read time", () => {
    render(<TipCard tip={tip} />, { wrapper: MemoryRouter });
    expect(screen.getByText("How to feed your dog")).toBeInTheDocument();
    expect(screen.getByText("Dog")).toBeInTheDocument();
    expect(screen.getByText("nutrition")).toBeInTheDocument();
    expect(screen.getByText(/5 min/)).toBeInTheDocument();
  });

  it("links to the tip detail page by slug", () => {
    render(<TipCard tip={tip} />, { wrapper: MemoryRouter });
    expect(screen.getByRole("link")).toHaveAttribute("href", "/pet-care-tips/how-to-feed-your-dog");
  });
});

describe("SponsoredCard", () => {
  it("renders the Sponsored badge and advert title", () => {
    const advert = { _id: "a1", title: "VitaPet supplements", link: "/petshop", image: "" };
    render(<SponsoredCard advert={advert} />, { wrapper: MemoryRouter });
    expect(screen.getByText("Sponsored")).toBeInTheDocument();
    expect(screen.getByText("VitaPet supplements")).toBeInTheDocument();
  });
});
