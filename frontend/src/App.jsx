import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import AdminNavbar from './components/AdminNavbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import OrdersPage from './pages/OrdersPage'
import AdminPage from './pages/AdminPage'
import CRMLoyaltyPage from './pages/CRMLoyaltyPage'
import CRMPersonalizationPage from './pages/CRMPersonalizationPage'
import SCMDemandPage from './pages/SCMDemandPage'
import UniquenessPage from './pages/UniquenessPage'
import BuildKitPage from './pages/BuildKitPage'
import SubscriptionPage from './pages/SubscriptionPage'

const ProtectedRoute = ({ children }) => {
  const { user, isAdmin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (isAdmin) return <Navigate to="/admin" replace />
  return children
}

const UserRoute = ({ children }) => {
  const { isAdmin } = useAuth()
  if (isAdmin) return <Navigate to="/admin" replace />
  return children
}

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {isAdminRoute ? <AdminNavbar /> : <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<UserRoute><HomePage /></UserRoute>} />
          <Route path="/products" element={<UserRoute><ProductsPage /></UserRoute>} />
          <Route path="/products/:id" element={<UserRoute><ProductDetailPage /></UserRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cart" element={<UserRoute><CartPage /></UserRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPage activeTab="dashboard" /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminPage activeTab="products" /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminPage activeTab="orders" /></AdminRoute>} />
          <Route path="/admin/crm" element={<AdminRoute><AdminPage activeTab="crm" /></AdminRoute>} />
          <Route path="/loyalty" element={<UserRoute><CRMLoyaltyPage /></UserRoute>} />
          <Route path="/safety-profile" element={<UserRoute><CRMPersonalizationPage /></UserRoute>} />
          <Route path="/scm-dashboard" element={<UserRoute><SCMDemandPage /></UserRoute>} />
          <Route path="/why-us" element={<UserRoute><UniquenessPage /></UserRoute>} />
          <Route path="/build-kit" element={<UserRoute><BuildKitPage /></UserRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

