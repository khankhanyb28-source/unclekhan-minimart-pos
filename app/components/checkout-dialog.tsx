"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, QrCode, Wallet, Receipt as ReceiptIcon, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useCart } from "../context/cart-context"
import { buildReceiptLines } from "../lib/receipt"
import { printReceipt } from "../lib/print-receipt"
import { createReceiptNumber, saveTransaction } from "../lib/transaction"

const QUICK_CASH = [20, 50, 100, 200, 500, 1000]

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: Wallet },
  { value: "card", label: "Credit/Debit Card", icon: CreditCard },
  { value: "gcash", label: "GCash", icon: QrCode },
  { value: "maya", label: "Maya", icon: QrCode },
]

export default function CheckoutDialog() {
  const router = useRouter()
  const { cart, cartTotal, checkoutOpen, closeCheckout } = useCart()
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [cashReceived, setCashReceived] = useState<string>("")

  const received = Number.parseFloat(cashReceived) || 0
  const isCash = paymentMethod === "cash"
  // For non-cash methods the exact amount is always tendered
  const effectiveReceived = isCash ? received : cartTotal
  const changeDue = effectiveReceived - cartTotal
  const canConfirm = cart.length > 0 && (!isCash || received >= cartTotal)

  const paymentLabel = useMemo(
    () => PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label ?? "Cash",
    [paymentMethod],
  )

  const receiptNumber = useMemo(() => createReceiptNumber(), [checkoutOpen])

  const receiptText = useMemo(
    () =>
      buildReceiptLines(cart, cartTotal, {
        paymentLabel,
        cashReceived: isCash ? received : undefined,
        changeDue: changeDue >= 0 ? changeDue : undefined,
        receiptNumber,
        timestamp: new Date().toLocaleString(),
      }).join("\n"),
    [cart, cartTotal, paymentLabel, isCash, received, changeDue, receiptNumber],
  )

  const handleConfirm = () => {
    if (!canConfirm) return
    const timestamp = new Date().toLocaleString()
    saveTransaction({
      items: cart,
      total: cartTotal,
      paymentLabel,
      cashReceived: isCash ? received : undefined,
      changeDue: changeDue >= 0 ? changeDue : undefined,
      receiptNumber,
      timestamp,
    })
    printReceipt(receiptText)
    const changeMsg = isCash && changeDue > 0 ? ` Change due: ₱${changeDue.toFixed(2)}.` : ""
    toast.success("Transaction complete", {
      description: `Receipt sent to printer via ${paymentLabel}.${changeMsg}`,
      icon: <CheckCircle2 className="h-4 w-4" />,
    })
    setCashReceived("")
    setPaymentMethod("cash")
    closeCheckout()
    router.push("/success")
  }

  const handlePrintOnly = () => {
    if (cart.length === 0) return
    printReceipt(receiptText)
  }

  return (
    <Dialog open={checkoutOpen} onOpenChange={(open) => (open ? null : closeCheckout())}>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b bg-blue-600 px-6 py-4">
          <DialogTitle className="text-white">Checkout &amp; Payment</DialogTitle>
        </DialogHeader>

        <div className="grid gap-0 md:grid-cols-2">
          {/* Left: payment processing */}
          <div className="flex flex-col gap-5 p-6">
            <div className="flex items-baseline justify-between rounded-lg bg-blue-50 px-4 py-3 border border-blue-200">
              <span className="text-sm font-medium text-blue-700">Amount Due</span>
              <span className="text-2xl font-bold text-blue-600">₱{cartTotal.toFixed(2)}</span>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      <span className="flex items-center gap-2">
                        <m.icon className="h-4 w-4" />
                        {m.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isCash ? (
              <>
                <div className="space-y-2">
                  <Label>Quick Cash</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {QUICK_CASH.map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant="outline"
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        onClick={() => setCashReceived(String(amount))}
                      >
                        ₱{amount}
                      </Button>
                    ))}
                    <Button
                      type="button"
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => setCashReceived(cartTotal.toFixed(2))}
                    >
                      Exact
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cash-received">Cash Received</Label>
                  <Input
                    id="cash-received"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="text-lg"
                  />
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                {paymentLabel} selected. The exact amount of{" "}
                <span className="font-semibold text-blue-900">₱{cartTotal.toFixed(2)}</span> will be
                charged on confirmation.
              </div>
            )}

            <div
              className={cn(
                "flex items-baseline justify-between rounded-lg px-4 py-3 border",
                changeDue >= 0 ? "bg-sky-50 border-sky-200" : "bg-red-50 border-red-200",
              )}
            >
              <span className="text-sm font-medium">Change Due</span>
              <span
                className={cn(
                  "text-2xl font-bold",
                  changeDue >= 0 ? "text-sky-600" : "text-red-600",
                )}
              >
                ₱{Math.max(0, changeDue).toFixed(2)}
              </span>
            </div>
            {isCash && received > 0 && received < cartTotal && (
              <p className="text-sm text-red-600">
                Insufficient cash. ₱{(cartTotal - received).toFixed(2)} short.
              </p>
            )}
          </div>

          {/* Right: 58mm receipt preview */}
          <div className="flex flex-col border-t border-slate-200 bg-slate-50 p-6 md:border-l md:border-t-0">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-600">
              <ReceiptIcon className="h-4 w-4" />
              Receipt Preview (58mm / 32 chars)
            </div>
            <pre className="flex-1 overflow-auto whitespace-pre rounded-md border border-dashed border-slate-300 bg-white p-4 font-mono text-[11px] leading-tight text-slate-800 print-hidden">
              {receiptText}
            </pre>
            <div className="mt-4 flex flex-col gap-2 print-hidden">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={cart.length === 0}
                onClick={handlePrintOnly}
              >
                <ReceiptIcon className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
              <Button
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                size="lg"
                disabled={!canConfirm}
                onClick={handleConfirm}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirm &amp; Complete
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
