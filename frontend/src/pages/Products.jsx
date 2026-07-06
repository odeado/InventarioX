import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({ name: '', sku: '', price: '', stock: '', category: '', description: '' });

  const fetchProducts = async () => {
    const { data } = await api.get('/products');
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Limpiar precio de puntos, comas, símbolos y parsear a entero
    const cleanPriceStr = String(formData.price).replace(/[^0-9]/g, '');
    const priceVal = parseInt(cleanPriceStr, 10) || 0;

    const payload = { 
      ...formData, 
      price: priceVal, 
      stock: parseInt(formData.stock || 0),
      sku: formData.sku.trim() || null
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', sku: '', price: '', stock: '', category: '', description: '' });
      fetchProducts();
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.error || 'Error al guardar el producto. Verifica que el SKU no esté duplicado.');
    }
  };

  const handleEdit = (prod) => {
    setErrorMsg('');
    setFormData({
      name: prod.name || '',
      sku: prod.sku || '',
      price: prod.price || '',
      stock: prod.stock || '',
      category: prod.category || '',
      description: prod.description || ''
    });
    setEditingId(prod.id);
    setShowModal(true);
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Buscar productos (nombre, SKU)..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData({ name: '', sku: '', price: '', stock: '', category: '', description: '' }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-sm font-medium"
        >
          <Plus className="h-5 w-5" /> Nuevo Producto
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-medium">Producto</th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium">Precio</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(prod => (
                <tr key={prod.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white">{prod.name}</div>
                    <div className="text-xs">{prod.category || 'Sin categoría'}</div>
                  </td>
                  <td className="px-6 py-4">{prod.sku || '-'}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">${prod.price.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${prod.stock > 10 ? 'bg-green-100 text-green-700' : prod.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {prod.stock} un.
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(prod)} className="p-2 text-gray-400 hover:text-primary-600 transition bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary-200"><Edit2 className="w-4 h-4" /></button>
                      <button 
                        onClick={async () => { await api.delete(`/products/${prod.id}`); fetchProducts(); }}
                        className="p-2 text-gray-400 hover:text-red-600 transition bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-red-200"
                      ><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No se encontraron productos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editingId ? 'Editar Producto' : 'Añadir Producto'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs rounded-xl font-medium">
                  {errorMsg}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de Producto *</label>
                <input required type="text" className="w-full border p-2 rounded-lg bg-transparent" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">SKU</label>
                  <input type="text" className="w-full border p-2 rounded-lg bg-transparent" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría</label>
                  <input type="text" className="w-full border p-2 rounded-lg bg-transparent" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Precio * (Pesos)</label>
                  <input required type="text" placeholder="Ej. 10.000" className="w-full border p-2 rounded-lg bg-transparent" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input type="number" className="w-full border p-2 rounded-lg bg-transparent" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition shadow-sm font-medium">Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
