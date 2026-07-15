import { Page, expect } from "@playwright/test";

export function createHeroActions(page: Page) {
  return {
    async goToConfigurator() {
      await page.goto('/')
      await page.getByRole('link', { name: /Configure Agora/i }).click()
      await expect(page).toHaveURL(/\/configure/)
    },
  }
}