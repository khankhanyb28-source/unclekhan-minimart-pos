"use client"

import { useState } from "react"
import { Search, ScanBarcode } from "lucide-react"
import { Input } from "@/components/ui/input"
import ProductGrid from "./components/product-grid"
import CartSidebar from "./components/cart-sidebar"
import CategorySidebar from "./components/category-sidebar"

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  return (
    <div className="flex h-screen bg-background">
      <CategorySidebar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="sticky top-0 z-10 bg-background p-4 border-b">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <h1 className="text-2xl font-bold text-balance">UNCLE KHAN&apos;S MINIMART</h1>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
                <ScanBarcode className="h-3.5 w-3.5" />
                Scanner Status: Ready (Simulated)
              </span>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <ProductGrid category={selectedCategory} searchQuery={searchQuery} />
        </div>
      </main>

      <CartSidebar />
    </div>
  )
}
