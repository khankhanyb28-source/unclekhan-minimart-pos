import type { ImportedProductRow, Product } from "../context/cart-context"
import * as XLSX from "xlsx"

const HEADERS = ["id", "name", "price", "category", "barcode", "stock", "image"]

export function createInventoryWorkbook(products: Product[]) {
  const data = [HEADERS, ...products.map((product) => [
    product.id,
    product.name,
    product.price,
    product.category,
    product.barcode ?? "",
    product.stock ?? 0,
    product.image ?? "",
  ])]

  const worksheet = XLSX.utils.aoa_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory")
  return workbook
}

export function downloadWorkbook(workbook: XLSX.WorkBook, filename: string) {
  const workbookBlob = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([workbookBlob], { type: "application/octet-stream" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export function parseInventoryWorkbook(file: File): Promise<ImportedProductRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const data = event.target?.result
      if (!data) {
        reject(new Error("Unable to read file contents"))
        return
      }

      const workbook = XLSX.read(data, { type: "array" })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      if (!sheet) {
        reject(new Error("Excel file is missing a worksheet"))
        return
      }

      const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" })
      if (rows.length < 2) {
        resolve([])
        return
      }

      const headerRow = (rows[0] as Array<string>).map((header) => String(header).trim().toLowerCase())
      const items: ImportedProductRow[] = []

      for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
        const row = rows[rowIndex] as Array<unknown>
        if (!row || row.length === 0) continue

        const item: ImportedProductRow = {}

        headerRow.forEach((columnName, cellIndex) => {
          const value = row[cellIndex]
          if (value == null) return

          switch (columnName) {
            case "id":
              item.id = Number(value)
              break
            case "name":
              item.name = String(value).trim()
              break
            case "price":
              item.price = Number(value)
              break
            case "category":
              item.category = String(value).trim()
              break
            case "barcode":
              item.barcode = String(value).trim()
              break
            case "stock":
              item.stock = Number(value)
              break
            case "image":
              item.image = String(value).trim()
              break
            default:
              break
          }
        })

        items.push(item)
      }

      resolve(items)
    }

    reader.onerror = () => reject(reader.error ?? new Error("Failed to read Excel file"))
    reader.readAsArrayBuffer(file)
  })
}
