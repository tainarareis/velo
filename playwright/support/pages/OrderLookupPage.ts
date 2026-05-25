import { Page } from "@playwright/test"

export class OrderLookupPage {
    private page: Page

    constructor(page: Page) {
        this.page = page
    }

    async searchOrder(orderCode: string) {
        await this.page.getByRole('textbox', { name: 'Número do Pedido' }).fill(orderCode)
        await this.page.getByRole('button', { name: 'Buscar Pedido' }).click()
    }
}