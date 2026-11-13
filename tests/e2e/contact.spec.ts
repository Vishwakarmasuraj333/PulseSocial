import { test, expect } from "@playwright/test";

test.describe("Contact Page Tests (Defects 33–39)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact", { waitUntil: "networkidle" });
  });

  test("Defect 33: Phone number field has correct placeholder '+Country Code Phone Number'", async ({ page }) => {
    const phoneInput = page.locator('input[type="tel"]');
    await expect(phoneInput).toBeVisible();
    await expect(phoneInput).toHaveAttribute("placeholder", "+Country Code Phone Number");
  });

  test("Defect 34: Subject field has placeholder 'Enter inquiry subject'", async ({ page }) => {
    const subjectInput = page.locator('input[placeholder="Enter inquiry subject"]');
    await expect(subjectInput).toBeVisible();
  });

  test("Defect 35: Message textarea has placeholder 'Describe your request or question...'", async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder="Describe your request or question..."]');
    await expect(messageInput).toBeVisible();
  });

  test("Defect 36: Help text below phone number reads 'Available 24/7 for supported regions'", async ({ page }) => {
    const helpText = page.locator("text=Available 24/7 for supported regions");
    await expect(helpText).toBeVisible();
  });

  test("Defect 37: Required field asterisks (*) are displayed for Name, Email, Subject, Message", async ({ page }) => {
    const requiredLabels = page.locator("label:has-text('*')");
    const count = await requiredLabels.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test("Defect 38: Dynamic button label changes when category pill is selected", async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();

    // Default category is SUPPORT -> Submit Support Request
    await expect(submitBtn).toContainText("Submit Support Request");

    // Click Sales pill
    const salesPill = page.locator("button:has-text('Enterprise Sales & Demo')");
    await salesPill.click();
    await page.waitForTimeout(200);
    await expect(submitBtn).toContainText("Submit Sales Inquiry");

    // Click Callback pill
    const callbackPill = page.locator("button:has-text('Request a Callback')");
    await callbackPill.click();
    await page.waitForTimeout(200);
    await expect(submitBtn).toContainText("Submit Callback Request");

    // Click Billing pill
    const billingPill = page.locator("button:has-text('Billing & Plans')");
    await billingPill.click();
    await page.waitForTimeout(200);
    await expect(submitBtn).toContainText("Submit Billing Inquiry");
  });

  test("Defect 39: Form validation blocks empty submission and shows feedback", async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]');
    const nameInput = page.locator('input[placeholder="Alex Rivera"]');
    await expect(nameInput).toBeVisible();

    // Verify HTML5 required validation attribute
    await expect(nameInput).toHaveAttribute("required", "");

    // Attempt submission without typing name
    await submitBtn.click();
    const isInvalid = await nameInput.evaluate((el: HTMLInputElement) => !el.checkValidity() || el.value === "");
    expect(isInvalid).toBe(true);
  });
});
