import React, { useState, useEffect } from 'react';
import api from '../api';
import { Save } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    currency: 'USD',
    taxRate: 0,
    invoicePrefix: 'INV-',
    logoUrl: '',
    themeColors: '#3b82f6',
    themeBgColor: '#0f172a',
    themeTextColor: '#ffffff',
    taxId: '',
    activity: '',
    invoiceFooter: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await api.get('/settings');
      if (data) setSettings(data);
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { data } = await api.put('/settings', {
        ...settings,
        taxRate: parseFloat(settings.taxRate)
      });
      setSettings(data);
      setMessage('Configuración guardada correctamente. Recarga la página para aplicar los colores y el logo.');
    } catch (err) {
      setMessage('Error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configuración General</h2>
          <p className="text-gray-500 text-sm mt-1">Administra los datos de la empresa y preferencias de facturación.</p>
        </div>

        {message && (
          <div className="mx-6 mt-6 p-4 bg-primary-50 text-primary-700 rounded-xl text-sm font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Identidad Visual</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">URL del Logo</label>
              <input type="text" placeholder="https://ejemplo.com/logo.png" className="w-full border p-2.5 rounded-xl bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" value={settings.logoUrl || ''} onChange={e => setSettings({...settings, logoUrl: e.target.value})} />
              <p className="text-xs text-gray-400 mt-1">Puedes poner un enlace a una imagen, o dejar en blanco para usar el ícono por defecto.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color Principal Accent (Hex)</label>
              <div className="flex gap-2">
                <input type="color" className="h-11 w-11 rounded cursor-pointer border-0 p-0" value={settings.themeColors || '#3b82f6'} onChange={e => setSettings({...settings, themeColors: e.target.value})} />
                <input type="text" className="flex-1 border p-2.5 rounded-xl bg-transparent focus:ring-2 focus:ring-primary-500 outline-none uppercase" value={settings.themeColors || '#3b82f6'} onChange={e => setSettings({...settings, themeColors: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color Fondo Cabecera</label>
              <div className="flex gap-2">
                <input type="color" className="h-11 w-11 rounded cursor-pointer border-0 p-0" value={settings.themeBgColor || '#0f172a'} onChange={e => setSettings({...settings, themeBgColor: e.target.value})} />
                <input type="text" className="flex-1 border p-2.5 rounded-xl bg-transparent focus:ring-2 focus:ring-primary-500 outline-none uppercase" value={settings.themeBgColor || '#0f172a'} onChange={e => setSettings({...settings, themeBgColor: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color Letra Cabecera</label>
              <div className="flex gap-2">
                <input type="color" className="h-11 w-11 rounded cursor-pointer border-0 p-0" value={settings.themeTextColor || '#ffffff'} onChange={e => setSettings({...settings, themeTextColor: e.target.value})} />
                <input type="text" className="flex-1 border p-2.5 rounded-xl bg-transparent focus:ring-2 focus:ring-primary-500 outline-none uppercase" value={settings.themeTextColor || '#ffffff'} onChange={e => setSettings({...settings, themeTextColor: e.target.value})} />
              </div>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Datos de la Empresa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre de la Empresa</label>
              <input type="text" className="w-full border p-2.5 rounded-xl bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" value={settings.companyName} onChange={e => setSettings({...settings, companyName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">RUT de la Empresa</label>
              <input type="text" placeholder="76.816.737-0" className="w-full border p-2.5 rounded-xl bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" value={settings.taxId || ''} onChange={e => setSettings({...settings, taxId: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Giro / Actividad</label>
              <input type="text" placeholder="Servicio de Aseo y Vigilancia" className="w-full border p-2.5 rounded-xl bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" value={settings.activity || ''} onChange={e => setSettings({...settings, activity: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" className="w-full border p-2.5 rounded-xl bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" value={settings.email || ''} onChange={e => setSettings({...settings, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input type="text" className="w-full border p-2.5 rounded-xl bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" value={settings.phone || ''} onChange={e => setSettings({...settings, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sitio Web</label>
              <input type="text" className="w-full border p-2.5 rounded-xl bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" value={settings.website || ''} onChange={e => setSettings({...settings, website: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Dirección</label>
              <input type="text" className="w-full border p-2.5 rounded-xl bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" value={settings.address || ''} onChange={e => setSettings({...settings, address: e.target.value})} />
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-700" />

          <h3 className="text-lg font-semibold mt-4 text-gray-900 dark:text-white">Facturación</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Moneda</label>
              <input type="text" className="w-full border p-2.5 rounded-xl bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" value={settings.currency} onChange={e => setSettings({...settings, currency: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tasa de Impuesto (%)</label>
              <input type="number" step="0.01" className="w-full border p-2.5 rounded-xl bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" value={settings.taxRate} onChange={e => setSettings({...settings, taxRate: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prefijo de Factura</label>
              <input type="text" className="w-full border p-2.5 rounded-xl bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" value={settings.invoicePrefix} onChange={e => setSettings({...settings, invoicePrefix: e.target.value})} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Pie de Página de la Factura</label>
              <textarea placeholder="Ej. Gracias por su compra. Esta factura debe ser pagada dentro de los 30 días." className="w-full border p-2.5 rounded-xl bg-transparent focus:ring-2 focus:ring-primary-500 outline-none h-20 resize-none" value={settings.invoiceFooter || ''} onChange={e => setSettings({...settings, invoiceFooter: e.target.value})} />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button disabled={loading} type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-sm font-medium disabled:opacity-50">
              <Save className="h-5 w-5" /> {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
