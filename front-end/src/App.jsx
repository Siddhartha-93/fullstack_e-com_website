import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'
import ShopPage from './pages/ShopPage.jsx'
import ProductDetailsPage from './pages/ProductDetailsPage.jsx'
import CartPage from './pages/CartPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import OrderPage from './pages/OrderPage.jsx'
import OrderDetailsPage from './pages/OrderDetailsPage.jsx'
import OrderSuccessPage from './pages/OrderSuccessPage.jsx'
import PaymentFailurePage from './pages/PaymentFailurePage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import AdminLogPage from './pages/AdminLogPage.jsx'

function ScrollToTop({ children }) {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [pathname])

  return children
}

export default function App() {
  return (
    <ScrollToTop>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/order/:id" element={<OrderDetailsPage />} />
        <Route path="/order-success/:id" element={<OrderSuccessPage />} />
        <Route path="/order-failure/:id" element={<PaymentFailurePage />} />
        <Route path="/offers" element={<PlaceholderPage title="Offers" />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/login" element={<AdminLogPage />} />
        <Route path="/admin/signup" element={<AdminLogPage />} />
        <Route path="/forgot-password" element={<PlaceholderPage title="Forgot Password" />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
      </Routes>
    </ScrollToTop>
  )
}
