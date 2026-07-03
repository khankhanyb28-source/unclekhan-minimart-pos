"use client"

import { Button } from "@/components/ui/button"
import { ShieldCheck, ShieldOff } from "lucide-react"
import { useCart } from "../context/cart-context"

export default function SuperuserToggle() {
  const { isEditMode, toggleEditMode } = useCart()

  return (
    <Button
      type="button"
      variant={isEditMode ? "secondary" : "outline"}
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
      onClick={toggleEditMode}
    >
      {isEditMode ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
      {isEditMode ? "Superuser Mode ON" : "Superuser Mode OFF"}
    </Button>
  )
}
