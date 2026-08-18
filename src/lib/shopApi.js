// The shop runs on the student's own logged-in session through the anon
// client, guarded by row level security, for the same reason registrations do.
// A student reaches their own cart, their own orders and their own
// entitlements, and the database is what enforces that rather than this file
// being careful.
//
// Prices are never sent from here. checkout_cart reads every line from the
// products table itself, so the browser can ask to buy something but cannot
// say what it costs.
import { supabase } from './supabase'

function unwrap({ data, error }) {
  if (error) throw new Error(error.message || 'Something went wrong. Try again.')
  if (data && typeof data === 'object' && data.error) throw new Error(data.error)
  return data
}

// ── The catalogue ──────────────────────────────────────────────────────────

/**
 * Everything on sale. Draft and archived products are invisible, enforced by
 * RLS, so a half-built listing can sit in admin for a week without leaking.
 */
export async function getProducts() {
  const { data, error } = await supabase
    .from('marketplace_products')
    .select('*')
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw error
  return { products: data || [] }
}

export async function getProduct(id) {
  const { data, error } = await supabase
    .from('marketplace_products')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('That item is not on sale.')
  return { product: data }
}

// ── The cart ───────────────────────────────────────────────────────────────

export async function getCart() {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, marketplace_products(*)')
    .order('added_at', { ascending: true })

  if (error) throw error
  // A product archived after it was added leaves a row pointing at nothing.
  // Dropping it here is kinder than a cart line that renders blank.
  return { items: (data || []).filter((r) => r.marketplace_products) }
}

export async function addToCart(productId, quantity = 1) {
  return unwrap(await supabase.rpc('add_to_cart', {
    p_product_id: productId,
    p_quantity: quantity,
  }))
}

export async function setCartQuantity(cartItemId, quantity) {
  if (quantity < 1) return removeFromCart(cartItemId)
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)
  if (error) throw error
  return { ok: true }
}

export async function removeFromCart(cartItemId) {
  const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId)
  if (error) throw error
  return { ok: true }
}

// ── Checkout ───────────────────────────────────────────────────────────────

/**
 * Turns the cart into an order and hands it back so the caller can take
 * payment. A cart that costs nothing comes back already paid, which is what
 * makes claiming free material a single tap rather than a card form.
 */
export async function checkout(delivery = {}) {
  const res = unwrap(await supabase.rpc('checkout_cart', { p_delivery: delivery }))
  return { order: res.order }
}

export async function confirmOrderPayment(orderId, reference) {
  return unwrap(await supabase.rpc('confirm_order_payment', {
    p_order_id: orderId,
    p_reference: reference || null,
  }))
}

export async function getMyOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return { orders: data || [] }
}

export async function getOrder(id) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('We could not find that order.')
  return { order: data }
}

// ── What the student owns ──────────────────────────────────────────────────

export async function getMyEntitlements() {
  const { data, error } = await supabase
    .from('entitlements')
    .select('*')
    .is('revoked_at', null)

  if (error) throw error
  return { entitlements: data || [] }
}

/** A Set of "type:id" keys, which is the shape every screen actually wants. */
export async function getEntitlementKeys() {
  try {
    const { entitlements } = await getMyEntitlements()
    return new Set(entitlements.map((e) => `${e.item_type}:${e.item_id}`))
  } catch {
    // Signed out, or the migration has not been run yet. An empty set means
    // everything renders as not yet owned, which is the safe way to be wrong.
    return new Set()
  }
}

/** Save a free course or assessment to the student's own learning. */
export async function claimFree(itemType, itemId) {
  return unwrap(await supabase.rpc('claim_free_item', {
    p_item_type: itemType,
    p_item_id: itemId,
  }))
}

export async function dropFree(itemType, itemId) {
  return unwrap(await supabase.rpc('drop_free_item', {
    p_item_type: itemType,
    p_item_id: itemId,
  }))
}

/** The download link for something already bought. Ownership checked server side. */
export async function getDownloadLink(productId) {
  return unwrap(await supabase.rpc('get_my_download', { p_product_id: productId }))
}

// ── Money ──────────────────────────────────────────────────────────────────

export function formatMoney(amount, currency = 'GHS') {
  const n = Number(amount || 0)
  return `${currency === 'GHS' ? 'GH₵' : `${currency} `}${n.toLocaleString(undefined, {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * courses.cost has held both numbers and strings like "GHS 200" over the
 * years, so anything that needs a number scrubs it rather than casting.
 */
export function priceOf(raw) {
  if (raw === null || raw === undefined) return 0
  const n = parseFloat(String(raw).replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}
