import { test, expect } from '../support/fixtures'
import { CHECKOUT_ERRORS, VALID_CHECKOUT_DATA } from '../support/actions/checkoutActions'
import { deleteOrderByNumber, deleteOrdersByEmail } from '../support/database/orderRepository'


test.describe('Checkout - Validação de Formulário', () => {
  test.beforeEach(async ({ app }) => {
    await app.checkout.open()
  })

  test('deve exibir erros quando todos os campos estão vazios', async ({ app }) => {
    await app.checkout.submit()

    await app.checkout.expectError(CHECKOUT_ERRORS.nameMin)
    await app.checkout.expectError(CHECKOUT_ERRORS.surnameMin)
    await app.checkout.expectError(CHECKOUT_ERRORS.emailInvalid)
    await app.checkout.expectError(CHECKOUT_ERRORS.phoneInvalid)
    await app.checkout.expectError(CHECKOUT_ERRORS.cpfInvalid)
    await app.checkout.expectError(CHECKOUT_ERRORS.storeRequired)
    await app.checkout.expectError(CHECKOUT_ERRORS.termsRequired)
    await app.checkout.expectStillOnCheckout()
  })

  test('deve exigir mínimo de 2 caracteres em nome e sobrenome', async ({ app }) => {
    await app.checkout.fillName('A')
    await app.checkout.fillLastname('B')
    await app.checkout.submit()

    await app.checkout.expectError(CHECKOUT_ERRORS.nameMin)
    await app.checkout.expectError(CHECKOUT_ERRORS.surnameMin)
    await app.checkout.expectStillOnCheckout()
  })

  test('deve rejeitar email com formato inválido', async ({ app }) => {
    await app.checkout.fillEmail('cliente@.com')
    await app.checkout.submit()

    await app.checkout.expectError(CHECKOUT_ERRORS.emailInvalid)
    await app.checkout.expectStillOnCheckout()
  })

  test('deve rejeitar CPF incompleto ou inválido', async ({ app }) => {
    await app.checkout.fillValidCustomerData({ includeCpf: false, acceptTerms: true })
    await app.checkout.submit()

    await app.checkout.expectError(CHECKOUT_ERRORS.cpfInvalid)
    await app.checkout.expectStillOnCheckout()
  })

  test('deve exigir aceite dos termos mesmo com dados válidos', async ({ app }) => {
    await app.checkout.fillValidCustomerData()
    await app.checkout.submit()

    await app.checkout.expectError(CHECKOUT_ERRORS.termsRequired)
    await app.checkout.expectStillOnCheckout()
  })
})

test.describe('Checkout - Fluxo Feliz', () => {
  test('CT05 - deve realizar pedido à vista com sucesso a partir da landing page', async ({ page, app }) => {
    const order = {
      store: 'Velô Paulista - Av. Paulista, 1000',
      expectedPrice: 'R$ 40.000,00',
    } as const

    //Cleanup (First option)
    await deleteOrdersByEmail(VALID_CHECKOUT_DATA.email)

    //Arrange
    await page.goto('/')
    await page.getByRole('link', { name: /Configure Agora/i }).click()
    await expect(page).toHaveURL(/\/configure/)

    await app.configurator.expectPrice(order.expectedPrice)
    await app.configurator.finishConfigurator()

    //Act
    await app.checkout.fillValidCustomerData({ acceptTerms: true , includeCpf: true})

    await app.checkout.selectStore(order.store)
    await app.checkout.selectPaymentAvista()

    await app.checkout.expectCheckoutPrice(order.expectedPrice)

    await app.checkout.acceptTerms(true)
    await app.checkout.submit()

    //Assert
    await app.checkout.expectOrderSuccess()

    //Cleanup (Second option)
    const orderId = await page.getByTestId('order-id').textContent() || ''
    await deleteOrderByNumber(orderId)
  })
})
