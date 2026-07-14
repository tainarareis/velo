import { Locator, Page, expect } from '@playwright/test'

export type CheckoutFieldError = {
  message: string
  testId: string
}

export const CHECKOUT_ERRORS = {
  nameMin: {
    message: 'Nome deve ter pelo menos 2 caracteres',
    testId: 'error-name',
  },
  surnameMin: {
    message: 'Sobrenome deve ter pelo menos 2 caracteres',
    testId: 'error-lastname',
  },
  emailInvalid: {
    message: 'Email inválido',
    testId: 'error-email',
  },
  phoneInvalid: {
    message: 'Telefone inválido',
    testId: 'error-phone',
  },
  cpfInvalid: {
    message: 'CPF inválido',
    testId: 'error-document',
  },
  storeRequired: {
    message: 'Selecione uma loja',
    testId: 'error-store',
  },
  termsRequired: {
    message: 'Aceite os termos',
    testId: 'error-terms',
  },
} as const satisfies Record<string, CheckoutFieldError>


const STORAGE_KEY = 'velo-configurator-storage'

export const VALID_CHECKOUT_DATA = {
  name: 'João',
  surname: 'Silva',
  email: 'cliente@email.com',
  phone: '(11) 99999-9999',
  cpf: '529.982.247-25',
  store: 'Velô Paulista - Av. Paulista, 1000',
} as const

export function createCheckoutActions(page: Page) {
  return {
    async open() {
      await page.goto('/order')
      await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY)
      await page.reload()
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
    },

    async disableNativeValidation() {
      await page.locator('form').evaluate((form: HTMLFormElement) => {
        form.noValidate = true
      })
    },

    async fillName(value: string) {
      await page.getByLabel('Nome', { exact: true }).fill(value)
    },

    async fillLastname(value: string) {
      await page.getByLabel('Sobrenome', { exact: true }).fill(value)
    },

    async fillEmail(value: string) {
      await page.getByLabel('Email', { exact: true }).fill(value)
    },

    async fillPhone(value: string) {
      await page.getByLabel('Telefone', { exact: true }).fill(value)
    },

    async fillCpf(value: string) {
      await page.getByLabel('CPF', { exact: true }).fill(value)
    },

    async selectStore(storeName: string) {
      await page.getByTestId('checkout-store').click()
      await page.getByRole('option', { name: storeName }).click()
    },

    async acceptTerms(checked: boolean) {
      const terms = page.getByRole('checkbox', {
        name: /Li e aceito os Termos de Uso/i,
      })

      if (checked) {
        await terms.check()
      } else {
        await terms.uncheck()
      }
    },

    async fillValidCustomerData(options?: {
      includeCpf?: boolean
      acceptTerms?: boolean
    }) {
      const { includeCpf = true, acceptTerms = false } = options || {}
      const data = VALID_CHECKOUT_DATA

      await this.fillName(data.name)
      await this.fillLastname(data.surname)
      await this.fillEmail(data.email)
      await this.fillPhone(data.phone)

      if (includeCpf) {
        await this.fillCpf(data.cpf)
      }

      await this.selectStore(data.store)

      if (acceptTerms) {
        await this.acceptTerms(true)
      }
    },

    async submit() {
      await this.disableNativeValidation()
      await page.getByRole('button', { name: 'Confirmar Pedido' }).click()
    },

    async selectPaymentAvista() {
      await page.getByTestId('payment-avista').click()
    },

    async selectPaymentFinanciamento() {
      await page.getByTestId('payment-financiamento').click()
    },

    async fillEntryValue(value: string) {
      await page.getByTestId('input-entry-value').fill(value)
    },

    async expectOrderSuccess() {
      await expect(page).toHaveURL(/\/success/)
      const statusElement = page.getByTestId('success-status')
      await expect(statusElement).toBeVisible()
      await expect(statusElement).toHaveText('Pedido Aprovado!')
      await expect(page.getByTestId('order-id')).toBeVisible()
    },

    async expectOrderAnalysis() {
      await expect(page).toHaveURL(/\/success/)
      const statusElement = page.getByTestId('success-status')
      await expect(statusElement).toBeVisible()
      await expect(statusElement).toHaveText('Pedido em Análise!')
      await expect(page.getByTestId('order-id')).toBeVisible()
    },

    async expectOrderReproved() {
      await expect(page).toHaveURL(/\/success/)
      const statusElement = page.getByTestId('success-status')
      await expect(statusElement).toBeVisible()
      await expect(statusElement).toHaveText('Crédito Reprovado')
      await expect(page.getByTestId('order-id')).toBeVisible()
    },

    async expectStillOnCheckout() {
      await expect(page).toHaveURL(/\/order/)
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
    },

    async expectError(error: CheckoutFieldError) {
      const errorElement = page.getByTestId(error.testId)
      await expect(errorElement).toBeVisible()
      await expect(errorElement).toHaveText(error.message)
    },

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
