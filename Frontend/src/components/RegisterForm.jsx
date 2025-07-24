import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
const validatePhone = (phone) => phone === '' || /^\d{7,15}$/.test(phone);

const RegisterForm = () => {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    carrera: '',
    telefono: '',
  });
  const [errors, setErrors] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = (field, value) => {
    let msg = '';
    switch (field) {
      case 'nombre':
        if (!value.trim()) msg = 'El nombre es obligatorio.';
        else if (value.trim().length < 3) msg = 'Debe tener al menos 3 caracteres.';
        break;
      case 'email':
        if (!value.trim()) msg = 'El email es obligatorio.';
        else if (!validateEmail(value)) msg = 'Email inválido.';
        break;
      case 'password':
        if (!value) msg = 'La contraseña es obligatoria.';
        else if (value.length < 6) msg = 'Debe tener al menos 6 caracteres.';
        break;
      case 'telefono':
        if (!validatePhone(value)) msg = 'Solo números, entre 7 y 15 dígitos.';
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
      const res = await fetch('http://localhost:5000/api/usuarios/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje('¡Registro exitoso! Redirigiendo al login...');
        setForm({ nombre: '', email: '', password: '', carrera: '', telefono: '' });
        setTimeout(() => navigate('/login'), 1500);
      } else {
        // Mensajes personalizados según el backend
        if (data.msg?.includes('email')) {
          setMensaje('Ya existe una cuenta registrada con ese email. ¿Ya tienes cuenta? Inicia sesión.');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-200 py-12 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-green-700">Registro de Usuario</h2>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={form.nombre}
          onChange={handleChange}
          className={`w-full mb-1 p-3 border ${errors.nombre ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent text-lg`}
          required
        />
        {errors.nombre && <div className="text-red-500 text-sm mb-2">{errors.nombre}</div>}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className={`w-full mb-1 p-3 border ${errors.email ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent text-lg`}
          required
        />
        {errors.email && <div className="text-red-500 text-sm mb-2">{errors.email}</div>}
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className={`w-full mb-1 p-3 border ${errors.password ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent text-lg`}
          required
        />
        {errors.password && <div className="text-red-500 text-sm mb-2">{errors.password}</div>}
        <input
          type="text"
          name="carrera"
          placeholder="Carrera (opcional)"
          value={form.carrera}
          onChange={handleChange}
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent text-lg"
        />
        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono (opcional)"
          value={form.telefono}
          onChange={handleChange}
          className={`w-full mb-1 p-3 border ${errors.telefono ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent text-lg`}
        />
        {errors.telefono && <div className="text-red-500 text-sm mb-2">{errors.telefono}</div>}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 text-lg font-semibold transition mt-2"
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
        {mensaje && <p className="mt-4 text-center text-green-600">{mensaje}</p>}
        <div className="mt-6 text-center text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-green-600 hover:underline font-semibold">Inicia sesión aquí</Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
