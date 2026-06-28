import { useEffect, useState } from "react";
import axios from "axios";
import { http, HttpResponse } from "msw";
import { describe, it, expect } from "vitest";
import { renderWithProviders, screen } from "../helpers/render.jsx";
import { server } from "../helpers/server.js";

// A minimal real-axios consumer. This is the integration analog of the
// backend's first Supertest smoke: it proves the MSW <-> axios <-> RTL
// pipeline is wired correctly before any page-level tests are written.
function DemoList() {
  const [items, setItems] = useState(null);
  useEffect(() => {
    axios.get("/api/demo").then((res) => setItems(res.data.items));
  }, []);
  if (!items) return <p>Loading…</p>;
  return (
    <ul>
      {items.map((name) => (
        <li key={name}>{name}</li>
      ))}
    </ul>
  );
}

describe("integration harness", () => {
  it("renders data fetched through MSW", async () => {
    server.use(
      http.get("/api/demo", () =>
        HttpResponse.json({ items: ["Rex", "Bella"] }),
      ),
    );

    renderWithProviders(<DemoList />);

    expect(await screen.findByText("Rex")).toBeInTheDocument();
    expect(screen.getByText("Bella")).toBeInTheDocument();
  });

  it("loads the default handler set (GET /api/health)", async () => {
    // /api/health is in the default handlers, so this resolves; asserts the
    // default handler set is actually loaded.
    const res = await axios.get("/api/health");
    expect(res.data).toEqual({ status: "ok" });
  });
});
