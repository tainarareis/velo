import { db } from './database'
import crypto from 'crypto'
import { OrderDetails } from '../actions/orderLookupActions'
import { OrderTable } from './schema'

export function normalizePaymentMethod(value: string): string {
  return value
    .normalize('NFD') // Splits accented characters into the base character and accent mark.
    .replace(/[\u0300-\u036f]/g, '') // Removes the accent marks.
    .toLowerCase() // Converts all characters to lowercase.
    .replace(/\s+/g, '') // Removes all whitespace characters.
}

export async function insertOrder(order: OrderDetails) {
  const data: OrderTable = {
    id: crypto.randomUUID(),
    order_number: order.number,
    color: order.color.replace(' ', '-').toLowerCase(),
    wheel_type: order.wheels.replace(' Wheels', '').toLowerCase(),
    customer_name: order.customer.name,
    customer_email: order.customer.email,
    customer_phone: order.customer.phone,
    customer_cpf: order.customer.document,
    payment_method: normalizePaymentMethod(order.payment),
    total_price: order.total_price,
    status: order.status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    optionals: [],
  }
  await db.insertInto('orders').values(data).execute()
}

export async function deleteOrderByNumber(orderNumber: string) {
  await db
    .deleteFrom('orders')
    .where('order_number', '=', orderNumber)
    .execute()
}