import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "./context/cart-context"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Uncle Khan's Minimart POS",
  description: "Point of Sale System for Uncle Khan's Minimart",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Uncle Khan's POS",
  },
}

export const viewport: Viewport = {
  themeColor: "#2563eb",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50`}>
        <CartProvider>{children}</CartProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
