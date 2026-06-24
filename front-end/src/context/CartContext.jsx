import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
} from '../api/cartApi.js'

const CartContext = createContext(null)

const mapBackendCartItems = (items) => {
  return items.map((item) => ({
    key: item._id,
    cartItemId: item._id,
    productId: item.product?._id || '',
    name: item.product?.name || 'Item',
    image: item.product?.images?.[0]?.url || '',
    weightLabel: item.product?.weightLabel || '1 unit',
    price: item.product?.price ?? 0,
    quantity: item.quantity,
    stock: item.product?.stock ?? 0,
  }))
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const loadRemoteCart = useCallback(async () => {
    if (!isAuthenticated) return

    setLoading(true)
    try {
      const response = await getCart()
      setItems(mapBackendCartItems(response.data.cart.items || []))
    } catch (error) {
      console.error('Unable to load cart:', error)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    loadRemoteCart()
  }, [loadRemoteCart])

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (isAuthenticated) {
        try {
          const response = await apiAddToCart(product._id || product.id, quantity)
          setItems(mapBackendCartItems(response.data.cart.items || []))
          return
        } catch (error) {
          console.error('Unable to add item to cart:', error)
        }
      }

      const itemPrice = product.price ?? product.weights?.[0]?.price ?? 0
      const imageUrl = product.images?.[0]?.url || product.image || ''
      const label = product.weightLabel || product.weights?.[0]?.label || '1 pack'
      const productId = product._id || product.id
      const key = `${productId}-${label}`

      setItems((prev) => {
        const existing = prev.find((i) => i.key === key)
        if (existing) {
          return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + quantity } : i))
        }
        return [
          ...prev,
          {
            key,
            productId,
            name: product.name,
            image: imageUrl,
            weightLabel: label,
            price: itemPrice,
            quantity,
          },
        ]
      })
    },
    [isAuthenticated],
  )

  const removeItem = useCallback(
    async (key) => {
      if (isAuthenticated) {
        try {
          const response = await apiRemoveCartItem(key)
          setItems(mapBackendCartItems(response.data.cart.items || []))
          return
        } catch (error) {
          console.error('Unable to remove cart item:', error)
        }
      }
      setItems((prev) => prev.filter((item) => item.key !== key))
    },
    [isAuthenticated],
  )

  const updateQuantity = useCallback(
    async (key, quantity) => {
      if (isAuthenticated) {
        try {
          const response = await apiUpdateCartItem(key, quantity)
          setItems(mapBackendCartItems(response.data.cart.items || []))
          return
        } catch (error) {
          console.error('Unable to update cart item:', error)
        }
      }

      setItems((prev) =>
        prev
          .map((item) => (item.key === key ? { ...item, quantity } : item))
          .filter((item) => item.quantity > 0),
      )
    },
    [isAuthenticated],
  )

  const clearCart = useCallback(async () => {
    if (isAuthenticated && items.length) {
      await Promise.all(
        items.map((item) =>
          apiRemoveCartItem(item.key).catch((error) => {
            console.error('Unable to remove cart item during clear:', error)
          }),
        ),
      )
    }
    setItems([])
  }, [isAuthenticated, items])

  const cartCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  )

  const value = useMemo(
    () => ({ items, addToCart, removeItem, updateQuantity, clearCart, cartCount, loading }),
    [items, addToCart, removeItem, updateQuantity, clearCart, cartCount, loading],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
