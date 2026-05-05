import { test, expect } from '@playwright/test';

test('deve buscar um pedido', async ({ page }) => {
    // Arrange
    const orderId = 'VLO-OF7LXB'
    await page.goto('http://localhost:5173')
    await expect(page).toHaveTitle('Velô by Papito')
    await page.getByRole('link', { name: 'Consultar Pedido' }).click()
    await expect(page).toHaveURL('http://localhost:5173/lookup')

    // Act
    await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(orderId)
    await page.getByRole('button', { name: 'Buscar Pedido' }).click()
    
    // Assert
    const orderContainer = page.getByRole('paragraph')
        .filter({ hasText: '^Pedido$`' })
        .locator('..') // sobe para o elemento pai do pedido
    await expect(orderContainer).toContainText(orderId)
    await expect(page.getByText('APROVADO')).toBeVisible()
});