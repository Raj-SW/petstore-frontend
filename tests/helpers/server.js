import { setupServer } from "msw/node";
import { handlers } from "./handlers.js";

// Shared MSW server for the integration project. Lifecycle is wired in
// setup.integration.js (listen / resetHandlers / close).
export const server = setupServer(...handlers);
