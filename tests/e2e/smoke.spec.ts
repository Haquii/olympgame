import { test, expect } from "@playwright/test";

test("homepage loads and shows hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText(/gloire/i);
  await expect(page.getByRole("link", { name: /lancer un tournoi/i })).toBeVisible();
});

test("can browse tournaments list", async ({ page }) => {
  await page.goto("/tournois");
  await expect(page.locator("h2")).toContainText(/Tous les tournois/i);
  // Au moins une carte de tournoi seed est présente
  await expect(page.locator('a[href*="/tournois/"]').first()).toBeVisible();
});

test("can open a tournament detail page", async ({ page }) => {
  await page.goto("/tournois");
  const firstCard = page.locator('a[href*="/tournois/"]').first();
  await firstCard.click();
  await expect(page.locator("h1")).toBeVisible();
  // Doit avoir les onglets
  await expect(page.getByRole("button", { name: /Classement/i })).toBeVisible();
});

test("can navigate to create page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /lancer un tournoi/i }).click();
  await expect(page).toHaveURL(/\/creer/);
  await expect(page.locator("h2")).toContainText(/Créer un tournoi/i);
});

test("legal page is accessible", async ({ page }) => {
  await page.goto("/legal");
  await expect(page.locator("h1")).toContainText(/Mentions légales/i);
});
