"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCart } from "../context/cart-context"

export default function AddProductModal() {
  const { addProductOpen, closeAddProduct, prefilledBarcode, categories, addProduct, addToCart } = useCart()

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [barcode, setBarcode] = useState("")

  // Selectable categories exclude the "all" pseudo-category
  const selectableCategories = categories.filter((c) => c.id !== "all")

  // Reset the form each time the modal opens, pre-filling the scanned barcode
  useEffect(() => {
    if (addProductOpen) {
      setName("")
      setPrice("")
      setCategory(selectableCategories[0]?.id ?? "")
      setBarcode(prefilledBarcode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addProductOpen, prefilledBarcode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsedPrice = Number.parseFloat(price)
    if (!name.trim() || Number.isNaN(parsedPrice) || parsedPrice < 0 || !category) {
      toast.error("Please fill in a name, valid price, and category")
      return
    }
    const created = await addProduct({ name: name.trim(), price: parsedPrice, category, barcode })
    addToCart(created)
    toast.success(`Added ${created.name} to inventory`)
    closeAddProduct()
  }

  return (
    <Dialog open={addProductOpen} onOpenChange={(open) => (open ? null : closeAddProduct())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
          <DialogDescription>Create a new inventory item. It will be added to the cart automatically.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="product-name">Product Name</Label>
            <Input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Salted Peanuts"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product-price">Price (₱)</Label>
            <Input
              id="product-price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="product-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {selectableCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product-barcode">Barcode / SKU</Label>
            <Input
              id="product-barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan or type a barcode"
              className="font-mono"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeAddProduct}>
              Cancel
            </Button>
            <Button type="submit">Save Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
