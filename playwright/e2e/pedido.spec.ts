import { test, expect } from '@playwright/test';

test.describe('Buscar Pedido', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173')
        await expect(page).toHaveTitle('Velô by Papito')
        await page.getByRole('link', { name: 'Consultar Pedido' }).click()
        await expect(page).toHaveURL('http://localhost:5173/lookup')
    })

    test('deve buscar um pedido', async ({ page }) => {
        // Test Data
        const orderId = 'VLO-OF7LXB'

        // Act
        await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(orderId)
        await page.getByRole('button', { name: 'Buscar Pedido' }).click()

        // Assert
        await expect(page.locator('div').filter({ hasText: new RegExp(`^Pedido${orderId}$`) }).first()).toBeVisible({ timeout: 10000 })
        await expect(page.locator('div').filter({ hasText: 'APROVADO' }).first()).toBeVisible()
    })

    test('deve exibir mensagem de erro ao buscar um pedido inexistente', async ({ page }) => {
        // Test Data
        const orderId = 'PEDIDO-NAO-EXISTENTE'

        // Act
        await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(orderId)
        await page.getByRole('button', { name: 'Buscar Pedido' }).click()

        // Assert
        await expect(page.locator('#root')).toMatchAriaSnapshot(`
            - img
            - heading "Pedido não encontrado" [level=3]
            - paragraph: Verifique o número do pedido e tente novamente
        `)
    })
})