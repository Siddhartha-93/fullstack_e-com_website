import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card } from '@heroui/react'
import SiteHeader from '../components/layout/Header.jsx'
import SiteFooter from '../components/layout/Footer.jsx'
import { fetchOrderById } from '../api/orderApi.js'
import { formatPrice } from '../data/products.js'

const getItemImage = (item) => item.image || item.product?.images?.[0]?.url || ''

export default function OrderSuccessPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await fetchOrderById(id)
        setOrder(response.data?.order || null)
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Unable to load order')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [id])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-kpa-600">Order complete</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Thank you for your order</h1>
          <p className="mt-3 text-sm text-foreground/70">Your order has been placed successfully.</p>
        </div>

        {loading ? (
          <Card className="border border-default-200 bg-background p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-foreground">Loading your order details...</p>
          </Card>
        ) : error ? (
          <Card className="border border-default-200 bg-background p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-foreground">Unable to load order</p>
            <p className="mt-2 text-sm text-foreground/70">{error}</p>
            <Button variant="primary" className="mt-4" onPress={() => navigate('/orders')}>View orders</Button>
          </Card>
        ) : !order ? (
          <Card className="border border-default-200 bg-background p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-foreground">Order not found</p>
            <Button variant="primary" className="mt-4" onPress={() => navigate('/orders')}>View orders</Button>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="border border-default-200 bg-background p-8 shadow-sm">
              <div className="space-y-4">
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-foreground">
                  <p className="font-semibold">Payment confirmed</p>
                  <p className="text-sm text-foreground/70">Your payment is complete and your order is being processed.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-foreground/70">Order ID</p>
                    <p className="font-mono text-base font-semibold text-foreground">{order._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Total paid</p>
                    <p className="text-lg font-semibold text-kpa-600">{formatPrice(order.total)}</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-foreground/70">Status</p>
                    <p className="text-sm font-semibold text-foreground">{order.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Payment status</p>
                    <p className="text-sm font-semibold text-foreground">{order.paymentStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Placed on</p>
                    <p className="text-sm font-semibold text-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-default-200 bg-background p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-foreground">Payment summary</h2>
              <div className="space-y-2 text-sm text-foreground/70">
                <p><span className="font-semibold text-foreground">Method:</span> {order.paymentMethod || 'N/A'}</p>
                <p><span className="font-semibold text-foreground">Payment status:</span> {order.paymentStatus || 'N/A'}</p>
                <p><span className="font-semibold text-foreground">Payment ID:</span> {order.paymentInfo?.razorpayPaymentId || 'N/A'}</p>
                <p><span className="font-semibold text-foreground">Razorpay order:</span> {order.paymentInfo?.razorpayOrderId || 'N/A'}</p>
              </div>
              <div className="mt-4 flex gap-3">
                <Button variant="ghost" onPress={() => navigate('/cart')}>Back to cart</Button>
                <Button variant="primary" onPress={() => navigate('/orders')}>View orders</Button>
              </div>
            </Card>

            <Card className="border border-default-200 bg-background p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Items</h2>
              <div className="space-y-3">
                {order.items?.map((item, index) => {
                  const imageUrl = getItemImage(item)
                  return (
                    <div key={index} className="flex items-center justify-between rounded-2xl bg-default-50 p-3">
                      <div className="flex items-center gap-3">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="h-16 w-16 rounded-2xl object-cover"
                          />
                        ) : null}
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-foreground/70">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card className="border border-default-200 bg-background p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Shipping details</h2>
              <div className="space-y-2 text-sm text-foreground/70">
                {order.shippingAddress?.name && <p>{order.shippingAddress.name}</p>}
                {order.shippingAddress?.street && <p>{order.shippingAddress.street}</p>}
                {order.shippingAddress?.city && <p>{order.shippingAddress.city}</p>}
                {order.shippingAddress?.state && <p>{order.shippingAddress.state}</p>}
                {order.shippingAddress?.zip && <p>{order.shippingAddress.zip}</p>}
                {order.shippingAddress?.country && <p>{order.shippingAddress.country}</p>}
                {order.shippingAddress?.phone && <p>Phone: {order.shippingAddress.phone}</p>}
              </div>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="primary" onPress={() => navigate('/orders')}>View your orders</Button>
              <Button variant="ghost" onPress={() => navigate('/shop')}>Continue shopping</Button>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
