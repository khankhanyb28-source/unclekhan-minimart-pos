"use client"

import { useState } from "react"
import { Search, ScanBarcode, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import ProductGrid from "./components/product-grid"
import CartSidebar from "./components/cart-sidebar"
import CategorySidebar from "./components/category-sidebar"
import AddProductModal from "./components/add-product-modal"
import CheckoutDialog from "./components/checkout-dialog"
import { useCart } from "./context/cart-context"

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const { scannerActive, openAddProduct } = useCart()

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
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                    : "border-muted bg-muted text-muted-foreground",
                )}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
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
              <Button onClick={() => openAddProduct()}>
                <Plus className="mr-1 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <ProductGrid category={selectedCategory} searchQuery={searchQuery} />
        </div>
      </main>

      <CartSidebar />

      <AddProductModal />
      <CheckoutDialog />
    </div>
  )
}
