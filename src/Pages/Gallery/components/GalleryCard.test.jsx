import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GalleryCard from "./GalleryCard";

const post = {
  _id: "g1",
  slug: "pet-expo-2026",
  title: "Pet Expo 2026",
  category: "event",
  eventDate: "2026-03-12T00:00:00Z",
  location: "Pailles",
  excerpt: "A great day at the expo",
  coverImage: "",
};

describe("GalleryCard", () => {
  it("renders title, category label, location and excerpt", () => {
    render(<GalleryCard post={post} />, { wrapper: MemoryRouter });
    expect(screen.getByText("Pet Expo 2026")).toBeInTheDocument();
    expect(screen.getByText("Event")).toBeInTheDocument();
    expect(screen.getByText(/Pailles/)).toBeInTheDocument();
    expect(screen.getByText(/A great day/)).toBeInTheDocument();
  });

  it("links to the detail page by slug", () => {
    render(<GalleryCard post={post} />, { wrapper: MemoryRouter });
    expect(screen.getByRole("link")).toHaveAttribute("href", "/gallery/pet-expo-2026");
  });

  it("falls back to id when slug is missing", () => {
    render(<GalleryCard post={{ ...post, slug: undefined }} />, { wrapper: MemoryRouter });
    expect(screen.getByRole("link")).toHaveAttribute("href", "/gallery/g1");
  });
});
