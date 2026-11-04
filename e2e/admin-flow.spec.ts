import { test, expect } from "@playwright/test";

// Route is /admin/login (verified in app — no /admin/auth/login)
const ADMIN_URL = process.env.E2E_ADMIN_URL || "http://localhost:3000/admin";
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

    // Should redirect to login
    await expect(page.url()).toContain("/admin/login");

    // Login
    await page.getByPlaceholder(/email/i).fill(ADMIN_EMAIL);
    await page.getByPlaceholder(/password/i).fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /login/i }).click();

    // Dashboard
    await expect(page.url()).toContain("/admin/dashboard");
    await expect(page.getByText("Device Inventory")).toBeVisible();
  });
});
