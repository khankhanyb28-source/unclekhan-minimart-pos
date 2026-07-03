"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCart } from "../context/cart-context"

export default function EditProductModal() {
  const { editingProduct, editProductOpen, closeEditProduct, updateProduct, categories } = useCart()
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [image, setImage] = useState("")
  const [barcode, setBarcode] = useState("")

  useEffect(() => {
    if (!editProductOpen || !editingProduct) return
    setName(editingProduct.name)
    setPrice(String(editingProduct.price))
    setCategory(editingProduct.category)
    setImage(editingProduct.image ?? "")
    setBarcode(editingProduct.barcode ?? "")
  }, [editProductOpen, editingProduct])

  const selectableCategories = categories.filter((c) => c.id !== "all")

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingProduct) return

    const parsedPrice = Number.parseFloat(price)
    if (!name.trim() || Number.isNaN(parsedPrice) || parsedPrice < 0 || !category) {
      toast.error("Please fill in all product fields before saving")
      return
    }

    await updateProduct(editingProduct.id, {
      name: name.trim(),
      price: parsedPrice,
      category,
      image: image.trim() || undefined,
      barcode: barcode.trim() || undefined,
    })

    toast.success("Product updated")
    closeEditProduct()
  }

  return (
    <Dialog open={editProductOpen} onOpenChange={(open) => (open ? null : closeEditProduct())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update the inventory item and sync it to Supabase.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-product-name">Product Name</Label>
            <Input
              id="edit-product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product name"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-product-price">Price (₱)</Label>
            <Input
              id="edit-product-price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-product-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="edit-product-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {selectableCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-product-image">Image URL</Label>
            <Input
              id="edit-product-image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-product-barcode">Barcode / SKU</Label>
            <Input
              id="edit-product-barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan or type a barcode"
              className="font-mono"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeEditProduct}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
