"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { products as seedProducts } from "../data/products"
import { createProduct as createProductDb, createCategory as createCategoryDb, fetchCategories, fetchProducts, updateProduct as updateProductDb } from "../lib/db"
import { isSupabaseConfigured } from "../lib/supabase-client"

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
  addProduct: (input: NewProductInput) => Promise<Product>
  updateProduct: (productId: number, changes: Partial<Omit<Product, "id">>) => Promise<Product>
  // Categories
  categories: Category[]
  addCategory: (name: string) => Promise<Category | undefined>
  // Scanner
  scannerActive: boolean
  cartFlash: boolean
  // Add product modal
  addProductOpen: boolean
  prefilledBarcode: string
  openAddProduct: (barcode?: string) => void
  closeAddProduct: () => void
  // Edit mode
  isEditMode: boolean
  toggleEditMode: () => void
  editingProduct: Product | null
  editProductOpen: boolean
  openEditProduct: (product: Product) => void
  closeEditProduct: () => void
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

function readStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true
  return target.isContentEditable
}

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
  const [storageReady, setStorageReady] = useState(false)
  const [cartFlash, setCartFlash] = useState(false)
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [prefilledBarcode, setPrefilledBarcode] = useState("")
  const [editProductOpen, setEditProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  // Keep a ref of products so the global scanner handler always reads the latest inventory
  const productsRef = useRef(products)
  useEffect(() => {
    productsRef.current = products
  }, [products])

  // Hydrate from localStorage once on mount (avoids SSR mismatch + empty overwrite)
  useEffect(() => {
    const savedCart = readStorage<CartItem[]>("cart")
    if (savedCart) setCart(savedCart)

    const savedProducts = readStorage<Product[]>("products")
    if (savedProducts?.length) setProducts(savedProducts)

    const savedCategories = readStorage<Category[]>("categories")
    if (savedCategories?.length) setCategories(savedCategories)

    setStorageReady(true)
  }, [])

  useEffect(() => {
    if (!storageReady || !isSupabaseConfigured()) return

    fetchProducts()
      .then((data) => {
        if (data.length) setProducts(data)
      })
      .catch((error) => {
        console.error("Failed to load products from Supabase:", error)
      })

    fetchCategories()
      .then((data) => {
        if (data.length) setCategories([{ id: "all", name: "All Products" }, ...data])
      })
      .catch((error) => {
        console.error("Failed to load categories from Supabase:", error)
      })
  }, [storageReady])

  useEffect(() => {
    if (!storageReady) return
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart, storageReady])

  useEffect(() => {
    if (!storageReady) return
    localStorage.setItem("products", JSON.stringify(products))
  }, [products, storageReady])

  useEffect(() => {
    if (!storageReady) return
    localStorage.setItem("categories", JSON.stringify(categories))
  }, [categories, storageReady])

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

  const openEditProduct = useCallback((product: Product) => {
    setEditingProduct(product)
    setEditProductOpen(true)
  }, [])

  const closeEditProduct = useCallback(() => {
    setEditingProduct(null)
    setEditProductOpen(false)
  }, [])

  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev)
  }, [])

  const openCheckout = useCallback(() => setCheckoutOpen(true), [])
  const closeCheckout = useCallback(() => setCheckoutOpen(false), [])

  const addProduct = useCallback(
    async (input: NewProductInput) => {
      const newProductData = {
        name: input.name,
        price: input.price,
        category: input.category,
        barcode: input.barcode.trim() || undefined,
        image: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(input.name)}`,
      }

      if (isSupabaseConfigured()) {
        try {
          const created = await createProductDb(newProductData)
          setProducts((prev) => [...prev, created])
          return created
        } catch (error) {
          console.error("Failed to save product to Supabase:", error)
        }
      }

      const fallbackProduct: Product = {
        id: Date.now(),
        ...newProductData,
      }
      setProducts((prev) => [...prev, fallbackProduct])
      return fallbackProduct
    },
    [],
  )

  const updateProduct = useCallback(
    async (productId: number, changes: Partial<Omit<Product, "id">>) => {
      if (isSupabaseConfigured()) {
        try {
          const updated = await updateProductDb(productId, changes)
          setProducts((prev) => prev.map((product) => (product.id === productId ? updated : product)))
          return updated
        } catch (error) {
          console.error("Failed to update product in Supabase:", error)
        }
      }

      setProducts((prev) =>
        prev.map((product) => (product.id === productId ? { ...product, ...changes } : product)),
      )
      return products.find((product) => product.id === productId) ?? null
    },
    [products],
  )

  const addCategory = useCallback(async (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const id = slugify(trimmed) || `cat-${Date.now()}`
    const newCategory = { id, name: trimmed }

    if (isSupabaseConfigured()) {
      try {
        const created = await createCategoryDb(newCategory)
        setCategories((prev) => {
          if (prev.some((c) => c.id === created.id)) return prev
          return [...prev, created]
        })
        return created
      } catch (error) {
        console.error("Failed to save category to Supabase:", error)
      }
    }

    setCategories((prev) => {
      if (prev.some((c) => c.id === newCategory.id)) return prev
      return [...prev, newCategory]
    })
    return newCategory
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
      const match = productsRef.current.find((p) => p.barcode === code || String(p.id) === code)
      if (match) {
        if (isEditMode) {
          toast.success("Admin scan detected", { description: "Product barcode filled for editing" })
          openEditProduct(match)
          return
        }

        addToCart(match)
        triggerCartFlash()
        toast.success(`Scanned: ${match.name}`, { description: `Barcode ${code}` })
        return
      }

      if (isEditMode && addProductOpen) {
        setPrefilledBarcode(code)
        toast.success("Barcode filled into Add Product form")
        return
      }

      beep()
      toast.warning("Product not found", { description: `Barcode ${code} does not match inventory` })
      if (!isEditMode) {
        openAddProduct(code)
      }
    },
    [addToCart, addProductOpen, beep, isEditMode, openAddProduct, openEditProduct, triggerCartFlash],
  )

  // Global hardware barcode scanner: buffers rapid keystrokes ending in Enter
  useEffect(() => {
    const bufferRef = { value: "" }
    let lastTime = 0
    let clearTimer = 0

    const resetBuffer = () => {
      bufferRef.value = ""
      lastTime = 0
      if (clearTimer) {
        window.clearTimeout(clearTimer)
        clearTimer = 0
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Let manual typing in form fields behave normally
      if (isEditableTarget(e.target)) return
      if (e.ctrlKey || e.altKey || e.metaKey) return

      if (e.key === "Enter") {
        const code = bufferRef.value
        resetBuffer()
        if (code.length >= 3) {
          e.preventDefault()
          processScan(code)
        }
        return
      }

      if (e.key.length !== 1) return

      const now = performance.now()
      if (lastTime && now - lastTime > 60) {
        resetBuffer()
      }
      lastTime = now
      bufferRef.value += e.key

      if (clearTimer) window.clearTimeout(clearTimer)
      clearTimer = window.setTimeout(resetBuffer, 400)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      if (clearTimer) window.clearTimeout(clearTimer)
    }
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
        updateProduct,
        categories,
        addCategory,
        scannerActive: true,
        cartFlash,
        addProductOpen,
        prefilledBarcode,
        openAddProduct,
        closeAddProduct,
        isEditMode,
        toggleEditMode,
        editingProduct,
        editProductOpen,
        openEditProduct,
        closeEditProduct,
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
