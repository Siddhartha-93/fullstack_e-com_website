import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Chip } from '@heroui/react'
import { useAuth } from '../context/AuthContext.jsx'
import SiteHeader from '../components/layout/Header.jsx'
import SiteFooter from '../components/layout/Footer.jsx'
import { fetchOrderById, createPaymentOrder, verifyPayment } from '../api/orderApi.js'
import { openRazorpay } from '../utils/razorpay.js'
import { formatPrice } from '../data/products.js'

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'processing':
      return 'info'
    case 'shipped':
      return 'primary'
    case 'delivered':
      return 'success'
    case 'cancelled':
      return 'danger'
    default:
      return 'default'
  }
}

const getItemImage = (item) => item.image || item.product?.images?.[0]?.url || ''

export default function OrderDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
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

  const handleRetryPayment = async () => {
    if (!order) return
    setProcessing(true)
    setError('')

    try {
      const paymentResponse = await createPaymentOrder(order._id)
      if (!paymentResponse.data?.success) {
        throw new Error(paymentResponse.data?.message || 'Failed to create payment order')
      }

      await openRazorpay({
        orderId: order._id,
        paymentOrder: paymentResponse.data,
        name: order.shippingAddress?.name || '',
        email: user?.email || '',
        phone: order.shippingAddress?.phone || '',
        onPaymentSuccess: async (response) => {
          await verifyPayment(order._id, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
        },
      })
      navigate(`/order-success/${order._id}`)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Payment retry failed')
    } finally {
      setProcessing(false)
    }
  }

  const canRetry = !order?.isPaid && order?.paymentMethod !== 'cod'

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-kpa-600">Order details</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Order #{id}</h1>
          <p className="mt-3 text-sm text-foreground/70">Review the current status of your order.</p>
        </div>

        {loading ? (
          <Card className="border border-default-200 bg-background p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-foreground">Loading your order...</p>
          </Card>
        ) : error ? (
          <Card className="border border-default-200 bg-background p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-foreground">Unable to load order</p>
            <p className="mt-2 text-sm text-foreground/70">{error}</p>
            <Button variant="primary" className="mt-4" onPress={() => navigate('/orders')}>Back to orders</Button>
          </Card>
        ) : !order ? (
          <Card className="border border-default-200 bg-background p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-foreground">Order not found</p>
            <Button variant="primary" className="mt-4" onPress={() => navigate('/orders')}>Back to orders</Button>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="border border-default-200 bg-background p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-foreground/70">Status</p>
                  <p className="font-semibold text-foreground">{order.status}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/70">Payment</p>
                  <p className="font-semibold text-foreground">{order.paymentStatus}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/70">Total</p>
                  <p className="font-semibold text-kpa-600">{formatPrice(order.total)}</p>
                </div>
              </div>
            </Card>

            {error ? (
              <Card className="border border-default-200 bg-background p-6 shadow-sm text-sm text-rose-600">{error}</Card>
            ) : null}

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
              <h2 className="mb-4 text-lg font-semibold text-foreground">Shipping address</h2>
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
              <Button variant="primary" onPress={() => navigate('/orders')}>
                Back to orders
              </Button>
              {canRetry ? (
                <Button variant="secondary" onPress={handleRetryPayment} isLoading={processing} disabled={processing}>
                  Retry payment
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
