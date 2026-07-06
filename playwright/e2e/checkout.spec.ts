import { test } from '../support/fixtures'
import { CHECKOUT_ERRORS } from '../support/actions/checkoutActions'

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
