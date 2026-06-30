import { Page, expect } from '@playwright/test'

export type ExteriorColorLabel = 'Glacier Blue' | 'Midnight Black' | 'Lunar White'
export type OptionalFeature = 'precision-park' | 'flux-capacitor'

export const CONFIGURATOR_ASSETS = {
  midnightBlackAero: '/src/assets/midnight-black-aero-wheels.png',
  lunarWhiteAero: '/src/assets/lunar-white-aero-wheels.png',
  glacierBlueSport: '/src/assets/glacier-blue-sport-wheels.png',
  glacierBlueAero: '/src/assets/glacier-blue-aero-wheels.png',
} as const

export const BASE_PRICE = 'R$ 40.000,00'
export const SPORT_WHEELS_PRICE = 'R$ 42.000,00'
export const PRECISION_PARK_PRICE = 'R$ 45.500,00'
export const BOTH_OPTIONALS_PRICE = 'R$ 50.500,00'

const OPTIONAL_NAMES: Record<OptionalFeature, RegExp> = {
  'precision-park': /Precision Park/i,
  'flux-capacitor': /Flux Capacitor/i,
}

const STORAGE_KEY = 'velo-configurator-storage'

export function createConfiguratorActions(page: Page) {
  function optionalCheckbox(optional: OptionalFeature) {
    return page.getByRole('checkbox', { name: OPTIONAL_NAMES[optional] })
  }

  return {
    async resetStorage() {
      await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY)
      await page.reload()
    },

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

    async toggleOptional(optional: OptionalFeature) {
      await optionalCheckbox(optional).click()
    },

    async expectOptionalChecked(optional: OptionalFeature, checked: boolean) {
      const checkbox = optionalCheckbox(optional)
      if (checked) {
        await expect(checkbox).toBeChecked()
      } else {
        await expect(checkbox).not.toBeChecked()
      }
    },

    async finishConfigurator() {
      await page.getByRole('button', { name: 'Monte o Seu' }).click()
      await expect(page).toHaveURL(/\/order/)
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
    },
  }
}
