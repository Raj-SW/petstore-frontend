import { test, expect } from "@playwright/test";

// Smoke: the production build boots and the homepage renders without a
// runtime crash. Asserts the document has a title and the page body has
// visible content — deliberately resilient to copy changes.
test("homepage boots and renders", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBeLessThan(400);

  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator("body")).not.toBeEmpty();
});
