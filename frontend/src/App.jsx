import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';

function AppRoutes() {
  const [cartOpen, setCartOpen] = useState(false);
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      {/* Auth Route */}
      <Route
        path="/login"
        element={
          isAdmin ? (
            <Navigate to="/admin" replace />
          ) : isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Admin Panel */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      {/* Public store */}
      <Route
        path="/*"
        element={
          isAdmin ? (
            <Navigate to="/admin" replace />
          ) : (
            <>
              <Navbar onCartOpen={() => setCartOpen(true)} />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </main>
              {cartOpen && <CartSidebar onClose={() => setCartOpen(false)} />}
              <BottomNav onCartOpen={() => setCartOpen(true)} />
            </>
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <CartProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </CartProvider>
      </AlertProvider>
    </AuthProvider>
  );
}


