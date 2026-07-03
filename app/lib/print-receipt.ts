import { toast } from "sonner"
import { isLocalPrinterServiceSupported, printViaLocalService } from "./printer-service"

/**
 * Try to send the receipt directly to a local printer service.
 * If the service is missing or returns an error, fall back to browser print.
 */
export async function printReceipt(receiptText: string) {
  if (isLocalPrinterServiceSupported()) {
    try {
      await printViaLocalService(receiptText)
      toast.success("Receipt sent to local printer")
      return
    } catch (error) {
      console.error("Local printer service failed:", error)
      toast.error("Local printer unavailable. Falling back to browser print.")
    }
  }

  const existing = document.getElementById("thermal-receipt-print")
  existing?.remove()

  const container = document.createElement("div")
  container.id = "thermal-receipt-print"
  container.className = "print-receipt thermal-receipt"
  container.setAttribute("aria-hidden", "true")

  const pre = document.createElement("pre")
  pre.textContent = receiptText
  container.appendChild(pre)
  document.body.appendChild(container)

  const cleanup = () => container.remove()
  window.addEventListener("afterprint", cleanup, { once: true })
  window.print()
}
