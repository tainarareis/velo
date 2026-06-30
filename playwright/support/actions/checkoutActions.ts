import { Page, expect } from '@playwright/test'

export function createCheckoutActions(page: Page) {
  return {
    async expectCheckoutPrice(price: string) {
      const totalPrice = page.getByTestId('summary-total-price')
      await expect(totalPrice).toBeVisible()
      await expect(totalPrice).toHaveText(price)
    },

    async expectCheckoutWithoutOptionals() {
      const resumo = page.getByRole('heading', { name: 'Resumo' }).locator('..')
      await expect(resumo.getByText('Precision Park')).not.toBeVisible()
      await expect(resumo.getByText('Flux Capacitor')).not.toBeVisible()
    },
  }
}
