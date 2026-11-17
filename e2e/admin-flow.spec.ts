import { test, expect } from "@playwright/test";

// The admin layout gates every /admin/* route client-side: unauthenticated
// visits land on /admin/login. /admin itself has no page (404), so target
// the dashboard directly.
const ADMIN_URL =
  process.env.E2E_ADMIN_URL || "http://localhost:3000/admin/dashboard";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || "admin@gsmhub.com";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

test.describe("Admin Flow", () => {
  test("redirects unauthenticated visits to the login form", async ({
    page,
  }) => {
    await page.goto(ADMIN_URL);

    // The redirect happens after hydration (client-side auth check), so
    // wait for the URL rather than asserting immediately.
    await page.waitForURL("**/admin/login", { timeout: 15000 });
    await expect(
      page.getByRole("heading", { name: /admin login/i }),
    ).toBeVisible();
    await expect(page.locator("#email-address")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("logs in and reaches the dashboard", async ({ page }) => {
    // Needs the real seeded credentials — skip (don't fail) when the
    // operator hasn't provided them.
    test.skip(
      !ADMIN_PASSWORD,
      "E2E_ADMIN_PASSWORD not set — provide the seeded admin password to run",
    );

    await page.goto(ADMIN_URL);
    await page.waitForURL("**/admin/login", { timeout: 15000 });

    await page.locator("#email-address").fill(ADMIN_EMAIL);
    await page.locator("#password").fill(ADMIN_PASSWORD!);
    await page.getByRole("button", { name: /sign in/i }).click();

    // Dashboard
    await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
    await expect(
      page.getByRole("heading", { name: /dashboard/i }),
    ).toBeVisible();
  });
});
