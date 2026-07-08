import { render } from "@testing-library/react";
import { SkeletonTheme } from "react-loading-skeleton";
import SkeletonCard from "./SkeletonCard";

const wrap = (ui) =>
  render(
    <SkeletonTheme baseColor="#e8ede9" highlightColor="#FAF5F1">
      <div>{ui}</div>
    </SkeletonTheme>
  );

describe("SkeletonCard", () => {
  it("renders correct count for card variant", () => {
    wrap(<SkeletonCard variant="card" count={3} />);
    expect(document.querySelectorAll('[data-testid="skeleton-card-item"]')).toHaveLength(3);
  });

  it("renders correct count for row variant", () => {
    wrap(<SkeletonCard variant="row" count={4} />);
    expect(document.querySelectorAll('[data-testid="skeleton-row-item"]')).toHaveLength(4);
  });

  it("defaults to card variant and count 6", () => {
    wrap(<SkeletonCard />);
    expect(document.querySelectorAll('[data-testid="skeleton-card-item"]')).toHaveLength(6);
  });
});
