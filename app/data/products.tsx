import type { Product } from "../context/cart-context"

export const products: Product[] = [
  {
    id: 1,
    name: "Lay's Classic Chips",
    price: 1.99,
    image: "/lays-classic-chips.png",
    category: "snacks",
  },
  {
    id: 2,
    name: "Oreo Cookies",
    price: 2.49,
    image: "/oreo-cookies.png",
    category: "snacks",
  },
  {
    id: 3,
    name: "Coca-Cola 500ml",
    price: 1.89,
    image: "/coca-cola-bottle.png",
    category: "beverages",
  },
  {
    id: 4,
    name: "Mineral Water 1L",
    price: 1.29,
    image: "/mineral-water-1l.png",
    category: "beverages",
  },
  {
    id: 5,
    name: "Red Bull",
    price: 2.99,
    image: "/red-bull-can.png",
    category: "beverages",
  },
  {
    id: 6,
    name: "Instant Noodles",
    price: 0.89,
    image: "/instant-noodles.png",
    category: "groceries",
  },
  {
    id: 7,
    name: "White Bread",
    price: 2.29,
    image: "/white-bread.png",
    category: "groceries",
  },
  {
    id: 8,
    name: "Whole Milk 1 Gallon",
    price: 3.79,
    image: "/whole-milk-gallon.png",
    category: "groceries",
  },
  {
    id: 9,
    name: "Pocket Tissues",
    price: 0.99,
    image: "/pocket-tissues.png",
    category: "household",
  },
  {
    id: 10,
    name: "Dish Soap",
    price: 1.49,
    image: "/dish-soap.png",
    category: "household",
  },
]
