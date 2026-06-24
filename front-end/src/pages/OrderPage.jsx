import { useEffect, useState, useMemo } from 'react'
import { Button, Card, Chip } from '@heroui/react'
import { useNavigate } from 'react-router-dom'
import SiteHeader from '../components/layout/Header.jsx'
import SiteFooter from '../components/layout/Footer.jsx'
import { fetchMyOrders } from '../api/orderApi.js'
import { formatPrice } from '../data/products.js'


export default function OrderPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await fetchMyOrders()
        const fetchedOrders = response.data?.orders ?? response.data ?? []
        setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : [])
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load orders')
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  const { currentOrders, completedOrders } = useMemo(() => {
    const current = orders.filter((order) =>
      ['pending', 'processing', 'shipped'].includes(order.status)
    )
    const completed = orders.filter((order) =>
      ['delivered', 'cancelled'].includes(order.status)
    )
    return {
      currentOrders: current.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      completedOrders: completed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    }
  }, [orders])

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'processing':
        return '🔄'
      case 'shipped':
        return '📦'
      case 'delivered':
        return '✅'
      case 'cancelled':
        return '❌'
      default:
        return '•'
    }
  }

  const getItemImage = (item) => item.image || item.product?.images?.[0]?.url || ''

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const OrderCard = ({ order, isCompleted }) => (
    <Card className="overflow-hidden border border-default-200 shadow-sm">
      <div className="bg-default-100 p-5">
        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-foreground/70">Order ID</p>
            <p className="font-mono text-base font-semibold text-foreground">{order._id}</p>
          </div>
          <Chip
            color={getStatusColor(order.status)}
            size="sm"
            startContent={getStatusIcon(order.status)}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Chip>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-sm text-foreground/70">Order Date</p>
            <p className="text-sm font-semibold text-foreground">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-foreground/70">Items</p>
            <p className="text-sm font-semibold text-foreground">{order.items?.length ?? 0}</p>
          </div>
          <div>
            <p className="text-sm text-foreground/70">Total</p>
            <p className="text-lg font-bold text-kpa-600">{formatPrice(order.total)}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-default-200 p-5">
        <p className="mb-4 text-sm font-semibold text-foreground">Items</p>
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
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-foreground/70">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">{formatPrice(item.price * item.quantity)}</p>
              </div>
            )
          })}
          </div>
        </div>
        {order.shippingAddress && Object.keys(order.shippingAddress).length > 0 && (
        <div className="border-t border-default-200 p-5">
          <p className="mb-3 text-sm font-semibold text-foreground">Shipping Address</p>
          <div className="space-y-1 text-sm text-foreground/70">
            {order.shippingAddress.street && <p>{order.shippingAddress.street}</p>}
            {order.shippingAddress.city && <p>{order.shippingAddress.city}</p>}
            {order.shippingAddress.state && <p>{order.shippingAddress.state}</p>}
            {order.shippingAddress.zip && <p>{order.shippingAddress.zip}</p>}
            {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
            {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
          </div>
        </div>
      )}

      {!isCompleted && (
        <div className="border-t border-default-200 bg-default-50 p-5">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => navigate(`/order/${order._id}`)}
          >
            View Details
          </Button>
        </div>
      )}
    </Card>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-kpa-600">Account</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Order History
          </h1>
          <p className="mt-3 text-sm text-foreground/70">
            Track your orders and view order details.
          </p>
        </div>

        {loading ? (
          <Card className="border border-default-200 bg-background p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-foreground">Loading your orders...</p>
          </Card>
        ) : error ? (
          <Card className="border border-default-200 bg-background p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-foreground">Unable to load orders at this time, You have to login first</p>
            <p className="mt-2 text-sm text-foreground/70">{error}</p>
            <Button
              variant="primary"
              className="mt-4"
              onPress={() => navigate('/login')}
            >
              Login Now
            </Button>
          </Card>
        ) : orders.length === 0 ? (
          <Card className="border border-default-200 bg-background p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-foreground">No orders yet</p>
            <p className="mt-2 text-sm text-foreground/70">Start shopping to place your first order.</p>
            <Button
              variant="primary"
              className="mt-4"
              onPress={() => navigate('/shop')}
            >
              Shop Now
            </Button>
          </Card>
        ) : (
          <div className="space-y-10">
            {currentOrders.length > 0 && (
              <section>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    Current Orders
                  </h2>
                  <p className="mt-1 text-sm text-foreground/70">
                    {currentOrders.length} order{currentOrders.length === 1 ? '' : 's'} in progress
                  </p>
                </div>
                <div className="space-y-4">
                  {currentOrders.map((order) => (
                    <OrderCard key={order._id} order={order} isCompleted={false} />
                  ))}
                </div>
              </section>
            )}

            {completedOrders.length > 0 && (
              <section>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    Order History
                  </h2>
                  <p className="mt-1 text-sm text-foreground/70">
                    {completedOrders.length} order{completedOrders.length === 1 ? '' : 's'} completed
                  </p>
                </div>
                <div className="space-y-4">
                  {completedOrders.map((order) => (
                    <OrderCard key={order._id} order={order} isCompleted={true} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
