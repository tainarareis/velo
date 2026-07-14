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
    await app.checkout.fillValidCustomerData({ acceptTerms: true, includeCpf: true })

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

  test('CT06 - deve aprovar automaticamente o crédito quando o score do CPF for maior que 700 no financiamento.', async ({ page, app }) => {
    const order = {
      store: 'Velô Paulista - Av. Paulista, 1000',
      expectedPrice: 'R$ 40.800,00',
    } as const

    await deleteOrdersByEmail(VALID_CHECKOUT_DATA.email)

    await page.route('**/functions/v1/credit-analysis', async route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'Done',
          score: 710
        })
      })
    })

    //Arrange
    await page.goto('/')
    await page.getByRole('link', { name: /Configure Agora/i }).click()
    await expect(page).toHaveURL(/\/configure/)
    await app.configurator.finishConfigurator()

    //Act
    await app.checkout.fillValidCustomerData({ acceptTerms: true, includeCpf: true })

    await app.checkout.selectStore(order.store)
    await app.checkout.selectPaymentFinanciamento()

    await app.checkout.expectCheckoutPrice(order.expectedPrice)

    await app.checkout.acceptTerms(true)
    await app.checkout.submit()

    //Assert
    await app.checkout.expectOrderSuccess()
  })

  test('CT07 - deve colocar o pedido em análise quando o score do CPF for entre 501 e 700 no financiamento.', async ({ page, app }) => {
    const order = {
      store: 'Velô Paulista - Av. Paulista, 1000',
      expectedPrice: 'R$ 40.800,00',
    } as const

    const customer = {
      name: 'Maria',
      surname: 'Souza',
      email: 'mariasouza@email.com',
      phone: '(11) 98888-8888',
      cpf: '746.902.510-37',
    } as const

    await deleteOrdersByEmail(customer.email)

    await page.route('**/functions/v1/credit-analysis', async route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'Done',
          score: 600
        })
      })
    })

    //Arrange
    await page.goto('/')
    await page.getByRole('link', { name: /Configure Agora/i }).click()
    await expect(page).toHaveURL(/\/configure/)
    await app.configurator.finishConfigurator()

    //Act
    await app.checkout.fillValidCustomerData({ acceptTerms: true, includeCpf: true })

    await app.checkout.selectStore(order.store)
    await app.checkout.selectPaymentFinanciamento()

    await app.checkout.expectCheckoutPrice(order.expectedPrice)

    await app.checkout.acceptTerms(true)
    await app.checkout.submit()

    //Assert
    await app.checkout.expectOrderAnalysis()
  })

  test('CT08.1 - deve reprovar o crédito quando o score for <= 500 no financiamento sem entrada', async ({ page, app }) => {
    const order = {
      store: 'Velô Paulista - Av. Paulista, 1000',
      expectedPrice: 'R$ 40.800,00',
    } as const

    const customer = {
      name: 'João',
      surname: 'Silva',
      email: 'joaosilva_ct081@email.com',
      phone: '(11) 97777-7777',
      cpf: '529.982.247-25',
    } as const

    await deleteOrdersByEmail(customer.email)

    await page.route('**/functions/v1/credit-analysis', async route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'Done',
          score: 400
        })
      })
    })

    //Arrange
    await page.goto('/')
    await page.getByRole('link', { name: /Configure Agora/i }).click()
    await expect(page).toHaveURL(/\/configure/)
    await app.configurator.finishConfigurator()

    //Act
    await app.checkout.fillName(customer.name)
    await app.checkout.fillLastname(customer.surname)
    await app.checkout.fillEmail(customer.email)
    await app.checkout.fillPhone(customer.phone)
    await app.checkout.fillCpf(customer.cpf)
    
    await app.checkout.selectStore(order.store)
    await app.checkout.selectPaymentFinanciamento()
    
    // Sem entrada (0)
    await app.checkout.fillEntryValue('0')

    await app.checkout.expectCheckoutPrice(order.expectedPrice)

    await app.checkout.acceptTerms(true)
    await app.checkout.submit()

    //Assert
    await app.checkout.expectOrderReproved()
    
    const orderId = await page.getByTestId('order-id').textContent() || ''
    await deleteOrderByNumber(orderId)
  })

  test('CT08.2 - deve reprovar o crédito quando o score for <= 500 no financiamento com entrada menor que 50%', async ({ page, app }) => {
    const order = {
      store: 'Velô Paulista - Av. Paulista, 1000',
      expectedPrice: 'R$ 30.600,00',
    } as const

    const customer = {
      name: 'João',
      surname: 'Silva',
      email: 'joaosilva_ct082@email.com',
      phone: '(11) 97777-7777',
      cpf: '529.982.247-25',
    } as const

    await deleteOrdersByEmail(customer.email)

    await page.route('**/functions/v1/credit-analysis', async route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'Done',
          score: 400
        })
      })
    })

    //Arrange
    await page.goto('/')
    await page.getByRole('link', { name: /Configure Agora/i }).click()
    await expect(page).toHaveURL(/\/configure/)
    await app.configurator.finishConfigurator()

    //Act
    await app.checkout.fillName(customer.name)
    await app.checkout.fillLastname(customer.surname)
    await app.checkout.fillEmail(customer.email)
    await app.checkout.fillPhone(customer.phone)
    await app.checkout.fillCpf(customer.cpf)
    
    await app.checkout.selectStore(order.store)
    await app.checkout.selectPaymentFinanciamento()
    
    // Entrada menor que 50% (10000 de 40800)
    await app.checkout.fillEntryValue('10000')

    await app.checkout.expectCheckoutPrice(order.expectedPrice)

    await app.checkout.acceptTerms(true)
    await app.checkout.submit()

    //Assert
    await app.checkout.expectOrderReproved()
  })
})
