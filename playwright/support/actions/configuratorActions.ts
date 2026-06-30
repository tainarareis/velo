import { Page, expect } from '@playwright/test'

export type ExteriorColorLabel = 'Glacier Blue' | 'Midnight Black' | 'Lunar White'

export const CONFIGURATOR_ASSETS = {
  midnightBlackAero: '/src/assets/midnight-black-aero-wheels.png',
  lunarWhiteAero: '/src/assets/lunar-white-aero-wheels.png',
  glacierBlueSport: '/src/assets/glacier-blue-sport-wheels.png',
  glacierBlueAero: '/src/assets/glacier-blue-aero-wheels.png',
} as const

export const BASE_PRICE = 'R$ 40.000,00'
export const SPORT_WHEELS_PRICE = 'R$ 42.000,00'

export function createConfiguratorActions(page: Page) {

  return {

    async open() {
      await page.goto('/configure')
    },

    async expectPrice(price: string) {
      const priceElement = page.getByTestId('total-price')
      await expect(priceElement).toBeVisible()
      await expect(priceElement).toHaveText(price)
    },

    async selectColor(color: ExteriorColorLabel) {
      await page.getByRole('button', { name: color }).click()
    },

    async selectWheels(wheels: 'sport' | 'aero') {
      const name = wheels === 'sport' ? /Sport Wheels/ : /Aero Wheels/
      await page.getByRole('button', { name }).click()
    },

    async expectCarImageSrc(src: string) {
      const carImage = page.locator('img[alt^="Velô Sprint"]')
      await expect(carImage).toHaveAttribute('src', src)
    },
  }
}
