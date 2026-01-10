import { test, expect } from "@playwright/test";

test.describe("Admin Flow", () => {
  test("should login and navigate to dashboard", async ({ page }) => {
    await page.goto("/admin");

    // Should redirect to login
    await expect(page.url()).toContain("/admin/auth/login");

    // Login
    await page.getByPlaceholderText(/email/i).fill("admin@gsmhub.com");
    await page.getByPlaceholderText(/password/i).fill("admin123");
    await page.getByRole("button", { name: /login/i }).click();

    // Dashboard
    await expect(page.url()).toContain("/admin/dashboard");
    await expect(page.getByText("Device Inventory")).toBeVisible();
  });
});
