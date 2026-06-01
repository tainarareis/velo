import { test } from '@playwright/test'

import { generateOrderCode } from '../support/helpers'

import { Navbar } from '../support/components/Navbar'
import { LandingPage } from '../support/pages/LandingPage'
import { OrderLockupPage } from '../support/pages/OrderLookupPage'
import type { OrderDetails } from '../support/pages/OrderLookupPage'

test.describe('Consulta de Pedido', () => {
  let orderLookupPage: OrderLockupPage

  test.beforeEach(async ({ page }) => {
    await new LandingPage(page).goto()
    await new Navbar(page).orderLookupLink()

    orderLookupPage = new OrderLockupPage(page)
    await orderLookupPage.validatePageLoaded()
  })

  test('deve consultar um pedido aprovado', async () => {
    const order: OrderDetails = {
      number: 'VLO-FODVB5',
      status: 'APROVADO',
      color: 'Lunar White',
      wheels: 'aero Wheels',
      customer: {
        name: 'Tainara Reis',
        email: 'tainara@velo.dev'
      },
      payment: 'À Vista'
    }

    await orderLookupPage.searchOrder(order.number)
    await orderLookupPage.validateOrderDetails(order)
    await orderLookupPage.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido reprovado', async () => {
    const order: OrderDetails = {
      number: 'VLO-3MKV7Z',
      status: 'REPROVADO',
      color: 'Lunar White',
      wheels: 'aero Wheels',
      customer: {
        name: 'Tainara Reis',
        email: 'tainara@velo.dev'
      },
      payment: 'À Vista'
    }

    await orderLookupPage.searchOrder(order.number)
    await orderLookupPage.validateOrderDetails(order)
    await orderLookupPage.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido em analise', async () => {
    const order: OrderDetails = {
      number: 'VLO-OF7LXB',
      status: 'EM_ANALISE',
      color: 'Glacier Blue',
      wheels: 'aero Wheels',
      customer: {
        name: 'Tainara Reis',
        email: 'tainara@velo.dev'
      },
      payment: 'À Vista'
    }

    await orderLookupPage.searchOrder(order.number)
    await orderLookupPage.validateOrderDetails(order)
    await orderLookupPage.validateStatusBadge(order.status)
  })

  test('deve exibir mensagem quando o pedido não é encontrado', async () => {
    const order = generateOrderCode()

    await orderLookupPage.searchOrder(order)
    await orderLookupPage.validateOrderNotFound(order)
  })

  test('deve exibir mensagem quando o pedido em qualquer formato não é encontrado', async () => {
    const order = 'abc123'

    await orderLookupPage.searchOrder(order)
    await orderLookupPage.validateOrderNotFound(order)
  })
})
