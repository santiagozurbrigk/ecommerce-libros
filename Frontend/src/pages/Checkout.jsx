import React, { useState } from 'react';
import { useCart } from '../context/useCart';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cart, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const navigate = useNavigate();

  const handleOrder = async () => {
    setLoading(true);
    setError('');
    setPaymentError('');
    if (cart.length === 0) {
      setError('El carrito está vacío.');
      setLoading(false);
      return;
    }
    if (!paymentMethod) {
      setPaymentError('Selecciona un método de pago.');
      setLoading(false);
      return;
    }
    try {
      const orderData = {
        user: user?.id,
        products: cart.map(({ product, quantity }) => ({ product: product._id, quantity })),
        total: getTotal(),
        paymentMethod,
      };
      const res = await fetch('http://localhost:5000/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) {
        const data = await res.json();
        // Mensajes personalizados según el backend
        if (data.msg?.includes('Verifica los datos')) {
          setError('No se pudo crear el pedido. Verifica los datos e intenta nuevamente.');
        } else if (data.msg) {
          setError(data.msg);
        } else {
          setError('Ocurrió un error inesperado al crear el pedido. Intenta nuevamente o contacta soporte.');
        }
        setLoading(false);
        return;
      }
      setSuccess(true);
      clearCart();
      setLoading(false);
    } catch {
      setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      setLoading(false);
    }
  };

  const getImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('/uploads/')) return `http://localhost:5000${img}`;
    return img;
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center animate-fade-in-scale">
          <div className="flex justify-center mb-4">
            <span className="inline-block bg-green-100 text-green-600 rounded-full p-4 animate-bounce-in">
              <svg xmlns='http://www.w3.org/2000/svg' className='h-10 w-10' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg>
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-green-700">¡Pedido realizado con éxito!</h1>
          <p className="mb-8 text-gray-700">Gracias por tu compra. Te avisaremos cuando tu pedido esté listo para retirar.</p>
          <button
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 text-lg font-semibold shadow transition"
            onClick={() => navigate('/')}
          >
            Volver al Catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Finalizar compra</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Resumen del pedido</h2>
        {cart.length === 0 ? (
          <p className="text-gray-500">Tu carrito está vacío.</p>
        ) : (
          <ul className="divide-y divide-gray-200 mb-4">
            {cart.map(({ product, quantity }) => (
              <li key={product._id} className="py-2 flex items-center gap-4">
                {product.image && (
                  <img src={getImageUrl(product.image)} alt={product.name} className="w-14 h-20 object-cover rounded border" />
                )}
                <div className="flex-1">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-gray-900 ml-2">x{quantity}</span>
                </div>
                <span className="font-bold">${product.price * quantity}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-between font-bold text-lg mt-4">
          <span>Total:</span>
          <span>${getTotal()}</span>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Datos del usuario</h2>
        <div className="mb-2"><span className="font-medium">Nombre:</span> {user?.nombre}</div>
        <div className="mb-2"><span className="font-medium">Email:</span> {user?.email}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Método de pago</h2>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="payment"
              value="efectivo"
              checked={paymentMethod === 'efectivo'}
              onChange={() => setPaymentMethod('efectivo')}
            />
            Efectivo al retirar
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="payment"
              value="mercadopago"
              checked={paymentMethod === 'mercadopago'}
              onChange={() => setPaymentMethod('mercadopago')}
              disabled
            />
            Mercado Pago (próximamente)
          </label>
        </div>
        {paymentError && <div className="text-red-500 mt-2">{paymentError}</div>}
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <button
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 w-full text-lg font-semibold disabled:opacity-60"
        onClick={handleOrder}
        disabled={cart.length === 0 || loading}
      >
        {loading ? 'Procesando...' : 'Confirmar pedido'}
      </button>
    </div>
  );
};

export default Checkout; 