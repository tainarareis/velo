import { db } from './database'
import { OrderTable } from './schema'

export async function insertOrder(order: OrderTable) {
  await db.insertInto('orders').values(order).execute()
}

export async function deleteOrderByNumber(orderNumber: string) {
  await db
    .deleteFrom('orders')
    .where('order_number', '=', orderNumber)
    .execute()
}