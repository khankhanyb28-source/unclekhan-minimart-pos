import { supabaseClient } from "./supabase-client"
import type { Category, Product } from "../context/cart-context"

export async function fetchCategories() {
  const { data, error } = await supabaseClient.from("categories").select("id, name").order("name")
  if (error) throw error
  return (data ?? []) as Category[]
}

export async function fetchProducts() {
  const { data, error } = await supabaseClient
    .from("products")
    .select("id, name, price, category, image, barcode")
    .order("name")
  if (error) throw error
  return (data ?? []) as Product[]
}

export async function createCategory(category: Category) {
  const { data, error } = await supabaseClient.from("categories").insert(category).select().single()
  if (error) throw error
  return data as Category
}

export async function createProduct(product: Omit<Product, "id">) {
  const { data, error } = await supabaseClient.from("products").insert(product).select().single()
  if (error) throw error
  return data as Product
}

export async function updateProduct(productId: number, changes: Partial<Omit<Product, "id">>) {
  const { data, error } = await supabaseClient
    .from("products")
    .update(changes)
    .eq("id", productId)
    .select()
    .single()
  if (error) throw error
  return data as Product
}
