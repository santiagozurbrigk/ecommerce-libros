import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold flex items-center gap-2">
              <span role="img" aria-label="logo">📚</span> Impresiones Low Cost
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition">
                Inicio
              </Link>
              <Link to="/catalogo/medicina" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition">
                Catálogo
              </Link>
              <Link to="/carrito" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition">
                Carrito
              </Link>
              {isAuthenticated && (
                <Link to="/cuenta" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition">
                  Mi Cuenta
                </Link>
              )}
              {isAuthenticated && user?.isAdmin && (
                <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-medium bg-yellow-600 hover:bg-yellow-700 transition">
                  Panel Admin
                </Link>
              )}
            </div>
          </div>

          {/* User Menu Desktop */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">Hola, {user?.nombre || 'Usuario'}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm hover:text-blue-200 transition">
                  Iniciar Sesión
                </Link>
                <Link to="/registro" className="bg-white text-blue-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition">
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-700">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600 transition" onClick={() => setIsMenuOpen(false)}>
              Inicio
            </Link>
            <Link to="/catalogo/medicina" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600 transition" onClick={() => setIsMenuOpen(false)}>
              Catálogo
            </Link>
            <Link to="/carrito" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600 transition" onClick={() => setIsMenuOpen(false)}>
              Carrito
            </Link>
            {isAuthenticated && (
              <Link to="/cuenta" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600 transition" onClick={() => setIsMenuOpen(false)}>
                Mi Cuenta
              </Link>
            )}
            {isAuthenticated && user?.isAdmin && (
              <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium bg-yellow-600 hover:bg-yellow-700 transition" onClick={() => setIsMenuOpen(false)}>
                Panel Admin
              </Link>
            )}
            {isAuthenticated ? (
              <div className="pt-4 pb-3 border-t border-blue-600">
                <div className="px-3 py-2 text-sm text-blue-200">
                  Hola, {user?.nombre || 'Usuario'}
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-red-600 hover:bg-red-700 transition"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-blue-600">
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600 transition" onClick={() => setIsMenuOpen(false)}>
                  Iniciar Sesión
                </Link>
                <Link to="/registro" className="block px-3 py-2 rounded-md text-base font-medium bg-white text-blue-600 hover:bg-gray-100 transition" onClick={() => setIsMenuOpen(false)}>
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
