"use client"

import Image from "next/image"
import { Edit3, PlusCircle, Trash2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "../context/cart-context"

interface ProductGridProps {
  category: string
  searchQuery: string
}

export default function ProductGrid({ category, searchQuery }: ProductGridProps) {
  const { addToCart, products, isEditMode, openEditProduct, deleteProduct } = useCart()

  const filteredProducts = products.filter((product) => {
    const matchesCategory = category === "all" || product.category === category
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {filteredProducts.map((product) => (
        <Card
          key={product.id}
          className="relative overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer group bg-white border-slate-200"
          onClick={() => (isEditMode ? openEditProduct(product) : addToCart(product))}
        >
          <div className="relative aspect-square">
            <div className="absolute inset-0 flex items-center justify-center bg-blue-600/80 opacity-0 transition-opacity group-hover:opacity-100 z-10">
              <PlusCircle className="h-10 w-10 text-white" />
            </div>
            <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
          </div>

          {isEditMode && (
            <div className="absolute right-3 top-3 z-20 flex items-center space-x-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  openEditProduct(product)
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-lg transition hover:bg-slate-800"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteProduct(product.id)
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-slate-900 shadow-lg transition hover:bg-amber-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          <CardContent className="p-3 bg-white">
            <div>
              <h3 className="font-medium line-clamp-1 text-slate-800">{product.name}</h3>
              <p className="text-sm text-slate-600">₱{product.price.toFixed(2)}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.15em] text-slate-400">{product.category}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      {filteredProducts.length === 0 && (
        <div className="col-span-full py-12 text-center">
          <p className="text-muted-foreground">No products found</p>
        </div>
      )}
    </div>
  )
}
