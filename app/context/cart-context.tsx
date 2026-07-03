"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { products as seedProducts } from "../data/products"

export interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
  barcode?: string
}

export interface Category {
  id: string
  name: string
}

interface CartItem extends Product {
  quantity: number
}

interface NewProductInput {
  name: string
  price: number
  category: string
  barcode: string
}

interface POSContextType {
  // Cart
  cart: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  itemCount: number
  // Inventory
  products: Product[]
  addProduct: (input: NewProductInput) => Product
  // Categories
  categories: Category[]
  addCategory: (name: string) => void
  // Scanner
  scannerActive: boolean
  cartFlash: boolean
  // Add product modal
  addProductOpen: boolean
  prefilledBarcode: string
  openAddProduct: (barcode?: string) => void
  closeAddProduct: () => void
  // Checkout dialog
  checkoutOpen: boolean
  openCheckout: () => void
  closeCheckout: () => void
}

const defaultCategories: Category[] = [
  { id: "all", name: "All Products" },
  { id: "snacks", name: "Snacks & Chips" },
  { id: "beverages", name: "Beverages" },
  { id: "groceries", name: "Groceries" },
  { id: "household", name: "Household & Toiletries" },
]

const CartContext = createContext<POSContextType | undefined>(undefined)

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>(seedProducts)
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [cartFlash, setCartFlash] = useState(false)
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [prefilledBarcode, setPrefilledBarcode] = useState("")
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  // Keep a ref of products so the global scanner handler always reads the latest inventory
  const productsRef = useRef(products)
  useEffect(() => {
    productsRef.current = products
  }, [products])

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = useCallback((product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }, [])

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId)
        return
      }
      setCart((prevCart) => prevCart.map((item) => (item.id === productId ? { ...item, quantity } : item)))
    },
    [removeFromCart],
  )

  const clearCart = useCallback(() => setCart([]), [])

  const triggerCartFlash = useCallback(() => {
    setCartFlash(true)
    window.setTimeout(() => setCartFlash(false), 800)
  }, [])

  const openAddProduct = useCallback((barcode = "") => {
    setPrefilledBarcode(barcode)
    setAddProductOpen(true)
  }, [])

  const closeAddProduct = useCallback(() => {
    setAddProductOpen(false)
    setPrefilledBarcode("")
  }, [])

  const openCheckout = useCallback(() => setCheckoutOpen(true), [])
  const closeCheckout = useCallback(() => setCheckoutOpen(false), [])

  const addProduct = useCallback(
    (input: NewProductInput) => {
      const newProduct: Product = {
        id: Date.now(),
        name: input.name,
        price: input.price,
        category: input.category,
        barcode: input.barcode.trim() || undefined,
        image: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(input.name)}`,
      }
      setProducts((prev) => [...prev, newProduct])
      return newProduct
    },
    [],
  )

  const addCategory = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const id = slugify(trimmed) || `cat-${Date.now()}`
    setCategories((prev) => {
      if (prev.some((c) => c.id === id)) return prev
      return [...prev, { id, name: trimmed }]
    })
  }, [])

  // Subtle beep for unknown-barcode alerts using the Web Audio API
  const beep = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.type = "square"
      oscillator.frequency.value = 880
      gain.gain.setValueAtTime(0.06, ctx.currentTime)
      oscillator.start()
      oscillator.stop(ctx.currentTime + 0.12)
      oscillator.onended = () => ctx.close()
    } catch {
      // no-op if audio is unavailable
    }
  }, [])

  const processScan = useCallback(
    (code: string) => {
      const match = productsRef.current.find((p) => p.barcode === code)
      if (match) {
        addToCart(match)
        triggerCartFlash()
        toast.success(`Scanned: ${match.name}`, { description: `Barcode ${code}` })
      } else {
        beep()
        toast.warning("Unknown barcode", { description: `No product for ${code}. Add it now.` })
        openAddProduct(code)
      }
    },
    [addToCart, beep, openAddProduct, triggerCartFlash],
  )

  // Global hardware barcode scanner: buffers rapid keystrokes ending in Enter
  useEffect(() => {
    const bufferRef = { value: "" }
    let lastTime = 0

    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now()
      // Hardware scanners type very fast; a slow gap means human typing -> reset buffer
      if (now - lastTime > 80) {
        bufferRef.value = ""
      }
      lastTime = now

      if (e.key === "Enter") {
        const code = bufferRef.value
        bufferRef.value = ""
        // Only treat as a scan when a real buffered code exists (ignores manual Enter)
        if (code.length >= 3) {
          e.preventDefault()
          processScan(code)
        }
        return
      }

      if (e.key.length === 1) {
        bufferRef.value += e.key
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [processScan])

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
        products,
        addProduct,
        categories,
        addCategory,
        scannerActive: true,
        cartFlash,
        addProductOpen,
        prefilledBarcode,
        openAddProduct,
        closeAddProduct,
        checkoutOpen,
        openCheckout,
        closeCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
