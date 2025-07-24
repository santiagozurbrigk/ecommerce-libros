import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategorySelection = () => {
  const navigate = useNavigate();
  const categories = [
    {
      id: 'medicina',
      name: '📚 Libros de Medicina',
      description: 'Libros especializados para estudiantes de medicina',
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      icon: '🏥'
    },
    {
      id: 'otros',
      name: '📖 Otros Libros',
      description: 'Libros para otras carreras universitarias',
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      icon: '🎓'
    }
  ];

  const handleCategoryClick = (category) => {
    navigate(`/catalogo/${category.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-24">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-6xl font-bold text-gray-800 mb-4">
            📚 Libros universitarios
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Selecciona la categoría de libros que necesitas
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className={`w-full ${category.color} ${category.hoverColor} text-white p-10 rounded-xl shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex flex-col items-center focus:outline-none`}
            >
              <div className="text-6xl mb-4">{category.icon}</div>
              <h2 className="text-3xl font-bold mb-2">{category.name}</h2>
              <p className="text-lg mb-2 opacity-90">{category.description}</p>
            </button>
          ))}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            Más de 1300 títulos disponibles • Stock actualizado
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategorySelection;
