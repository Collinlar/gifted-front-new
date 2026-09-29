import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { getCart, addToCart as apiAdd, setCartQuantity, removeFromCart, getEntitlementKeys } from "../lib/shopApi"
import { supabase } from "../lib/supabase"

// The cart lives above the router so it survives navigation. Without this, a
// student adding a book, going to look at a course and coming back would find
// an empty cart, and the badge in the sidebar would have nothing to count.
//
// It is held in the database rather than in local storage on purpose: carts
// here are abandoned on a phone and finished on a school computer.

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [owned, setOwned] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const clear = useCallback(() => {
    setItems([])
    setOwned(new Set())
    setError("")
    setLoading(false)
  }, [])

  const refresh = useCallback(async () => {
    // A signed out visitor has no cart and no entitlements, so asking for them
    // is two preflights and two round trips for a guaranteed empty answer.
    // This provider sits above the router, so without the check that happened
    // on the public homepage too, and for every crawler.
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { clear(); return }

    try {
      const [{ items }, keys] = await Promise.all([getCart(), getEntitlementKeys()])
      setItems(items)
      setOwned(keys)
      setError("")
    } catch (e) {
      // A session that expired between the check and the query lands here and
      // is not worth an error banner
      setItems([])
      setOwned(new Set())
      if (e?.message && !/JWT|session|sign in/i.test(e.message)) setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [clear])

  useEffect(() => {
    refresh()
    // Signing in has to fill the cart without a reload, and signing out has to
    // empty it, otherwise the badge in the sidebar keeps the last person's count.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") clear()
      else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") refresh()
    })
    return () => sub?.subscription?.unsubscribe()
  }, [refresh, clear])

  const add = async (productId, quantity = 1) => {
    // The server does the real check. Its message is the one the student sees,
    // so nothing here invents a friendlier version of a refusal.
    await apiAdd(productId, quantity)
    await refresh()
  }

  const setQuantity = async (cartItemId, quantity) => {
    // Move the number first. A quantity stepper that waits on a round trip
    // feels broken long before it feels slow.
    setItems((p) => p.map((i) => (i.id === cartItemId ? { ...i, quantity } : i)))
    try { await setCartQuantity(cartItemId, quantity) } finally { refresh() }
  }

  const remove = async (cartItemId) => {
    setItems((p) => p.filter((i) => i.id !== cartItemId))
    try { await removeFromCart(cartItemId) } finally { refresh() }
  }

  const count    = items.reduce((n, i) => n + (i.quantity || 1), 0)
  const subtotal = items.reduce(
    (n, i) => n + Number(i.marketplace_products?.price || 0) * (i.quantity || 1), 0
  )
  const needsDelivery = items.some((i) => i.marketplace_products?.requires_shipping)

  const has = useCallback(
    (type, id) => owned.has(`${type}:${id}`),
    [owned]
  )
  const inCart = useCallback(
    (productId) => items.some((i) => i.product_id === productId),
    [items]
  )

  return (
    <CartContext.Provider value={{
      items, count, subtotal, needsDelivery, loading, error,
      add, setQuantity, remove, refresh, has, inCart, owned,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}
