import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CurrencyProvider } from "@/context/CurrencyContext";

// renderWithProviders mounts a subtree inside the providers a page needs:
// a MemoryRouter (so <Link>/useNavigate work) and the CurrencyProvider
// (so <Price> and currency-aware components render). Pass `route` to set the
// initial URL. Add more providers here as integration coverage grows.
export function renderWithProviders(ui, { route = "/" } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <CurrencyProvider>{ui}</CurrencyProvider>
    </MemoryRouter>,
  );
}

export * from "@testing-library/react";
