import { test, expect } from "@playwright/test";

test.describe("User Flow", () => {
  test("should reach search results from the homepage", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/GSMHub/i);

    // The homepage's search affordance is the "Search Now" CTA (the
    // typeahead SearchBar only lives in the desktop header; on mobile the
    // header shows a link to /search).
    await page.getByRole("link", { name: /search now/i }).click();
    await page.waitForURL("**/search", { timeout: 15000 });

    // Results grid renders device links
    await expect(page.locator('a[href^="/devices/"]').first()).toBeVisible();
  });

  test("should navigate to device details", async ({ page }) => {
    await page.goto("/search?q=samsung");

    // Device cards link to /devices/<slug> (DeviceCard has no stable class)
    await page.locator('a[href^="/devices/"]').first().click();
    await page.waitForURL("**/devices/**", { timeout: 15000 });

    await expect(
      page.getByRole("heading", { name: /full specifications/i }),
    ).toBeVisible();
  });
});
