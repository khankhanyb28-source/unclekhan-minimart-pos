"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCart } from "../context/cart-context"
import { buildReceiptLines } from "../lib/receipt"
import { printReceipt } from "../lib/print-receipt"
import ReceiptPreview from "../components/receipt-preview"
import { clearTransaction, loadTransaction, type CompletedTransaction } from "../lib/transaction"

export default function SuccessPage() {
  const router = useRouter()
  const { cart, cartTotal, clearCart } = useCart()
  const [transaction, setTransaction] = useState<CompletedTransaction | null>(null)

  useEffect(() => {
    setTransaction(loadTransaction())
  }, [])

  const displayItems = transaction?.items ?? cart
  const displayTotal = transaction?.total ?? cartTotal

  useEffect(() => {
    if (displayItems.length === 0) {
      router.replace("/")
    }
  }, [displayItems.length, router])

  const receiptLines = useMemo(
    () =>
      buildReceiptLines(displayItems, displayTotal, {
        paymentLabel: transaction?.paymentLabel,
        cashReceived: transaction?.cashReceived,
        changeDue: transaction?.changeDue,
        receiptNumber: transaction?.receiptNumber,
        timestamp: transaction?.timestamp ?? new Date().toLocaleString(),
      }),
    [displayItems, displayTotal, transaction],
  )

  const receiptText = receiptLines.join("\n")

  const handleBackToPOS = () => {
    clearCart()
    clearTransaction()
    router.push("/")
  }

  const handlePrint = () => {
    printReceipt(receiptText, { suppressFallbackToast: true })
  }

  if (displayItems.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto max-w-md py-8 print-hidden">
      <div className="rounded-lg border bg-white p-6 print-receipt">
        <div className="mb-6 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold">Payment Successful</h1>
        <p className="mb-6 text-center text-muted-foreground">Thank you for your purchase!</p>

        <div className="whitespace-pre font-mono text-[11px] leading-tight text-slate-800">
          <ReceiptPreview lines={receiptLines} />
        </div>

        <div className="mt-6 flex flex-col gap-3 print:hidden">
          <Button variant="outline" onClick={handlePrint} className="w-full">
            <Printer className="mr-2 h-4 w-4" />
            Reprint Receipt
          </Button>
          <Button onClick={handleBackToPOS} className="w-full">
            Go Back to POS
          </Button>
        </div>
      </div>
    </div>
  )
}
