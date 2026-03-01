import React, { createContext, useContext, useState, useEffect } from 'react'
import { cartAPI } from '../utils/api'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 })
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const fetchCart = async () => {
    if (!user) { setCart({ items: [], totalAmount: 0 }); return }
    try {
      const { data } = await cartAPI.get()
      setCart(data)
    } catch {}
  }

  useEffect(() => { fetchCart() }, [user])

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true)
    try {
      const { data } = await cartAPI.add({ productId, quantity })
      setCart(data)
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to add to cart' }
    } finally { setLoading(false) }
  }

  const updateItem = async (itemId, quantity) => {
    try {
      const { data } = await cartAPI.update(itemId, { quantity })
      setCart(data)
    } catch {}
  }

  const removeItem = async (itemId) => {
    try {
      const { data } = await cartAPI.remove(itemId)
      setCart(data)
    } catch {}
  }

  const clearCart = async () => {
    try {
      await cartAPI.clear()
      setCart({ items: [], totalAmount: 0 })
    } catch {}
  }

  const cartCount = cart.items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, cartCount, loading, addToCart, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
