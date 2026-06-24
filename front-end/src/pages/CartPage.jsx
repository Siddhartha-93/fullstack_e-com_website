import { useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Button, Card } from '@heroui/react'
import { useCart } from '../context/CartContext.jsx'
import { coupons, formatPrice } from '../data/products.js'
import SiteHeader from '../components/layout/Header.jsx'
import SiteFooter from '../components/layout/Footer.jsx'

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCart()
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0
    const code = appliedCoupon.toUpperCase()
    const coupon = coupons[code]
    if (!coupon) return 0
    return typeof coupon.discount === 'number' && coupon.discount < 1
      ? Math.round(subtotal * coupon.discount)
      : coupon.discount
  }, [appliedCoupon, subtotal])

  const total = subtotal - discount

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase()
    if (!code) {
      setCouponError('Enter a coupon code to apply.')
      return
    }
    if (!coupons[code]) {
      setCouponError('That coupon code is not valid.')
      return
    }
    setAppliedCoupon(code)
    setCouponError('')
  }

  const handleQuantityChange = (item, delta) => {
    const nextQty = item.quantity + delta
    if (nextQty < 1) {
      removeItem(item.key)
      return
    }
    updateQuantity(item.key, nextQty)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-kpa-600">Cart</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Review your order before checkout.
            </h1>
          </div>
          <div className="text-sm text-foreground/70">
            {items.length === 0
              ? 'Your cart is empty.'
              : `${items.length} item${items.length > 1 ? 's' : ''} in your cart.`}
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="rounded-[2rem] border border-default-200 bg-background p-10 text-center">
            <p className="text-lg font-semibold text-foreground">No products added yet.</p>
            <p className="mt-3 text-sm text-foreground/70">Browse the shop to add fresh chicken items to your cart.</p>
            <RouterLink to="/shop" className="mt-6 block w-full rounded-3xl">
              <Button variant="primary" className="w-full">
                Go to Shop
              </Button>
            </RouterLink>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
            <section className="space-y-4">
              <div className="space-y-4 rounded-[2rem] border border-default-200 bg-background p-6 shadow-sm">
                {items.map((item) => (
                  <div key={item.key} className="grid gap-4 rounded-3xl border border-default-200 bg-white p-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                    <img src={item.image} alt={item.name} className="h-28 w-full max-w-[120px] rounded-3xl object-cover" />
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-base font-semibold text-foreground">{item.name}</p>
                          <p className="text-sm text-foreground/70">{item.weightLabel}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          className="text-sm font-medium text-kpa-700 transition hover:text-kpa-900"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 rounded-full border border-default-200 bg-default-100 px-2 py-1">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item, -1)}
                            className="h-9 w-9 rounded-full bg-white text-lg font-semibold text-foreground shadow-sm transition hover:bg-default-100"
                          >
                            −
                          </button>
                          <span className="min-w-[2rem] text-center text-sm font-semibold text-foreground">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item, 1)}
                            className="h-9 w-9 rounded-full bg-white text-lg font-semibold text-foreground shadow-sm transition hover:bg-default-100"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-sm text-foreground/70">
                          Unit price {formatPrice(item.price)}
                        </div>
                        <div className="text-base font-semibold text-foreground">{formatPrice(item.price * item.quantity)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Card className="rounded-[2rem] border border-default-200 bg-default-100 p-6">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Add a coupon</p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(event) => setCouponInput(event.target.value)}
                      placeholder="Enter coupon code"
                      className="w-full rounded-3xl border border-default-200 bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-kpa-500"
                    />
                    <Button variant="secondary" onPress={handleApplyCoupon}>
                      Apply
                    </Button>
                  </div>
                  {appliedCoupon && !couponError ? (
                    <p className="text-sm text-kpa-700">Coupon {appliedCoupon} applied.</p>
                  ) : null}
                  {couponError ? <p className="text-sm text-rose-600">{couponError}</p> : null}
                </div>
              </Card>
            </section>

            <aside className="space-y-4">
              <Card className="rounded-[2rem] border border-default-200 bg-background p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-foreground/70">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-sm text-foreground/70">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between rounded-3xl bg-default-100 px-4 py-4 text-sm font-semibold text-foreground">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
                <RouterLink to="/checkout" className="block">
                  <Button variant="primary" className="w-full">
                    Proceed to checkout
                  </Button>
                </RouterLink>
                <p className="text-sm text-foreground/70">
                  Estimate delivery in 45–90 minutes after checkout.
                </p>
              </Card>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
