import React from 'react';
import { useAuth } from '../context/useAuth';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const categories = [
    {
      id: 1,
      name: '📚 Libros de Medicina',
      description: 'Libros especializados para estudiantes de medicina',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      id: 2,
      name: '📖 Otros Libros',
      description: 'Libros para otras carreras universitarias',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              📚 Ecommerce Libros
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Encuentra los mejores libros para tu carrera universitaria. 
              Medicina y otras carreras disponibles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Ver Catálogo
              </button>
              {!isAuthenticated && (
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
                  Registrarse
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Selecciona tu categoría
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`${category.color} ${category.hoverColor} text-white p-8 rounded-lg shadow-lg cursor-pointer transition transform hover:scale-105`}
            >
              <h3 className="text-2xl font-bold mb-4">{category.name}</h3>
              <p className="text-lg mb-6">{category.description}</p>
              <button className="bg-white text-blue-600 px-6 py-2 rounded font-semibold hover:bg-gray-100 transition">
                Explorar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Envío Rápido</h3>
              <p className="text-gray-600">
                Recibe tus libros en tiempo récord
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Precios Bajos</h3>
              <p className="text-gray-600">
                Los mejores precios del mercado
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Gran Catálogo</h3>
              <p className="text-gray-600">
                Más de 1300 títulos disponibles
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
