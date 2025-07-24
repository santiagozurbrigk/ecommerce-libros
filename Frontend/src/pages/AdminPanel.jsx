import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts';
import { FaEdit, FaTrash, FaEye, FaUser } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api/productos';

const AdminPanel = () => {
  const [section, setSection] = useState('dashboard');
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    pages: '',
    image: '', // URL o ruta
    category: 'medicina',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);

  // --- PEDIDOS ---
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOrder, setModalOrder] = useState(null);
  const [modalStatus, setModalStatus] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Estadísticas
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');

  // Dashboard: ventas por mes y top productos
  const [salesByMonth, setSalesByMonth] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // --- USUARIOS ---
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [userOrdersLoading, setUserOrdersLoading] = useState(false);

  // Cargar productos reales al montar
  useEffect(() => {
    if (section === 'productos') {
      fetchProducts();
    }
  }, [section]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch {
      setError('Error al cargar productos');
    }
    setLoading(false);
  };

  // Manejo de formulario de productos
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setImageFile(file);
      if (file) {
        setImagePreview(URL.createObjectURL(file));
      } else {
        setImagePreview('');
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Editar producto: cargar datos en el formulario
  const handleEdit = (prod) => {
    setForm({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      pages: prod.pages,
      image: prod.image || '',
      category: prod.category,
    });
    setImageFile(null);
    setImagePreview(prod.image || '');
    setEditId(prod._id);
  };

  // Guardar cambios o crear producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('pages', form.pages);
      formData.append('category', form.category);
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (form.image && typeof form.image === 'string' && !form.image.startsWith('blob:')) {
        formData.append('image', form.image);
      }
      let res;
      if (editId) {
        res = await fetch(`${API_URL}/${editId}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        res = await fetch(API_URL, {
          method: 'POST',
          body: formData,
        });
      }
      if (!res.ok) throw new Error(editId ? 'Error al editar producto' : 'Error al crear producto');
      setForm({ name: '', description: '', price: '', pages: '', image: '', category: 'medicina' });
      setImageFile(null);
      setImagePreview('');
      setEditId(null);
      fetchProducts();
    } catch {
      setError(editId ? 'Error al editar producto' : 'Error al crear producto');
    }
    setLoading(false);
  };

  // Eliminar producto
  const handleDelete = async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar producto');
      fetchProducts();
    } catch {
      setError('Error al eliminar producto');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (section === 'pedidos') {
      fetchOrders();
    }
  }, [section]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const res = await fetch('http://localhost:5000/api/pedidos');
      const data = await res.json();
      setOrders(data);
    } catch {
      setOrdersError('Error al cargar pedidos');
    }
    setOrdersLoading(false);
  };

  const openOrderModal = (order) => {
    setModalOrder(order);
    setModalStatus(order.status);
    setModalError('');
  };
  const closeOrderModal = () => {
    setModalOrder(null);
    setModalStatus('');
    setModalError('');
  };
  const handleModalStatusChange = (e) => {
    setModalStatus(e.target.value);
  };
  const saveModalStatus = async () => {
    setModalLoading(true);
    setModalError('');
    try {
      const res = await fetch(`http://localhost:5000/api/pedidos/${modalOrder._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: modalStatus }),
      });
      if (!res.ok) throw new Error('Error al actualizar estado');
      fetchOrders();
      closeOrderModal();
    } catch {
      setModalError('Error al actualizar estado');
    }
    setModalLoading(false);
  };

  useEffect(() => {
    if (section === 'dashboard') {
      fetchStats();
      fetchSalesByMonth();
      fetchTopProducts();
    }
    // eslint-disable-next-line
  }, [section]);

  const fetchStats = async () => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const res = await fetch('http://localhost:5000/api/pedidos/estadisticas');
      const data = await res.json();
      setStats(data);
    } catch {
      setStatsError('Error al cargar estadísticas');
    }
    setStatsLoading(false);
  };

  const fetchSalesByMonth = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/pedidos/dashboard/ventas-mes');
      const data = await res.json();
      setSalesByMonth(data);
    } catch { /* no-op */ }
  };
  const fetchTopProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/pedidos/dashboard/top-productos');
      const data = await res.json();
      setTopProducts(data);
    } catch { /* no-op */ }
  };

  useEffect(() => {
    if (section === 'usuarios') {
      fetchUsers();
    }
    // eslint-disable-next-line
  }, [section, userSearch]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const res = await fetch(`http://localhost:5000/api/usuarios?search=${encodeURIComponent(userSearch)}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsersError('Error al cargar usuarios');
    }
    setUsersLoading(false);
  };

  const handleShowUserOrders = async (user) => {
    setSelectedUser(user);
    setUserOrdersLoading(true);
    setUserOrders([]);
    try {
      const res = await fetch(`http://localhost:5000/api/pedidos?userId=${user._id}`);
      const data = await res.json();
      setUserOrders(Array.isArray(data) ? data : []);
    } catch {
      setUserOrders([]);
    }
    setUserOrdersLoading(false);
  };

  const handleCloseUserOrders = () => {
    setSelectedUser(null);
    setUserOrders([]);
  };

  const getImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('/uploads/')) return `http://localhost:5000${img}`;
    return img;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col py-8 px-4 min-h-screen">
        <h2 className="text-2xl font-bold mb-8 text-center">Administracion Libros</h2>
        <nav className="flex flex-col gap-2">
          <button onClick={() => setSection('dashboard')} className={`text-left px-4 py-2 rounded transition ${section === 'dashboard' ? 'bg-blue-600 font-semibold' : 'hover:bg-blue-700'}`}>Dashboard</button>
          <button onClick={() => setSection('productos')} className={`text-left px-4 py-2 rounded transition ${section === 'productos' ? 'bg-blue-600 font-semibold' : 'hover:bg-blue-700'}`}>Productos</button>
          <button onClick={() => setSection('pedidos')} className={`text-left px-4 py-2 rounded transition ${section === 'pedidos' ? 'bg-blue-600 font-semibold' : 'hover:bg-blue-700'}`}>Pedidos</button>
          <button onClick={() => setSection('usuarios')} className={`text-left px-4 py-2 rounded transition ${section === 'usuarios' ? 'bg-blue-600 font-semibold' : 'hover:bg-blue-700'}`}>Usuarios</button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {section === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-4">Ventas por mes (últimos 12 meses)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={salesByMonth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={v => `$${v.toLocaleString('es-AR')}`} />
                    <Legend />
                    <Bar dataKey="total" fill="#2563eb" name="Ventas" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-4">Productos más vendidos</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topProducts} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={12} />
                    <YAxis dataKey="name" type="category" fontSize={12} width={120} />
                    <Tooltip formatter={v => `${v} ventas`} />
                    <Legend />
                    <Bar dataKey="count" fill="#22c55e" name="Ventas" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-xs text-gray-500 mb-1">Facturación total</div>
                <div className="text-2xl font-bold text-green-700">{stats?.totalFacturacion?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '-'}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-xs text-gray-500 mb-1">Facturación diaria</div>
                <div className="text-xl font-bold text-green-700">{stats?.diaria?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '-'}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-xs text-gray-500 mb-1">Facturación semanal</div>
                <div className="text-xl font-bold text-green-700">{stats?.semanal?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '-'}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-xs text-gray-500 mb-1">Facturación mensual</div>
                <div className="text-xl font-bold text-green-700">{stats?.mensual?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '-'}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-xs text-gray-500 mb-1">Total de pedidos</div>
                <div className="text-2xl font-bold">{stats?.pedidosTotales ?? '-'}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-xs font-semibold">Pendientes: {stats?.pedidosPorEstado?.pendiente ?? 0}</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs font-semibold">En proceso: {stats?.pedidosPorEstado?.['en proceso'] ?? 0}</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-xs font-semibold">Listos: {stats?.pedidosPorEstado?.['listo para retirar'] ?? 0}</span>
                  <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-xs font-semibold">Entregados: {stats?.pedidosPorEstado?.entregado ?? 0}</span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-xs text-gray-500 mb-1">Pedidos más recientes</div>
                <ul className="divide-y divide-gray-200">
                  {stats?.recientes?.map(order => (
                    <li key={order._id} className="py-2 flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="font-mono text-xs">#{order._id.slice(-4)}</span>
                      <span className="flex-1">{order.user?.nombre || '-'} ({order.user?.email || '-'})</span>
                      <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      <span
                        className={
                          'ml-2 px-2 py-1 rounded text-xs font-semibold ' +
                          (order.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800 ' : '') +
                          (order.status === 'en proceso' ? 'bg-blue-100 text-blue-800 ' : '') +
                          (order.status === 'listo para retirar' ? 'bg-green-100 text-green-800 ' : '') +
                          (order.status === 'entregado' ? 'bg-gray-200 text-gray-800 ' : '')
                        }
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="text-green-600 font-bold">{order.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span>
                    </li>
                  )) || <li className="text-gray-500">No hay pedidos recientes.</li>}
                </ul>
              </div>
            </div>
            {statsLoading && <p className="text-gray-500">Cargando estadísticas...</p>}
            {statsError && <p className="text-red-600">{statsError}</p>}
          </div>
        )}

        {section === 'productos' && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Gestión de Productos</h1>
            {/* Formulario para crear producto */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8 mb-10 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">{editId ? 'Editar producto' : 'Crear nuevo producto'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-1 font-medium">Nombre</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-lg" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Precio</label>
                  <input type="number" name="price" value={form.price} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-lg" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Cantidad de páginas</label>
                  <input type="number" name="pages" value={form.pages} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-lg" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Categoría</label>
                  <select name="category" value={form.category} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-lg">
                    <option value="medicina">Medicina</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 font-medium">Descripción</label>
                  <textarea name="description" value={form.description} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-lg" rows={3} />
                </div>
                <div className="md:col-span-2 flex flex-col items-start">
                  <label className="block mb-1 font-medium">Imagen</label>
                  <input type="file" name="image" accept="image/*" onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
                  <div className="flex gap-4 mt-2">
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="w-28 h-28 object-contain rounded border bg-white" />
                    )}
                    {!imagePreview && form.image && (
                      <img src={getImageUrl(form.image)} alt="Preview" className="w-28 h-28 object-contain rounded border bg-white" />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-lg font-semibold" disabled={loading}>
                  {loading ? (editId ? 'Guardando...' : 'Creando...') : (editId ? 'Guardar cambios' : 'Crear producto')}
                </button>
                {editId && (
                  <button type="button" onClick={() => { setEditId(null); setForm({ name: '', description: '', price: '', pages: '', image: '', category: 'medicina' }); }} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition text-lg font-semibold">
                    Cancelar edición
                  </button>
                )}
              </div>
              {error && <p className="mt-4 text-red-600">{error}</p>}
            </form>

            {/* Listado de productos */}
            <div className="bg-white rounded-xl shadow p-8">
              <h2 className="text-xl font-semibold mb-4">Productos cargados</h2>
              {loading ? (
                <p className="text-gray-500">Cargando productos...</p>
              ) : products.length === 0 ? (
                <p className="text-gray-500">No hay productos cargados aún.</p>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                      <th className="px-4 py-2 text-left">Imagen</th>
                      <th className="px-4 py-2 text-left">Nombre</th>
                      <th className="px-4 py-2 text-left">Descripción</th>
                      <th className="px-4 py-2 text-left">Páginas</th>
                      <th className="px-4 py-2 text-left">Categoría</th>
                      <th className="px-4 py-2 text-left">Precio</th>
                      <th className="px-4 py-2 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => (
                      <tr key={prod._id || prod.id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-4 py-2">
                          {prod.image && <img src={getImageUrl(prod.image)} alt={prod.name} className="w-16 h-16 object-contain rounded border bg-white" />}
                        </td>
                        <td className="px-4 py-2 font-bold text-base">{prod.name}</td>
                        <td className="px-4 py-2 text-gray-600">{prod.description}</td>
                        <td className="px-4 py-2">{prod.pages}</td>
                        <td className="px-4 py-2 capitalize">{prod.category}</td>
                        <td className="px-4 py-2 text-green-700 font-bold">${prod.price}</td>
                        <td className="px-4 py-2 flex gap-2">
                          <button
                            onClick={() => handleEdit(prod)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
                          >
                            <FaEdit /> Editar
                          </button>
                          <button
                            onClick={() => handleDelete(prod._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
                          >
                            <FaTrash /> Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {section === 'pedidos' && (
          <div>
            <h1 className="text-3xl font-bold mb-2">Pedidos</h1>
            <p className="mb-4 text-gray-600">Lista de todos los pedidos activos</p>
            <div className="bg-white rounded-xl shadow p-8">
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
                <input
                  type="text"
                  placeholder="Buscar por #ID, nombre o email del cliente..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full sm:w-96 border rounded px-3 py-2"
                />
              </div>
              {ordersLoading ? (
                <p className="text-gray-500">Cargando pedidos...</p>
              ) : ordersError ? (
                <p className="text-red-600">{ordersError}</p>
              ) : orders.length === 0 ? (
                <p className="text-gray-500">No hay pedidos cargados aún.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">Cliente</th>
                        <th className="px-4 py-2 text-left">Fecha creación</th>
                        <th className="px-4 py-2 text-left">Estado</th>
                        <th className="px-4 py-2 text-left">Acciones</th>
                        <th className="px-4 py-2 text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .filter(order =>
                          order._id.toLowerCase().includes(search.toLowerCase()) ||
                          (order.user?.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
                          (order.user?.email || '').toLowerCase().includes(search.toLowerCase())
                        )
                        .map(order => (
                          <tr key={order._id} className="border-b hover:bg-gray-50 transition">
                            <td className="px-4 py-2 font-mono">#{order._id.slice(-4)}</td>
                            <td className="px-4 py-2">{order.user?.nombre || '-'}</td>
                            <td className="px-4 py-2">{new Date(order.createdAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                            <td className="px-4 py-2">
                              <span
                                className={
                                  'px-2 py-1 rounded text-xs font-semibold ' +
                                  (order.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800 ' : '') +
                                  (order.status === 'en proceso' ? 'bg-blue-100 text-blue-800 ' : '') +
                                  (order.status === 'listo para retirar' ? 'bg-green-100 text-green-800 ' : '') +
                                  (order.status === 'entregado' ? 'bg-gray-200 text-gray-800 ' : '')
                                }
                              >
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-2 flex gap-2">
                              <button
                                onClick={() => openOrderModal(order)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1 text-xs"
                              >
                                <FaEye /> Ver detalles
                              </button>
                              <button
                                onClick={() => handleDelete(order._id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1 text-xs"
                              >
                                <FaTrash /> Eliminar
                              </button>
                            </td>
                            <td className="px-4 py-2 text-green-700 font-bold">${order.total}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {/* Modal de detalles de pedido */}
            {modalOrder && (
              <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
                  <button onClick={closeOrderModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl">&times;</button>
                  <h2 className="text-2xl font-bold mb-4">Detalles del pedido</h2>
                  <div className="mb-2"><b>ID:</b> #{modalOrder._id.slice(-4)}</div>
                  <div className="mb-2"><b>Cliente:</b> {modalOrder.user?.nombre || '-'}</div>
                  <div className="mb-2"><b>Email:</b> {modalOrder.user?.email || '-'}</div>
                  <div className="mb-2"><b>Fecha:</b> {new Date(modalOrder.createdAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</div>
                  <div className="mb-2"><b>Productos:</b>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      {modalOrder.products.map((p, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg shadow p-3 flex gap-3 items-center">
                          {p.product?.image && (
                            <img src={getImageUrl(p.product.image)} alt={p.product.name} className="w-16 h-20 object-cover rounded border" />
                          )}
                          <div className="flex-1">
                            <div className="font-bold text-sm mb-1">{p.product?.name || '-'}</div>
                            <div className="text-xs text-gray-600 mb-1">Cantidad: <b>{p.quantity}</b></div>
                            <div className="text-xs text-gray-500">Precio unitario: {p.product?.price?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</div>
                            <div className="text-xs text-green-700 font-semibold">Subtotal: {(p.product?.price * p.quantity).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-2"><b>Total:</b> {modalOrder.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</div>
                  <div className="mb-4">
                    <b>Estado:</b>
                    <select
                      value={modalStatus}
                      onChange={handleModalStatusChange}
                      className="border rounded px-2 py-1 ml-2"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en proceso">En proceso</option>
                      <option value="listo para retirar">Listo para retirar</option>
                      <option value="entregado">Entregado</option>
                    </select>
                  </div>
                  {modalError && <p className="text-red-600 mb-2">{modalError}</p>}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={saveModalStatus}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                      disabled={modalLoading}
                    >
                      {modalLoading ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <button
                      onClick={closeOrderModal}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {section === 'usuarios' && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Gestión de Usuarios</h1>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                type="text"
                placeholder="Buscar por nombre, email, carrera o teléfono..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full sm:w-96 border rounded px-3 py-2"
              />
            </div>
            {usersLoading ? (
              <p className="text-gray-500">Cargando usuarios...</p>
            ) : usersError ? (
              <p className="text-red-600">{usersError}</p>
            ) : users.length === 0 ? (
              <p className="text-gray-500">No se encontraron usuarios.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                      <th className="px-4 py-2 text-left">Usuario</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Teléfono</th>
                      <th className="px-4 py-2 text-left">Carrera</th>
                      <th className="px-4 py-2 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-4 py-2 flex items-center gap-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-lg">
                            {user.nombre ? user.nombre[0].toUpperCase() : <FaUser />}
                          </span>
                          <span className="font-semibold">{user.nombre}</span>
                        </td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">{user.telefono || '-'}</td>
                        <td className="px-4 py-2">{user.carrera || '-'}</td>
                        <td className="px-4 py-2">
                          <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1 text-xs"
                            onClick={() => handleShowUserOrders(user)}
                          >
                            <FaEye /> Ver pedidos
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Modal de pedidos del usuario */}
            {selectedUser && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full relative">
                  <button onClick={handleCloseUserOrders} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl">&times;</button>
                  <h2 className="text-2xl font-bold mb-4">Pedidos de {selectedUser.nombre}</h2>
                  {userOrdersLoading ? (
                    <p className="text-gray-500">Cargando pedidos...</p>
                  ) : userOrders.length === 0 ? (
                    <p className="text-gray-500">Este usuario no tiene pedidos.</p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {userOrders.map(order => (
                        <li key={order._id} className="py-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-mono text-xs">#{order._id.slice(-4)}</span>
                              <span className="ml-2 text-gray-700">{new Date(order.createdAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                              <span
                                className={
                                  'ml-2 px-2 py-1 rounded text-xs font-semibold ' +
                                  (order.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800 ' : '') +
                                  (order.status === 'en proceso' ? 'bg-blue-100 text-blue-800 ' : '') +
                                  (order.status === 'listo para retirar' ? 'bg-green-100 text-green-800 ' : '') +
                                  (order.status === 'entregado' ? 'bg-gray-200 text-gray-800 ' : '')
                                }
                              >
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                            <div className="text-green-600 font-bold">${order.total}</div>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            {order.products.map(p => `${p.product?.name || '-'} x${p.quantity}`).join(', ')}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de detalles de pedido */}
      {modalOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
            <button onClick={closeOrderModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            <h2 className="text-2xl font-bold mb-4">Detalles del pedido</h2>
            <div className="mb-2"><b>ID:</b> #{modalOrder._id.slice(-4)}</div>
            <div className="mb-2"><b>Cliente:</b> {modalOrder.user?.nombre || '-'}</div>
            <div className="mb-2"><b>Email:</b> {modalOrder.user?.email || '-'}</div>
            <div className="mb-2"><b>Fecha:</b> {new Date(modalOrder.createdAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</div>
            <div className="mb-2"><b>Productos:</b>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {modalOrder.products.map((p, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg shadow p-3 flex gap-3 items-center">
                    {p.product?.image && (
                      <img src={p.product.image} alt={p.product.name} className="w-16 h-20 object-cover rounded border" />
                    )}
                    <div className="flex-1">
                      <div className="font-bold text-sm mb-1">{p.product?.name || '-'}</div>
                      <div className="text-xs text-gray-600 mb-1">Cantidad: <b>{p.quantity}</b></div>
                      <div className="text-xs text-gray-500">Precio unitario: {p.product?.price?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</div>
                      <div className="text-xs text-green-700 font-semibold">Subtotal: {(p.product?.price * p.quantity).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-2"><b>Total:</b> {modalOrder.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</div>
            <div className="mb-4">
              <b>Estado:</b>
              <select
                value={modalStatus}
                onChange={handleModalStatusChange}
                className="border rounded px-2 py-1 ml-2"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en proceso">En proceso</option>
                <option value="listo para retirar">Listo para retirar</option>
                <option value="entregado">Entregado</option>
              </select>
            </div>
            {modalError && <p className="text-red-600 mb-2">{modalError}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={saveModalStatus}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                disabled={modalLoading}
              >
                {modalLoading ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button
                onClick={closeOrderModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
