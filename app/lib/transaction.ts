import type { Product } from "../context/cart-context"

export interface CartLineItem extends Product {
  quantity: number
}

export interface CompletedTransaction {
  items: CartLineItem[]
  total: number
  paymentLabel: string
  cashReceived?: number
  changeDue?: number
  receiptNumber: number
  timestamp: string
}

const STORAGE_KEY = "lastTransaction"

export function saveTransaction(tx: CompletedTransaction) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tx))
}

export function loadTransaction(): CompletedTransaction | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CompletedTransaction) : null
  } catch {
    return null
  }
}

export function clearTransaction() {
  sessionStorage.removeItem(STORAGE_KEY)
}

export function createReceiptNumber() {
  return Math.floor(100000 + Math.random() * 900000)
}
