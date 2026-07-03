const DEFAULT_LOCAL_PRINTER_URL = process.env.NEXT_PUBLIC_LOCAL_PRINTER_URL ?? "http://localhost:8888"

function getLocalPrinterUrl() {
  return DEFAULT_LOCAL_PRINTER_URL
}

function buildPrinterQuery(receiptText: string, openDrawerAfterPrint = false) {
  const query: Array<readonly [string, string?]> = [
    ["left"],
    ...receiptText.split(/\r?\n/).map((line) => ["println", line] as const),
    ["cut"],
  ]

  if (openDrawerAfterPrint) {
    query.push(["pulse"])
  }

  return query
}

export async function printViaLocalService(receiptText: string, openDrawerAfterPrint = false) {
  const url = getLocalPrinterUrl()
  const body = JSON.stringify({ query: buildPrinterQuery(receiptText, openDrawerAfterPrint) })

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
