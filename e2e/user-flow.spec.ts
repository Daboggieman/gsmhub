import { test, expect } from "@playwright/test";

test.describe("User Flow", () => {
  test("should search for a device", async ({ page }) => {
    await page.goto("/");

    // Check title
    await expect(page).toHaveTitle(/GSMHub/i);

    // Search
    const searchInput = page.getByPlaceholderText(/search/i);
    await searchInput.fill("Samsung");
    await searchInput.press("Enter");

    // Check results
    await expect(page.url()).toContain("/search");
    await expect(page.getByText("Samsung")).toBeVisible();
  });

  test("should navigate to device details", async ({ page }) => {
    await page.goto("/search?q=samsung");

    // Click first result
    await page.locator("a.device-card").first().click(); // Assuming class device-card

    // Check details
    await expect(page.url()).toContain("/devices/");
    await expect(page.getByText("Specifications")).toBeVisible();
  });
});
