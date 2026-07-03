"use client"

import { useRef, useState } from "react"
import { Search, ScanBarcode, Plus, Download, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createInventoryWorkbook, downloadWorkbook, parseInventoryWorkbook } from "./lib/product-excel"
import ProductGrid from "./components/product-grid"
import CartSidebar from "./components/cart-sidebar"
import CategorySidebar from "./components/category-sidebar"
import AddProductModal from "./components/add-product-modal"
import EditProductModal from "./components/edit-product-modal"
import CheckoutDialog from "./components/checkout-dialog"
import SuperuserToggle from "./components/superuser-toggle"
import { useCart } from "./context/cart-context"
import { toast } from "sonner"

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { scannerActive, openAddProduct, products, importProducts } = useCart()

  return (
    <div className="flex h-screen bg-background">
      <CategorySidebar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="sticky top-0 z-10 bg-background p-4 border-b">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <h1 className="text-2xl font-bold text-balance">UNCLE KHAN&apos;S MINIMART</h1>
              <span
                className={cn(
                  "inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                  scannerActive
                    ? "border-sky-500/30 bg-sky-500/10 text-sky-600"
                    : "border-muted bg-muted text-muted-foreground",
                )}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
                </span>
                <ScanBarcode className="h-3.5 w-3.5" />
                Scanner: Active (Listening for Hardware Input)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <SuperuserToggle />
              <Button onClick={() => openAddProduct()}>
                <Plus className="mr-1 h-4 w-4" />
                Add Product
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const workbook = createInventoryWorkbook(products)
                  downloadWorkbook(workbook, "inventory-export.xlsx")
                }}
              >
                <Download className="mr-1 h-4 w-4" />
                Export Inventory
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-1 h-4 w-4" />
                Import Inventory
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  try {
                    const rows = await parseInventoryWorkbook(file)
                    await importProducts(rows)
                    toast.success("Inventory imported and updated")
                  } catch (error) {
                    console.error(error)
                    toast.error("Failed to import inventory. Please use the exported file format.")
                  } finally {
                    e.target.value = ""
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <ProductGrid category={selectedCategory} searchQuery={searchQuery} />
        </div>
      </main>

      <CartSidebar />

      <AddProductModal />
      <EditProductModal />
      <CheckoutDialog />
    </div>
  )
}
