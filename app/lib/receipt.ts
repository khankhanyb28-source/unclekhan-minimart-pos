// 58mm thermal printer receipt formatting helpers.
// Pure functions, no dependencies, fully client-side friendly.

export const RECEIPT_WIDTH = 32
export const DIVIDER = "-".repeat(RECEIPT_WIDTH)

export interface ReceiptLineItem {
  name: string
  price: number
  quantity: number
}

export interface ReceiptOptions {
  cashReceived?: number
  changeDue?: number
  paymentLabel?: string
  receiptNumber?: number
  timestamp?: string
}

// Wrap text to a max character width (auto-wrapping for narrow printers)
export function wrapText(text: string, width = RECEIPT_WIDTH): string[] {
  const words = text.split(" ")
  const lines: string[] = []
  let current = ""

  for (const word of words) {
    if ((current + (current ? " " : "") + word).length > width) {
      if (current) lines.push(current)
      if (word.length > width) {
        let remaining = word
        while (remaining.length > width) {
          lines.push(remaining.slice(0, width))
          remaining = remaining.slice(width)
        }
        current = remaining
      } else {
        current = word
      }
    } else {
      current += (current ? " " : "") + word
    }
  }
  if (current) lines.push(current)
  return lines
}

// Center a string within the receipt width
export function centerText(text: string, width = RECEIPT_WIDTH): string {
  if (text.length >= width) return text.slice(0, width)
  const totalPad = width - text.length
  const left = Math.floor(totalPad / 2)
  return " ".repeat(left) + text
}

// Place a label on the left and value on the right within the fixed width
export function padLine(left: string, right: string, width = RECEIPT_WIDTH): string {
  const space = Math.max(1, width - left.length - right.length)
  return left + " ".repeat(space) + right
}

export function buildReceiptLines(items: ReceiptLineItem[], total: number, options: ReceiptOptions = {}): string[] {
  const lines: string[] = []
  lines.push(centerText("UNCLE KHAN'S MINIMART"))
  lines.push(centerText("Fresh & Friendly"))
  if (options.receiptNumber) lines.push(centerText(`Receipt #${options.receiptNumber}`))
  if (options.timestamp) lines.push(centerText(options.timestamp))
  lines.push(DIVIDER)

  if (items.length === 0) {
    lines.push("No items in cart")
  } else {
    for (const item of items) {
      for (const line of wrapText(item.name)) {
        lines.push(line)
      }
      const qtyLabel = `  ${item.quantity} x $${item.price.toFixed(2)}`
      const lineTotal = `$${(item.price * item.quantity).toFixed(2)}`
      lines.push(padLine(qtyLabel, lineTotal))
    }
  }

  lines.push(DIVIDER)
  lines.push(padLine("TOTAL", `$${total.toFixed(2)}`))

  if (options.paymentLabel) {
    lines.push(padLine("PAYMENT", options.paymentLabel))
  }
  if (typeof options.cashReceived === "number" && options.cashReceived > 0) {
    lines.push(padLine("CASH", `$${options.cashReceived.toFixed(2)}`))
  }
  if (typeof options.changeDue === "number") {
    lines.push(padLine("CHANGE", `$${options.changeDue.toFixed(2)}`))
  }

  lines.push(DIVIDER)
  lines.push(centerText("Thank you for shopping!"))
  lines.push(centerText("Please come again"))
  return lines
}
