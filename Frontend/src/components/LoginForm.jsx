import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { Link } from 'react-router-dom';

const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

const LoginForm = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const validate = (field, value) => {
    let msg = '';
    switch (field) {
      case 'email':
        if (!value.trim()) msg = 'El email es obligatorio.';
        else if (!validateEmail(value)) msg = 'Email inválido.';
        break;
      case 'password':
        if (!value) msg = 'La contraseña es obligatoria.';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [field]: msg }));
    return msg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    validate(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let hasError = false;
    Object.entries(form).forEach(([field, value]) => {
      if (validate(field, value)) hasError = true;
    });
    if (hasError) return;
    setLoading(true);
    setMensaje('');
    try {
      const res = await fetch('http://localhost:5000/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje('¡Login exitoso!');
        login(data.token);
      } else {
        // Mensajes personalizados según el backend
        if (data.msg?.includes('incorrectos')) {
          setMensaje('El email o la contraseña no son correctos. ¿Olvidaste tu contraseña?');
        } else if (data.msg) {
          setMensaje(data.msg);
        } else {
          setMensaje('Ocurrió un error inesperado. Intenta nuevamente o contacta soporte.');
        }
      }
    } catch {
      setMensaje('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 py-12 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Iniciar Sesión</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className={`w-full mb-1 p-3 border ${errors.email ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg`}
          required
        />
        {errors.email && <div className="text-red-500 text-sm mb-2">{errors.email}</div>}
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className={`w-full mb-1 p-3 border ${errors.password ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg`}
          required
        />
        {errors.password && <div className="text-red-500 text-sm mb-2">{errors.password}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 text-lg font-semibold transition mt-2"
          disabled={loading}
        >
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
        {mensaje && <p className="mt-4 text-center text-red-600">{mensaje}</p>}
        <div className="mt-6 text-center text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-blue-600 hover:underline font-semibold">Regístrate aquí</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
