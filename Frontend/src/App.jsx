import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import CategorySelection from './pages/CategorySelection';
import Catalog from './pages/Catalog';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Account from './pages/Account';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { CartProvider } from './context/CartContext';

function RequireAuth({ children, adminOnly = false }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (adminOnly && !user?.isAdmin) return <Navigate to="/seleccionar-categoria" replace />;
  if (!adminOnly && user?.isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

function CatalogRoute() {
  const { categoria } = useParams();
  const navigate = useNavigate();
  const selectedCategory = {
    id: categoria,
    name: categoria === 'medicina' ? 'Libros de Medicina' : 'Otros Libros',
    description: categoria === 'medicina' ? 'Libros especializados para estudiantes de medicina' : 'Libros para otras carreras universitarias',
  };
  return <Catalog selectedCategory={selectedCategory} onBackToCategories={() => navigate('/seleccionar-categoria')} />;
}

function MainApp() {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Redirección inicial según estado global
  if (!loading) {
    if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/registro') {
      return <Navigate to="/login" replace />;
    }
    if (isAuthenticated && user?.isAdmin && location.pathname !== '/admin') {
      return <Navigate to="/admin" replace />;
    }
    if (isAuthenticated && !user?.isAdmin && (location.pathname === '/admin' || location.pathname === '/')) {
      return <Navigate to="/seleccionar-categoria" replace />;
    }
    // Redirigir si usuario normal está en /login
    if (isAuthenticated && !user?.isAdmin && location.pathname === '/login') {
      return <Navigate to="/seleccionar-categoria" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar solo si no es admin y no está en login/registro */}
      {(!user?.isAdmin && !['/login', '/registro'].includes(location.pathname)) && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/seleccionar-categoria" element={
          <RequireAuth>
            <CategorySelection onCategorySelect={cat => window.location.href = `/catalogo/${cat.id}`} />
          </RequireAuth>
        } />
        <Route path="/catalogo/:categoria" element={
          <RequireAuth>
            <CatalogRoute />
          </RequireAuth>
        } />
        <Route path="/carrito" element={
          <RequireAuth>
            <Cart />
          </RequireAuth>
        } />
        <Route path="/cuenta" element={
          <RequireAuth>
            <Account />
          </RequireAuth>
        } />
        <Route path="/producto/:id" element={
          <RequireAuth>
            <ProductDetail />
          </RequireAuth>
        } />
        <Route path="/checkout" element={
          <RequireAuth>
            <Checkout />
          </RequireAuth>
        } />
        <Route path="/admin" element={
          <RequireAuth adminOnly={true}>
            <AdminPanel />
          </RequireAuth>
        } />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

export default App;
