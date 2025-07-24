import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/useCart';

const API_URL = 'http://localhost:5000/api/productos';

const PAGE_SIZE = 8;

const Catalog = ({ selectedCategory, onBackToCategories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const { addToCart } = useCart();
  const topRef = useRef(null);

  useEffect(() => {
    setPage(1); // Reset page on category change
  }, [selectedCategory]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [selectedCategory, page, filterBy, searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page,
        limit: PAGE_SIZE,
        category: selectedCategory.id,
      });
      const res = await fetch(`${API_URL}?${params.toString()}`);
      const data = await res.json();
      let filtered = data.products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      // Filtros adicionales
      if (filterBy === 'price-low') {
        filtered = filtered.sort((a, b) => a.price - b.price);
      } else if (filterBy === 'price-high') {
        filtered = filtered.sort((a, b) => b.price - a.price);
      } else if (filterBy === 'pages-low') {
        filtered = filtered.sort((a, b) => a.pages - b.pages);
      } else if (filterBy === 'pages-high') {
        filtered = filtered.sort((a, b) => b.pages - a.pages);
      }
      setProducts(filtered);
      setTotal(data.total);
    } catch {
      setError('Error al cargar productos');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setToast('Producto agregado al carrito');
    setTimeout(() => setToast(''), 2000);
  };

  const getImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('/uploads/')) return `http://localhost:5000${img}`;
    return img;
  };

  return (
    <div className="min-h-screen bg-gray-50" ref={topRef}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToCategories}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Volver a categorías
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedCategory.name}
                </h1>
                <p className="text-gray-600">{selectedCategory.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Sidebar + Products */}
      <div className="w-full flex flex-col md:flex-row gap-0 md:gap-8 max-w-7xl mx-auto px-0 sm:px-0 lg:px-0 py-8">
        {/* Sidebar Filtros */}
        <aside className="min-w-[180px] flex-shrink-0 md:mr-0 md:ml-0 md:pl-0 md:pr-0 mb-8 md:mb-0">
          <div className="bg-gray-100 rounded-lg border p-3 md:p-2">
            <h2 className="text-base font-semibold mb-3 text-gray-700">Filtros</h2>
            <ul className="space-y-1">
              <li>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input
                    type="radio"
                    name="filterBy"
                    value="all"
                    checked={filterBy === 'all'}
                    onChange={() => setFilterBy('all')}
                  />
                  Todos los libros
                </label>
              </li>
              <li>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input
                    type="radio"
                    name="filterBy"
                    value="price-low"
                    checked={filterBy === 'price-low'}
                    onChange={() => setFilterBy('price-low')}
                  />
                  Precio: Menor a Mayor
                </label>
              </li>
              <li>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input
                    type="radio"
                    name="filterBy"
                    value="price-high"
                    checked={filterBy === 'price-high'}
                    onChange={() => setFilterBy('price-high')}
                  />
                  Precio: Mayor a Menor
                </label>
              </li>
              <li>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input
                    type="radio"
                    name="filterBy"
                    value="pages-low"
                    checked={filterBy === 'pages-low'}
                    onChange={() => setFilterBy('pages-low')}
                  />
                  Páginas: Menor a Mayor
                </label>
              </li>
              <li>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input
                    type="radio"
                    name="filterBy"
                    value="pages-high"
                    checked={filterBy === 'pages-high'}
                    onChange={() => setFilterBy('pages-high')}
                  />
                  Páginas: Mayor a Menor
                </label>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Products Section */}
        <main className="flex-1">
          {/* Search bar centrada */}
          <div className="flex justify-center w-full mb-6">
            <input
              type="text"
              placeholder="Buscar libros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-lg w-full px-6 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg shadow-sm"
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Cargando productos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No se encontraron productos</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="p-4">
                      {product.image && (
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="w-full h-40 sm:h-48 object-contain rounded-lg mb-4 bg-white"
                        />
                      )}
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-500 text-sm">{product.pages} páginas</span>
                        <span className="text-green-600 font-bold text-lg">{formatPrice(product.price)}</span>
                      </div>
                      <button
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                        onClick={() => handleAddToCart(product)}
                      >
                        Agregar al Carrito
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Paginación */}
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    className={`px-3 py-1 rounded border ${num === page ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => setPage(num)}
                  >
                    {num}
                  </button>
                ))}
                <button
                  className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </main>
      </div>
      {/* Toast de feedback */}
      {toast && (
        <div className="fixed top-6 right-6 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
};

export default Catalog;
