"use client"

import type React from "react"

import { Cookie, CupSoda, LayoutGrid, ShoppingBasket, SprayCan } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CategorySidebarProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

interface CategoryItem {
  id: string
  name: string
  icon: React.ElementType
}

const categories: CategoryItem[] = [
  {
    id: "all",
    name: "All Products",
    icon: LayoutGrid,
  },
  {
    id: "snacks",
    name: "Snacks & Chips",
    icon: Cookie,
  },
  {
    id: "beverages",
    name: "Beverages",
    icon: CupSoda,
  },
  {
    id: "groceries",
    name: "Groceries",
    icon: ShoppingBasket,
  },
  {
    id: "household",
    name: "Household & Toiletries",
    icon: SprayCan,
  },
]

export default function CategorySidebar({ selectedCategory, onSelectCategory }: CategorySidebarProps) {
  return (
    <div className="w-56 border-r bg-background p-4">
      <h2 className="mb-4 text-lg font-semibold">Categories</h2>
      <div className="grid gap-3">
        {categories.map((category) => {
          const Icon = category.icon
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
              <span className="text-sm">{category.name}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
