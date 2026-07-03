"use client"

import { Minus, Plus, Receipt, ShoppingCart, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCart } from "../context/cart-context"
import { buildReceiptLines } from "../lib/receipt"

export default function CartSidebar() {
  const { cart, removeFromCart, updateQuantity, cartTotal, itemCount, cartFlash, openCheckout } = useCart()

  const handleCheckout = () => {
    openCheckout()
  }

  const receiptLines = buildReceiptLines(cart, cartTotal)

  return (
    <div
      className={cn(
        "flex w-80 flex-col border-l bg-card transition-all duration-300",
        cartFlash && "ring-4 ring-inset ring-success",
      )}
    >
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="flex items-center text-lg font-semibold">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Cart
        </h2>
        <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
          {itemCount} items
        </span>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <ShoppingCart className="mb-2 h-12 w-12 text-muted-foreground" />
            <h3 className="font-medium">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground">Add items to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <h3 className="font-medium line-clamp-1">{item.name}</h3>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t p-4">
        <div className="mb-4 space-y-2">
          <div className="flex justify-between">
            <p>Subtotal</p>
            <p>${cartTotal.toFixed(2)}</p>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <p>Total</p>
            <p className="text-success">${cartTotal.toFixed(2)}</p>
          </div>
        </div>
        <Button className="w-full" size="lg" disabled={cart.length === 0} onClick={handleCheckout}>
          Checkout
        </Button>

        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Receipt className="h-3.5 w-3.5" />
            Receipt Preview (58mm / 32 chars)
          </div>
          <pre className="max-h-48 overflow-auto whitespace-pre rounded-md border border-dashed bg-muted p-3 font-mono text-[11px] leading-tight text-foreground">
            {receiptLines.join("\n")}
          </pre>
        </div>
      </div>
    </div>
  )
}
