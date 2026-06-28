import { http, HttpResponse } from "msw";

// Default handlers shared by integration tests. Individual tests override these
// with server.use(...) for their specific scenario. jsdom's base URL is
// http://localhost/, so relative "/api/..." requests resolve against that host.
export const handlers = [
  http.get("/api/health", () => HttpResponse.json({ status: "ok" })),
];
