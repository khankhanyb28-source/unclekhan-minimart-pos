"use client"

import type React from "react"
import { useState } from "react"

import { Check, Cookie, CupSoda, LayoutGrid, Plus, ShoppingBasket, SprayCan, Tag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useCart } from "../context/cart-context"

interface CategorySidebarProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

// Icons for the built-in categories; custom categories fall back to a generic tag
const categoryIcons: Record<string, React.ElementType> = {
  all: LayoutGrid,
  snacks: Cookie,
  beverages: CupSoda,
  groceries: ShoppingBasket,
  household: SprayCan,
}

export default function CategorySidebar({ selectedCategory, onSelectCategory }: CategorySidebarProps) {
  const { categories, addCategory } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState("")

  const handleAdd = () => {
    if (!newName.trim()) return
    addCategory(newName)
    setNewName("")
    setIsAdding(false)
  }

  return (
    <div className="flex w-56 flex-col border-r bg-background p-4">
      <h2 className="mb-4 text-lg font-semibold">Categories</h2>
      <div className="grid flex-1 content-start gap-3 overflow-auto">
        {categories.map((category) => {
          const Icon = categoryIcons[category.id] ?? Tag
          return (
            <Button
              key={category.id}
              variant="ghost"
              className={cn(
                "flex h-auto flex-col items-center justify-center py-4 border bg-transparent",
                selectedCategory === category.id
                  ? "border-2 border-primary text-foreground font-medium"
                  : "border-muted text-muted-foreground hover:border-muted-foreground hover:text-foreground",
                "hover:bg-transparent",
              )}
              onClick={() => onSelectCategory(category.id)}
            >
              <Icon className="mb-2 h-6 w-6" />
              <span className="text-sm text-center text-balance">{category.name}</span>
            </Button>
          )
        })}
      </div>

      <div className="mt-3 border-t pt-3">
        {isAdding ? (
          <div className="flex flex-col gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category name"
              autoFocus
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing) return
                if (e.key === "Enter") handleAdd()
                if (e.key === "Escape") {
                  setIsAdding(false)
                  setNewName("")
                }
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={handleAdd}>
                <Check className="mr-1 h-4 w-4" />
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAdding(false)
                  setNewName("")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsAdding(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Add Category
          </Button>
        )}
      </div>
    </div>
  )
}
