import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card,Toast } from '@heroui/react'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { coupons, formatPrice } from '../data/products.js'
import { createOrder, createPaymentOrder, verifyPayment, createUPIPayment, checkUPIPaymentStatus } from '../api/orderApi.js'
import { openRazorpay, showUPIPaymentModal } from '../utils/razorpay.js'
import SiteHeader from '../components/layout/Header.jsx'
import SiteFooter from '../components/layout/Footer.jsx'

const paymentMethods = [
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Credit / Debit Card' },
  { value: 'netbanking', label: 'Net Banking' },
  { value: 'cod', label: 'Cash on Delivery' },
]

const deliverySlots = [
  { value: 'asap', label: 'ASAP (30-40 mins)' },
  { value: 'today', label: 'Today, 7 AM – 10 PM' },
  { value: 'tomorrow', label: 'Tomorrow morning' },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const showToast = ({ title, description /*, status */ }) => {
    try {
      // Map basic title hints to toast variants
      const lower = (title || '').toLowerCase()
      const variant = lower.includes('error') || lower.includes('failed')
        ? 'danger'
        : lower.includes('success') || lower.includes('completed')
        ? 'success'
        : 'info'

      // Use HeroUI Toast API if available
      if (Toast && Toast.toast) {
        Toast.toast(
          (
            <div className="space-y-1">
              {title ? <div className="font-semibold">{title}</div> : null}
              {description ? <div className="text-sm">{description}</div> : null}
            </div>
          ),
          { variant }
        )
        return
      }

      // Fallback simple toast using alert when HeroUI Toast isn't available
      window.alert(`${title} - ${description}`)
    } catch (e) {
      try {
        window.alert(`${title} - ${description}`)
      } catch (e2) {
        console.log(title, description)
      }
    }
  }
  const { items, updateQuantity, removeItem, clearCart } = useCart()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [zip, setZip] = useState('')
  const [slot, setSlot] = useState('asap')
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [confirmationMessage, setConfirmationMessage] = useState('')
  const [upiOrderId, setUpiOrderId] = useState('')
  const [upiStatus, setUpiStatus] = useState('idle')
  const [upiStatusMessage, setUpiStatusMessage] = useState('')
  const [upiShortUrl, setUpiShortUrl] = useState('')
  const [upiPollingActive, setUpiPollingActive] = useState(false)
  let order = null

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
      showToast({ title: 'Error', description: 'Enter a coupon code to apply.' })
      return
    }
    if (!coupons[code]) {
      showToast({ title: 'Error', description: 'That coupon code is not valid.' })
      return
    }
    setAppliedCoupon(code)
    setCouponError('')
  }

  const redirectWithConfirmation = async (message, path) => {
    setConfirmationMessage(message)
    await new Promise((resolve) => setTimeout(resolve, 700))
    navigate(path)
  }

  const updateUPIStatus = async (orderId) => {
    try {
      setUpiStatusMessage('Checking UPI payment status...')
      const statusResponse = await checkUPIPaymentStatus(orderId)
      if (statusResponse.data?.isPaid) {
        setUpiStatus('success')
        setUpiStatusMessage('Payment completed successfully.')
        return 'paid'
      }
      if (statusResponse.data?.paymentStatus === 'failed') {
        setUpiStatus('failed')
        setUpiStatusMessage('UPI payment failed. Please retry or use another payment method.')
        return 'failed'
      }
      setUpiStatus('pending')
      setUpiStatusMessage('Payment is still pending. Please complete it in your UPI app.')
      return 'pending'
    } catch (error) {
      setUpiStatus('pending')
      setUpiStatusMessage('Unable to check UPI status right now. Try again in a moment.')
      return 'error'
    }
  }

  const handlePlaceOrder = async (event) => {
    if (event?.preventDefault) {
      event.preventDefault()
    }

    if (!name.trim()) {
      showToast({ title: 'Error', description: 'Please enter your full name.' })
      return
    }

    if (!phone.trim()) {
      showToast({ title: 'Error', description: 'Please enter your phone number.' })
      return
    }

    const phoneDigitsOnly = phone.replace(/\D/g, '')
    if (phoneDigitsOnly.length < 10) {
      showToast({ title: 'Error', description: 'Please enter a valid phone number (at least 10 digits).' })
      return
    }

    if (!address.trim()) {
      showToast({ title: 'Error', description: 'Please enter your delivery address.' })
      return
    }

    if (!city.trim()) {
      showToast({ title: 'Error', description: 'Please enter your city.' })
      return
    }

    if (!zip.trim()) {
      showToast({ title: 'Error', description: 'Please enter your ZIP / PIN code.' })
      return
    }

    if (!items.length) {
      showToast({ title: 'Error', description: 'Your cart is empty. Please add items before placing an order.' })
      return
    }

    setIsPlacingOrder(true)

    try {
      const orderData = {
        items: items.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: {
          street: address,
          phone: phone,
          name: name,
          city: city,
          zip: zip,
        },
        paymentMethod,
      }

      const response = await createOrder(orderData)
      order = response.data?.order

      if (!order || !order._id) {
        throw new Error(response.data?.message || 'Failed to create order')
      }

      setUpiOrderId(order._id)

      // Clear cart immediately after successful order creation (before payment or navigation)
      await clearCart()

      if (paymentMethod === 'cod') {
        showToast({ title: 'Success', description: `Order placed successfully. Delivery scheduled for ${deliverySlots.find((slotItem) => slotItem.value === slot)?.label}.` })
        await redirectWithConfirmation('Order placed successfully. Redirecting to order details...', `/order-success/${order._id}`)
        return
      }

      // Handle UPI Intent Payment
      if (paymentMethod === 'upi') {
        try {
          setUpiStatus('pending')
          setUpiStatusMessage('Initializing UPI payment. Please wait...')
          setUpiPollingActive(false)

          // Step 1: Create Razorpay order for the order before UPI payment intent
          const paymentOrderResponse = await createPaymentOrder(order._id)
          if (!paymentOrderResponse.data?.success) {
            throw new Error(paymentOrderResponse.data?.message || 'Failed to create payment order for UPI')
          }

          // Step 2: Create UPI payment intent
          const upiResponse = await createUPIPayment(order._id, {})
          
          if (!upiResponse.data?.success) {
            throw new Error(upiResponse.data?.message || 'Failed to create UPI payment')
          }

          const paymentData = upiResponse.data.payment
          const shortUrl = paymentData.short_url
          setUpiShortUrl(shortUrl)
          setUpiStatus('pending')
          setUpiStatusMessage('UPI payment link created. Complete the payment using the link below.')
          setUpiPollingActive(true)

          // Step 2: Show payment link/QR code modal
          await showUPIPaymentModal({
            shortUrl,
            onStatusCheck: async () => {
              // Check payment status
              try {
                const status = await updateUPIStatus(order._id)
                if (status === 'paid') {
                  showToast({ title: 'Success', description: 'Payment confirmed! Your order is being processed.' })
                  await redirectWithConfirmation('UPI payment confirmed. Redirecting to order details...', `/order-success/${order._id}`)
                } else if (status === 'failed') {
                  navigate(`/order-failure/${order._id}`)
                }
              } catch (error) {
                showToast({ title: 'Error', description: 'Failed to check payment status. Please try again.' })
              }
            },
          })

          // Step 3: Poll for payment status (check every 3 seconds for max 5 minutes)
          let pollCount = 0
          const maxPolls = 100 // ~5 minutes with 3-second intervals
          const pollInterval = setInterval(async () => {
            pollCount++
            try {
              const status = await updateUPIStatus(order._id)
              if (status === 'paid') {
                clearInterval(pollInterval)
                setUpiPollingActive(false)
                showToast({ title: 'Success', description: 'Payment completed successfully. Your order is confirmed.' })
                await redirectWithConfirmation('Payment completed successfully. Redirecting to order details...', `/order-success/${order._id}`)
              } else if (status === 'failed') {
                clearInterval(pollInterval)
                setUpiPollingActive(false)
                navigate(`/order-failure/${order._id}`)
              }
            } catch (error) {
              console.error('Error checking payment status:', error)
            }

            if (pollCount >= maxPolls) {
              clearInterval(pollInterval)
              setUpiPollingActive(false)
              showToast({ title: 'Timeout', description: 'Payment check timed out. Please check your order status.' })
            }
          }, 3000)

          return
        } catch (error) {
          console.error('UPI Payment error:', error)
          setUpiStatus('failed')
          setUpiStatusMessage('Unable to complete UPI payment. Please try again.')
          navigate(`/order-failure/${order._id}`)
          throw error
        }
      }

      // Handle other payment methods with standard checkout
      const paymentResponse = await createPaymentOrder(order._id)
      if (!paymentResponse.data?.success) {
        throw new Error(paymentResponse.data?.message || 'Failed to create payment order')
      }

      await openRazorpay({
        orderId: order._id,
        paymentOrder: paymentResponse.data,
        name,
        email: user?.email || '',
        phone,
        onPaymentSuccess: async (response) => {
          await verifyPayment(order._id, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
        },
      })
      showToast({ title: 'Success', description: 'Payment completed successfully. Your order is confirmed.' })
      await redirectWithConfirmation('Payment completed successfully. Redirecting to order details...', `/order-success/${order._id}`)
    } catch (error) {
      console.error('Order placement error:', error)
      if (order?._id && paymentMethod !== 'cod') {
        navigate(`/order-failure/${order._id}`)
      }
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to place order'
      showToast({ title: 'Error', description: errorMessage })
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
          <p className="text-2xl font-semibold text-foreground">Not Able To Checkout</p>
          <p className="mt-3 text-sm text-foreground/70">You have to log in before placing your order.</p>
          <Button variant="primary" className="mt-6" onPress={() => navigate('/login')}>
            Login Now
          </Button>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-kpa-600">Checkout</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Delivery and payment details
          </h1>
        </div>

        {confirmationMessage ? (
          <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-foreground">
            {confirmationMessage}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
          <form className="space-y-6 rounded-[2rem] border border-default-200 bg-background p-6 shadow-sm" onSubmit={handlePlaceOrder}>
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Delivery details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-foreground">
                  Full name
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-3xl border border-default-200 bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-kpa-500"
                    placeholder="Name"
                  />
                </label>
                <label className="space-y-2 text-sm text-foreground">
                  Phone number
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="w-full rounded-3xl border border-default-200 bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-kpa-500"
                    placeholder="Phone"
                  />
                </label>
              </div>
              <label className="space-y-2 text-sm text-foreground">
                Delivery address
                <textarea
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  rows="4"
                  className="w-full rounded-3xl border border-default-200 bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-kpa-500"
                  placeholder="House number, street"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-foreground">
                  City
                  <input
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className="w-full rounded-3xl border border-default-200 bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-kpa-500"
                    placeholder="City"
                  />
                </label>
                <label className="space-y-2 text-sm text-foreground">
                  ZIP / PIN code
                  <input
                    value={zip}
                    onChange={(event) => setZip(event.target.value)}
                    className="w-full rounded-3xl border border-default-200 bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-kpa-500"
                    placeholder="ZIP / PIN code"
                  />
                </label>
              </div>
              <label className="space-y-2 text-sm text-foreground">
                Delivery slot
                <select
                  value={slot}
                  onChange={(event) => setSlot(event.target.value)}
                  className="w-full rounded-3xl border border-default-200 bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-kpa-500"
                >
                  {deliverySlots.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <section className="space-y-4 rounded-[2rem] border border-default-200 bg-default-100 p-5">
              <h2 className="text-xl font-semibold text-foreground">Payment method</h2>
              <div className="grid gap-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.value}
                    className="flex cursor-pointer items-center gap-3 rounded-3xl border border-default-200 bg-white px-4 py-3 text-sm transition hover:border-kpa-300"
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => {
                        setPaymentMethod(method.value)
                        if (method.value !== 'upi') {
                          setUpiOrderId('')
                          setUpiStatus('idle')
                          setUpiStatusMessage('')
                          setUpiShortUrl('')
                          setUpiPollingActive(false)
                        }
                      }}
                      className="h-4 w-4 text-kpa-600"
                    />
                    <span>{method.label}</span>
                  </label>
                ))}
              </div>
            </section>

            {paymentMethod === 'upi' && upiStatus !== 'idle' ? (
              <section className="space-y-4 rounded-[2rem] border border-kpa-300 bg-emerald-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-3 w-3 rounded-full bg-emerald-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">UPI payment status</h3>
                    <p className="text-sm text-foreground/70">{upiStatusMessage}</p>
                  </div>
                </div>
                {upiShortUrl ? (
                  <div className="space-y-2 rounded-3xl border border-emerald-200 bg-white p-4">
                    <p className="text-sm font-semibold text-foreground">Payment link</p>
                    <a
                      href={upiShortUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-kpa-600 underline"
                    >
                      Open UPI payment link
                    </a>
                  </div>
                ) : null}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    variant="primary"
                    onPress={() => updateUPIStatus(upiOrderId)}
                    disabled={!upiOrderId || upiStatus === 'success' || !upiPollingActive}
                  >
                    Check UPI status
                  </Button>
                  {upiPollingActive ? (
                    <p className="text-sm text-foreground/70">Polling payment status in the background...</p>
                  ) : null}
                </div>
              </section>
            ) : null}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-foreground/70">Review your order and confirm before payment.</p>
              <Button 
                variant="primary" 
                type="submit"
                isLoading={isPlacingOrder}
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? 'Placing order...' : 'Place order'}
              </Button>
            </div>
          </form>

          <aside className="space-y-6">
            <Card className="rounded-[2rem] border border-default-200 bg-background p-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Order summary</h2>
                  <p className="text-sm text-foreground/70">{items.length} item{items.length > 1 ? 's' : ''} in cart</p>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.key} className="grid gap-3 rounded-3xl border border-default-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.name}</p>
                          <p className="text-xs text-foreground/70">{item.weightLabel} × {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 rounded-3xl border border-default-200 bg-default-100 p-4">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">Apply coupon</p>
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(event) => setCouponInput(event.target.value)}
                        className="w-full rounded-3xl border border-default-200 bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-kpa-500"
                        placeholder="Coupon code"
                      />
                      <Button variant="secondary" onPress={handleApplyCoupon}>
                        Apply coupon
                      </Button>
                    </div>
                    {appliedCoupon && !couponError ? (
                      <p className="text-sm text-kpa-700">Coupon {appliedCoupon} applied.</p>
                    ) : null}
                    {couponError ? <p className="text-sm text-rose-600">{couponError}</p> : null}
                  </div>
                </div>

                <div className="space-y-3 rounded-3xl border border-default-200 bg-default-100 p-4 text-sm text-foreground/70">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-kpa-700">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-default-200 pt-4 text-base font-semibold text-foreground">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}


