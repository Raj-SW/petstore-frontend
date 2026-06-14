import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import GoogleMap, { CLINIC_LOCATION } from "./GoogleMap";

describe("GoogleMap", () => {
  it("renders an iframe embedding the query", () => {
    const { container } = render(<GoogleMap query={CLINIC_LOCATION} title="Find us" />);
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeTruthy();
    expect(iframe.getAttribute("src")).toContain("output=embed");
    expect(iframe.getAttribute("src")).toContain(encodeURIComponent(CLINIC_LOCATION));
  });

  it("defaults to the clinic location", () => {
    const { container } = render(<GoogleMap />);
    expect(container.querySelector("iframe").getAttribute("src")).toContain(encodeURIComponent(CLINIC_LOCATION));
  });
});
