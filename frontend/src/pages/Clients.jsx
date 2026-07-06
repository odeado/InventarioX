import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Search, Edit2, Trash2, FileText, Download, CheckCircle, X } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from './Invoices';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', taxId: '' });
  
  // Estados para panel de facturas de clientes
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientInvoices, setClientInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [showInvoicesDrawer, setShowInvoicesDrawer] = useState(false);
  const [settings, setSettings] = useState(null);

  const fetchClients = async () => {
    const { data } = await api.get('/clients');
    setClients(data);
  };

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setSettings(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchSettings();
  }, []);

  const handleShowInvoices = async (client) => {
    setSelectedClient(client);
    setShowInvoicesDrawer(true);
    setLoadingInvoices(true);
    try {
      const { data } = await api.get(`/clients/${client.id}`);
      setClientInvoices(data.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleMarkAsPaid = async (invoiceId) => {
    try {
      await api.put(`/invoices/${invoiceId}/status`, { status: 'PAID' });
      // Recargar facturas del cliente
      if (selectedClient) {
        const { data } = await api.get(`/clients/${selectedClient.id}`);
        setClientInvoices(data.invoices || []);
      }
      fetchClients(); // recargar para actualizar contadores si los hay
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (editingId) {
        await api.put(`/clients/${editingId}`, formData);
      } else {
        await api.post('/clients', formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', email: '', phone: '', company: '', taxId: '' });
      fetchClients();
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.error || 'Error al guardar el cliente. Verifica los datos.');
    }
  };

  const handleEdit = (client) => {
    setErrorMsg('');
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      taxId: client.taxId || ''
    });
    setEditingId(client.id);
    setShowModal(true);
  };

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Buscar clientes..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData({ name: '', email: '', phone: '', company: '', taxId: '' }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-sm font-medium"
        >
          <Plus className="h-5 w-5" /> Nuevo Cliente
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-medium">Nombre / Empresa</th>
                <th className="px-6 py-4 font-medium">Contacto</th>
                <th className="px-6 py-4 font-medium">Identificación</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(client => (
                <tr key={client.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4">
                    <div 
                      onClick={() => handleShowInvoices(client)}
                      className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer hover:underline transition"
                      title="Ver historial de facturas"
                    >
                      {client.name}
                    </div>
                    <div className="text-xs">{client.company || 'Independiente'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div>{client.email || '-'}</div>
                    <div className="text-xs text-gray-400">{client.phone}</div>
                  </td>
                  <td className="px-6 py-4">{client.taxId || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleShowInvoices(client)} 
                        className="p-2 text-gray-400 hover:text-primary-600 transition bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary-200"
                        title="Ver facturas"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEdit(client)} className="p-2 text-gray-400 hover:text-primary-600 transition bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary-200" title="Editar"><Edit2 className="w-4 h-4" /></button>
                      <button 
                        onClick={async () => { await api.delete(`/clients/${client.id}`); fetchClients(); }}
                        className="p-2 text-gray-400 hover:text-red-600 transition bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-red-200"
                        title="Eliminar"
                      ><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No se encontraron clientes.</td>
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editingId ? 'Editar Cliente' : 'Añadir Cliente'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs rounded-xl font-medium">
                  {errorMsg}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Nombre Completo *</label>
                <input required type="text" className="w-full border p-2 rounded-lg bg-transparent" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Empresa</label>
                  <input type="text" className="w-full border p-2 rounded-lg bg-transparent" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Identificación (RUT)</label>
                  <input type="text" className="w-full border p-2 rounded-lg bg-transparent" value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" className="w-full border p-2 rounded-lg bg-transparent" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Teléfono</label>
                  <input type="text" className="w-full border p-2 rounded-lg bg-transparent" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition shadow-sm font-medium">Guardar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Backdrop overlay */}
      {showInvoicesDrawer && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-xs transition-opacity" 
          onClick={() => setShowInvoicesDrawer(false)} 
        />
      )}

      {/* Side Invoices Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-100 dark:border-gray-700 flex flex-col transform transition-transform duration-300 ease-in-out ${
          showInvoicesDrawer ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Historial de Facturas
            </h3>
            <p className="text-sm text-gray-500 truncate max-w-xs">
              {selectedClient ? `${selectedClient.name} (${selectedClient.company || 'Independiente'})` : ''}
            </p>
          </div>
          <button 
            onClick={() => setShowInvoicesDrawer(false)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loadingInvoices ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
              <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
              <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
            </div>
          ) : clientInvoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="font-medium">Sin facturas emitidas</p>
              <p className="text-xs text-gray-400 mt-1">Este cliente no registra documentos en el sistema.</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Total</span>
                  <p className="text-lg font-bold text-gray-800 dark:text-white mt-1">
                    {clientInvoices.length}
                  </p>
                </div>
                <div className="bg-yellow-50/50 dark:bg-yellow-950/10 p-3 rounded-xl border border-yellow-100/50 dark:border-yellow-900/20 text-center">
                  <span className="text-[10px] text-yellow-600 dark:text-yellow-400 uppercase font-semibold">Pendientes</span>
                  <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400 mt-1">
                    {clientInvoices.filter(i => i.status === 'PENDING').length}
                  </p>
                </div>
                <div className="bg-red-50/50 dark:bg-red-950/10 p-3 rounded-xl border border-red-100/50 dark:border-red-900/20 text-center">
                  <span className="text-[10px] text-red-600 dark:text-red-400 uppercase font-semibold">Por Cobrar</span>
                  <p className="text-xs font-bold text-red-700 dark:text-red-400 mt-2 truncate">
                    ${clientInvoices.filter(i => i.status === 'PENDING').reduce((acc, curr) => acc + curr.total, 0).toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>

              {/* Invoices List */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Documentos</h4>
                {clientInvoices.map((inv) => (
                  <div 
                    key={inv.id}
                    className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-sm transition flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary-500" />
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">{inv.number}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          inv.status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
                        }`}>
                          {inv.status === 'PAID' ? 'Pagada' : 'Pendiente'}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400">
                        <span>Emisión: {new Date(inv.createdAt).toLocaleDateString('es-CL')}</span>
                        {inv.dueDate && (
                          <span className="ml-2">Vence: {new Date(inv.dueDate).toLocaleDateString('es-CL')}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <div className="text-right">
                        <p className="font-bold text-sm text-gray-900 dark:text-white">
                          ${inv.total.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      
                      <div className="flex gap-1.5">
                        {inv.status !== 'PAID' && (
                          <button 
                            onClick={() => handleMarkAsPaid(inv.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg border border-transparent hover:border-green-200 dark:hover:border-green-900/50 transition"
                            title="Marcar como Pagada"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        <PDFDownloadLink 
                          document={<InvoicePDF invoice={inv} settings={settings} />} 
                          fileName={`Factura_${inv.number}.pdf`}
                        >
                          {({ loading }) => (
                            <button 
                              disabled={loading}
                              className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-lg border border-transparent hover:border-primary-200 dark:hover:border-primary-900/50 transition disabled:opacity-50"
                              title="Descargar PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </PDFDownloadLink>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clients;
