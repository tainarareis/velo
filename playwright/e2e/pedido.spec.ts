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
    await expect(page.locator('div').filter({ hasText: new RegExp(`^Pedido${orderId}$`) }).first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator('div').filter({ hasText: 'APROVADO'}).first()).toBeVisible()
});