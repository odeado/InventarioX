import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Search, FileText, Download, Trash2, CheckCircle } from 'lucide-react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

export const InvoicePDF = ({ invoice, settings }) => {
  const themeColor = settings?.themeColors || '#3b82f6';
  const themeBgColor = settings?.themeBgColor || '#0f172a';
  const themeTextColor = settings?.themeTextColor || '#ffffff';
  
  const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 9, fontFamily: 'Helvetica', color: '#1e293b' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    logoContainer: { flexDirection: 'row', alignItems: 'center' },
    logo: { width: 50, height: 50, marginRight: 10, borderRadius: 8 },
    logoFallback: { width: 45, height: 45, marginRight: 10, borderRadius: 8, backgroundColor: themeBgColor, alignItems: 'center', justifyContent: 'center' },
    logoText: { color: themeTextColor, fontSize: 20, fontFamily: 'Helvetica-Bold' },
    companyName: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
    companyDetails: { fontSize: 8, color: '#64748b', marginTop: 2 },
    
    docTitleContainer: { alignItems: 'flex-end', justifyContent: 'center' },
    docTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: themeColor },
    docNumberBox: { marginTop: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, backgroundColor: themeBgColor },
    docNumber: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: themeTextColor },
    docStatus: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: themeColor, marginTop: 4, textTransform: 'uppercase' },
    
    divider: { height: 2, backgroundColor: themeColor, marginVertical: 10 },
    
    card: { padding: 10, backgroundColor: '#f8fafc', border: '1 solid #e2e8f0', borderRadius: 6, flexDirection: 'row', marginBottom: 15 },
    cardCol: { flex: 1, flexDirection: 'column' },
    cardRow: { flexDirection: 'row', marginBottom: 3 },
    cardLabel: { width: 85, color: '#64748b', fontFamily: 'Helvetica-Bold', fontSize: 7.5 },
    cardValue: { color: '#0f172a', fontSize: 7.5 },
    
    table: { width: '100%', marginBottom: 20 },
    tableHeader: { flexDirection: 'row', backgroundColor: themeBgColor, borderTopLeftRadius: 4, borderTopRightRadius: 4, paddingVertical: 5 },
    tableHeaderCell: { color: themeTextColor, fontFamily: 'Helvetica-Bold', fontSize: 8 },
    tableRow: { flexDirection: 'row', borderBottom: '1 solid #f1f5f9', paddingVertical: 6, alignItems: 'center' },
    tableRowEven: { backgroundColor: '#f8fafc' },
    tableCell: { fontSize: 8, color: '#334155' },
    
    summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, marginBottom: 20 },
    summaryCard: { flex: 1, marginHorizontal: 4, padding: 8, borderRadius: 6, alignItems: 'center', justifyContent: 'center', border: '1 solid #cbd5e1' },
    summaryCardSubtotal: { borderColor: '#10b981', backgroundColor: '#ecfdf5' },
    summaryCardTax: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
    summaryCardTotal: { borderColor: themeColor, backgroundColor: '#f0f9ff' },
    summaryLabel: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: '#64748b', textTransform: 'uppercase', marginBottom: 3 },
    summaryValue: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
    summaryValueSubtotal: { color: '#10b981' },
    summaryValueTax: { color: '#ef4444' },
    summaryValueTotal: { color: themeColor },
    
    signatureContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 35, paddingHorizontal: 20 },
    signatureBox: { alignItems: 'center', width: '40%' },
    signatureLine: { width: '100%', height: 1, backgroundColor: '#cbd5e1', marginBottom: 5 },
    signatureText: { fontSize: 8, color: '#64748b', fontFamily: 'Helvetica' },
    
    footer: { position: 'absolute', bottom: 25, left: 30, right: 30, textAlign: 'center', color: '#94a3b8', fontSize: 7.5, borderTop: '1 solid #f1f5f9', paddingTop: 8 }
  });

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '$0';
    return '$' + Math.round(val).toLocaleString('es-CL');
  };

  const hasLogo = settings?.logoUrl && settings.logoUrl.trim().length > 0;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {hasLogo ? (
              <Image src={settings.logoUrl} style={styles.logo} />
            ) : (
              <View style={styles.logoFallback}>
                <Text style={styles.logoText}>
                  {settings?.companyName ? settings.companyName.charAt(0).toUpperCase() : 'M'}
                </Text>
              </View>
            )}
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.companyName}>{settings?.companyName || 'Mi Empresa'}</Text>
              {settings?.taxId && <Text style={styles.companyDetails}>RUT: {settings.taxId}</Text>}
              {settings?.activity && <Text style={styles.companyDetails}>{settings.activity}</Text>}
              {settings?.address && <Text style={styles.companyDetails}>{settings.address}</Text>}
              {(settings?.phone || settings?.email) && (
                <Text style={styles.companyDetails}>
                  {settings.phone ? `Telf: ${settings.phone}` : ''} {settings.email ? ` | Email: ${settings.email}` : ''}
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.docTitleContainer}>
            <Text style={styles.docTitle}>FACTURA DE VENTA</Text>
            <View style={styles.docNumberBox}>
              <Text style={styles.docNumber}>Nº {invoice.number}</Text>
            </View>
            <Text style={styles.docStatus}>{invoice.status === 'PAID' ? 'PAGADA' : 'PENDIENTE'}</Text>
          </View>
        </View>
        
        {/* Divider */}
        <View style={styles.divider} />
        
        {/* Metadata Card */}
        <View style={styles.card}>
          <View style={styles.cardCol}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>CLIENTE:</Text>
              <Text style={styles.cardValue}>{invoice.client?.name || '-'}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>RUT / ID:</Text>
              <Text style={styles.cardValue}>{invoice.client?.taxId || '-'}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>DIRECCIÓN:</Text>
              <Text style={styles.cardValue}>{invoice.client?.address || '-'}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>TELÉFONO:</Text>
              <Text style={styles.cardValue}>{invoice.client?.phone || '-'}</Text>
            </View>
          </View>
          
          <View style={styles.cardCol}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>EMAIL:</Text>
              <Text style={styles.cardValue}>{invoice.client?.email || '-'}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>FECHA EMISIÓN:</Text>
              <Text style={styles.cardValue}>{new Date(invoice.createdAt).toLocaleDateString('es-CL')}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>FECHA VENCE:</Text>
              <Text style={styles.cardValue}>
                {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('es-CL') : 'A 30 días'}
              </Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>CONDICIÓN:</Text>
              <Text style={styles.cardValue}>Efectivo / Transferencia</Text>
            </View>
          </View>
        </View>
        
        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: '50%', paddingLeft: 8 }]}>PRODUCTO / SERVICIO</Text>
            <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'center' }]}>CANT.</Text>
            <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>PRECIO U.</Text>
            <Text style={[styles.tableHeaderCell, { width: '20%', textAlign: 'right', paddingRight: 8 }]}>TOTAL</Text>
          </View>
          {invoice.items?.map((item, i) => (
            <View style={[styles.tableRow, i % 2 === 1 ? styles.tableRowEven : {}]} key={i}>
              <View style={{ width: '50%', paddingLeft: 8 }}>
                <Text style={[styles.tableCell, { fontFamily: 'Helvetica-Bold' }]}>{item.product?.name}</Text>
                {item.product?.category && <Text style={{ fontSize: 6.5, color: '#64748b', marginTop: 1 }}>Categoría: {item.product.category}</Text>}
              </View>
              <Text style={[styles.tableCell, { width: '15%', textAlign: 'center' }]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={[styles.tableCell, { width: '20%', textAlign: 'right', paddingRight: 8, fontFamily: 'Helvetica-Bold' }]}>
                {formatCurrency(item.totalPrice)}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Summary Card Grid */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.summaryCardSubtotal]}>
            <Text style={styles.summaryLabel}>SUBTOTAL</Text>
            <Text style={[styles.summaryValue, styles.summaryValueSubtotal]}>
              {formatCurrency(invoice.subtotal)}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardTax]}>
            <Text style={styles.summaryLabel}>IMPUESTOS ({settings?.taxRate || 0}%)</Text>
            <Text style={[styles.summaryValue, styles.summaryValueTax]}>
              {formatCurrency(invoice.taxAmount)}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardTotal]}>
            <Text style={styles.summaryLabel}>TOTAL A PAGAR</Text>
            <Text style={[styles.summaryValue, styles.summaryValueTotal]}>
              {formatCurrency(invoice.total)}
            </Text>
          </View>
        </View>
        
        {/* Signatures */}
        <View style={styles.signatureContainer}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Firma Recibí Conforme</Text>
            <Text style={[styles.signatureText, { fontSize: 6, color: '#94a3b8', marginTop: 2 }]}>Nombre, RUT y Fecha</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Firma Autorizada</Text>
            <Text style={[styles.signatureText, { fontSize: 6, color: '#94a3b8', marginTop: 2 }]}>{settings?.companyName || 'Emisor'}</Text>
          </View>
        </View>
        
        {/* Footer */}
        {settings?.invoiceFooter && (
          <View style={styles.footer}>
            <Text>{settings.invoiceFooter}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Nuevo formulario de factura
  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [editingInvoiceStatus, setEditingInvoiceStatus] = useState('PENDING');

  const fetchData = async () => {
    const [invRes, cliRes, prodRes, setRes] = await Promise.all([
      api.get('/invoices'),
      api.get('/clients'),
      api.get('/products'),
      api.get('/settings')
    ]);
    setInvoices(invRes.data);
    setClients(cliRes.data);
    setProducts(prodRes.data);
    setSettings(setRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (inv) => {
    setEditingInvoiceId(inv.id);
    setClientId(inv.clientId);
    setEditingInvoiceStatus(inv.status);
    setItems(inv.items?.map(item => ({
      productId: item.productId,
      name: item.product?.name || item.name,
      unitPrice: item.unitPrice,
      quantity: item.quantity
    })) || []);
    setSelectedProduct('');
    setQuantity(1);
    setShowModal(true);
  };

  const addItem = () => {
    if (!selectedProduct || quantity < 1) return;
    const prod = products.find(p => p.id === selectedProduct);
    if (!prod) return;
    setItems([...items, { productId: prod.id, name: prod.name, unitPrice: prod.price, quantity: parseInt(quantity) }]);
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    let finalItems = [...items];
    
    // Si seleccionó un producto pero no presionó "Add" (Añadir), lo agregamos automáticamente
    if (selectedProduct && quantity >= 1) {
      const prod = products.find(p => p.id === selectedProduct);
      if (prod) {
        finalItems.push({
          productId: prod.id,
          name: prod.name,
          unitPrice: prod.price,
          quantity: parseInt(quantity)
        });
      }
    }
    
    if (!clientId) {
      alert("Por favor, selecciona un cliente.");
      return;
    }
    
    if (finalItems.length === 0) {
      alert("Por favor, añade al menos un producto a la factura.");
      return;
    }
    
    const subtotal = finalItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    const taxRate = settings?.taxRate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const payload = {
      clientId,
      items: finalItems,
      subtotal,
      taxAmount,
      total,
      discount: 0,
      status: editingInvoiceId ? editingInvoiceStatus : 'PENDING'
    };

    if (editingInvoiceId) {
      await api.put(`/invoices/${editingInvoiceId}`, payload);
    } else {
      await api.post('/invoices', payload);
    }

    setShowModal(false);
    setEditingInvoiceId(null);
    setClientId('');
    setItems([]);
    setSelectedProduct('');
    setQuantity(1);
    fetchData();
  };

  const handleStatusChange = async (id, status) => {
    await api.put(`/invoices/${id}/status`, { status });
    fetchData();
  };

  const filtered = invoices.filter(inv => inv.number.toLowerCase().includes(search.toLowerCase()) || inv.client?.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Buscar facturas..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition shadow-sm font-medium"
        >
          <Plus className="h-5 w-5" /> Nueva Factura
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-medium">Nº Factura</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer" onClick={() => handleEditClick(inv)}>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{inv.number}</td>
                  <td className="px-6 py-4">{inv.client?.name}</td>
                  <td className="px-6 py-4">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium uppercase tracking-wider ${
                      inv.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">${inv.total.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      {inv.status !== 'PAID' && (
                         <button onClick={() => handleStatusChange(inv.id, 'PAID')} className="p-2 text-green-600 hover:bg-green-50 transition rounded-lg border border-transparent hover:border-green-200" title="Marcar Pagada">
                           <CheckCircle className="w-4 h-4" />
                         </button>
                      )}
                      <PDFDownloadLink document={<InvoicePDF invoice={inv} settings={settings} />} fileName={`Factura_${inv.number}.pdf`}>
                        {({ loading }) => (
                          <button disabled={loading} className="p-2 text-primary-600 hover:bg-primary-50 transition rounded-lg border border-transparent hover:border-primary-200" title="Descargar PDF">
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </PDFDownloadLink>
                      <button 
                        onClick={async () => { if(confirm("¿Seguro que deseas eliminar esta factura?")) { await api.delete(`/invoices/${inv.id}`); fetchData(); } }}
                        className="p-2 text-gray-400 hover:text-red-600 transition hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200" title="Eliminar"
                      ><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingInvoiceId ? 'Modificar Factura' : 'Crear Factura'}
              </h3>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cliente *</label>
                  <select className="w-full border p-2.5 rounded-xl bg-transparent" value={clientId} onChange={e => setClientId(e.target.value)}>
                    <option value="">Seleccione un cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                {editingInvoiceId && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Estado de Pago</label>
                    <select className="w-full border p-2.5 rounded-xl bg-transparent" value={editingInvoiceStatus} onChange={e => setEditingInvoiceStatus(e.target.value)}>
                      <option value="PENDING">PENDIENTE</option>
                      <option value="PAID">PAGADA</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold mb-3">Añadir Productos</h4>
                <div className="flex gap-2 mb-4">
                  <select className="flex-1 border p-2 rounded-lg bg-white dark:bg-gray-800" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                    <option value="">Seleccione producto...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.price.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</option>)}
                  </select>
                  <input type="number" min="1" className="w-20 border p-2 rounded-lg bg-white dark:bg-gray-800 text-center" value={quantity} onChange={e => setQuantity(e.target.value)} />
                  <button type="button" onClick={addItem} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition font-medium">Añadir</button>
                </div>

                {items.length > 0 && (
                  <table className="w-full text-sm mt-4">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-2">Item</th>
                        <th className="py-2">Cant</th>
                        <th className="py-2">Precio</th>
                        <th className="py-2 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, i) => (
                        <tr key={i} className="border-b border-gray-100 border-dashed">
                          <td className="py-2">{item.name}</td>
                          <td className="py-2">{item.quantity}</td>
                          <td className="py-2">${(item.unitPrice * item.quantity).toLocaleString('es-CL', { maximumFractionDigits: 0 })}</td>
                          <td className="py-2 text-right">
                            <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700">X</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
              <div>
                 <p className="text-sm text-gray-500">Subtotal: ${items.reduce((a,b) => a + (b.unitPrice * b.quantity), 0).toLocaleString('es-CL', { maximumFractionDigits: 0 })}</p>
                 <p className="font-bold text-lg text-gray-900 dark:text-white">Total aprox: ${(items.reduce((a,b) => a + (b.unitPrice * b.quantity), 0) * (1 + (settings?.taxRate || 0)/100)).toLocaleString('es-CL', { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowModal(false); setEditingInvoiceId(null); }} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-xl transition">Cancelar</button>
                <button onClick={handleCreate} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition shadow-sm font-medium">
                  {editingInvoiceId ? 'Guardar Cambios' : 'Emitir Factura'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
