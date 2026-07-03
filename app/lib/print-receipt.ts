import { toast } from "sonner"
import { isLocalPrinterServiceSupported, printViaLocalService } from "./printer-service"

export interface PrintOptions {
  suppressFallbackToast?: boolean
}

/**
 * Try to send the receipt directly to a local printer service.
 * If the service is missing or returns an error, fall back to structured browser print.
 */
export async function printReceipt(receiptText: string, options?: PrintOptions) {
  if (isLocalPrinterServiceSupported()) {
    try {
      await printViaLocalService(receiptText)
      if (!options?.suppressFallbackToast) toast.success("Receipt sent to local printer")
      return
    } catch (error) {
      console.error("Local printer service failed:", error)
      if (!options?.suppressFallbackToast) toast.error("Local printer unavailable. Falling back to browser print.")
    }
  }

  // Browser print fallback — build structured HTML for better alignment
  const existing = document.getElementById("thermal-receipt-print")
  existing?.remove()

  const container = document.createElement("div")
  container.id = "thermal-receipt-print"
  container.className = "print-receipt thermal-receipt"
  container.setAttribute("aria-hidden", "true")

  const lines = receiptText.split(/\r?\n/)
  for (const line of lines) {
    const el = document.createElement("div")
    el.className = "receipt-line"

    // Divider lines made of repeated '-' characters
    if (/^[-]{3,}$/.test(line.trim())) {
      el.classList.add("divider")
      container.appendChild(el)
      continue
    }

    // If the line contains two or more spaces, assume left/right columns
    const match = line.match(/^(.*?)\s{2,}(.*?)$/)
    if (match) {
      const left = document.createElement("span")
      left.className = "left"
      left.textContent = match[1]
      const right = document.createElement("span")
      right.className = "right"
      right.textContent = match[2]
      el.appendChild(left)
      el.appendChild(right)
      // Mark totals for stronger emphasis
      if (/^\s*TOTAL\b|^\s*CHANGE\b|^\s*PAYMENT\b/i.test(match[1])) el.classList.add("total")
    } else {
      // Center short lines (titles) if short enough
      if (line.trim().length <= 32) el.classList.add("center")
      el.textContent = line
    }

    container.appendChild(el)
  }

  document.body.appendChild(container)

  const cleanup = () => container.remove()
  window.addEventListener("afterprint", cleanup, { once: true })
  window.print()
}
