/** Inject a thermal-receipt node and open the native print dialog. */
export function printReceipt(receiptText: string) {
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
