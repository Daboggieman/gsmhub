import { test, expect } from "@playwright/test";

// The admin layout gates every /admin/* route client-side: unauthenticated
// visits land on /admin/login. /admin itself has no page (404), so target
// the dashboard directly.
const ADMIN_URL =
  process.env.E2E_ADMIN_URL || "http://localhost:3000/admin/dashboard";
const ADMIN_EMAIL =
  process.env.E2E_ADMIN_EMAIL || "admin@gsmhub.com";
const ADMIN_PASSWORD =
  process.env.E2E_ADMIN_PASSWORD ||
  (() => {
    throw new Error(
      "E2E_ADMIN_PASSWORD env var is required to run admin-flow.spec.ts",
    );
  })();

test.describe("Admin Flow", () => {
  test("should login and navigate to dashboard", async ({ page }) => {
    await page.goto(ADMIN_URL);

    // The redirect happens after hydration (client-side auth check), so
    // wait for the URL rather than asserting immediately.
    await page.waitForURL("**/admin/login", { timeout: 15000 });

    // Login (placeholders are "you@example.com" / "••••••••" — target ids)
    await page.locator("#email-address").fill(ADMIN_EMAIL);
    await page.locator("#password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();

    // Dashboard
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
    await expect(
      page.getByRole("heading", { name: /dashboard/i }),
    ).toBeVisible();
  });
});
