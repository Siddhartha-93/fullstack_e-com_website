import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card } from '@heroui/react'
import { useAuth } from '../context/AuthContext.jsx'
import SiteHeader from '../components/layout/Header.jsx'
import SiteFooter from '../components/layout/Footer.jsx'
import { fetchOrderById, createPaymentOrder, verifyPayment } from '../api/orderApi.js'
import { openRazorpay } from '../utils/razorpay.js'
import { formatPrice } from '../data/products.js'

export default function PaymentFailurePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)
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
    setRetrying(true)
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
      setError(err?.response?.data?.message || err.message || 'Retry failed')
    } finally {
      setRetrying(false)
    }
  }

  const canRetry = !order?.isPaid && order?.paymentMethod !== 'cod'

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-rose-600">Payment failed</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Your payment could not be completed</h1>
          <p className="mt-3 text-sm text-foreground/70">Please retry payment or visit your orders to check the status.</p>
        </div>

        {loading ? (
          <Card className="border border-default-200 bg-background p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-foreground">Loading order details...</p>
          </Card>
        ) : error && !order ? (
          <Card className="border border-default-200 bg-background p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-foreground">Unable to load order</p>
            <p className="mt-2 text-sm text-foreground/70">{error}</p>
            <Button variant="primary" className="mt-4" onPress={() => navigate('/orders')}>View orders</Button>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="border border-default-200 bg-background p-6 shadow-sm">
              <div className="space-y-4">
                <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-foreground">
                  <p className="font-semibold">Payment failed</p>
                  <p className="text-sm text-foreground/70">Your order was created but payment was not completed.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-foreground/70">Order ID</p>
                    <p className="font-mono text-base font-semibold text-foreground">{order._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Amount due</p>
                    <p className="text-lg font-semibold text-kpa-600">{formatPrice(order.total)}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-default-200 bg-background p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-foreground">Payment summary</h2>
              <div className="space-y-2 text-sm text-foreground/70">
                <p><span className="font-semibold text-foreground">Method:</span> {order.paymentMethod || 'N/A'}</p>
                <p><span className="font-semibold text-foreground">Last payment ID:</span> {order.paymentInfo?.razorpayPaymentId || 'N/A'}</p>
                <p><span className="font-semibold text-foreground">Razorpay order:</span> {order.paymentInfo?.razorpayOrderId || 'N/A'}</p>
              </div>
              <div className="mt-4 flex gap-3">
                <Button variant="ghost" onPress={() => navigate('/cart')}>Back to cart</Button>
                <Button variant="primary" onPress={handleRetryPayment} isLoading={retrying} disabled={!canRetry || retrying}>Retry payment</Button>
              </div>
            </Card>

            {error ? (
              <Card className="border border-default-200 bg-background p-6 shadow-sm text-sm text-rose-600">
                {error}
              </Card>
            ) : null}

            {canRetry ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button variant="primary" onPress={handleRetryPayment} isLoading={retrying} disabled={retrying}>
                  Retry payment
                </Button>
                <Button variant="ghost" onPress={() => navigate(`/order/${order._id}`)}>
                  View order details
                </Button>
              </div>
            ) : (
              <div className="space-y-4 rounded-3xl border border-default-200 bg-default-100 p-6">
                <p className="text-sm text-foreground/70">This order cannot be retried from this page.</p>
                <Button variant="primary" onPress={() => navigate('/orders')}>View your orders</Button>
              </div>
            )}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
