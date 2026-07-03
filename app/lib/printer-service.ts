const DEFAULT_LOCAL_PRINTER_URL = process.env.NEXT_PUBLIC_LOCAL_PRINTER_URL ?? "http://localhost:8888"

function getLocalPrinterUrl() {
  return DEFAULT_LOCAL_PRINTER_URL
}

function buildPrinterQuery(receiptText: string) {
  return [
    ["left"],
    ...receiptText.split(/\r?\n/).map((line) => ["println", line] as const),
    ["cut"],
  ]
}

export async function printViaLocalService(receiptText: string) {
  const url = getLocalPrinterUrl()
  const body = JSON.stringify({ query: buildPrinterQuery(receiptText) })

  const response = await fetch(`${url}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(`Printer service error ${response.status}: ${text}`)
  }

  return response.json()
}

export function isLocalPrinterServiceSupported() {
  return typeof window !== "undefined" && typeof fetch === "function"
}
