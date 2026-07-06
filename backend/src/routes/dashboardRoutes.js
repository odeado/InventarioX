const express = require('express');
const router = express.Router();
const { db } = require('../utils/firebase');
const { collection, getDocs } = require('firebase/firestore');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/stats', async (req, res) => {
  try {
    // Obtener contadores básicos
    const clientsSnapshot = await getDocs(collection(db, 'clients'));
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const invoicesSnapshot = await getDocs(collection(db, 'invoices'));

    const clientsCount = clientsSnapshot.size;
    const productsCount = productsSnapshot.size;
    const invoicesCount = invoicesSnapshot.size;

    const invoices = [];
    invoicesSnapshot.forEach(doc => {
      invoices.push(doc.data());
    });

    const totalRevenue = invoices.reduce((acc, inv) => acc + inv.total, 0);
    const pendingInvoices = invoices.filter(inv => inv.status === 'PENDING').length;
    const paidInvoices = invoices.filter(inv => inv.status === 'PAID').length;

    // Calcular ventas de los últimos 6 meses reales
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // Filtramos las facturas en memoria para no requerir configuración de índices en Firestore
    const recentInvoices = invoices.filter(inv => new Date(inv.createdAt) >= sixMonthsAgo);
    recentInvoices.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const salesByMonth = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString('es-CL', { month: 'short' });
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      salesByMonth[key] = { name: label.charAt(0).toUpperCase() + label.slice(1).replace('.', ''), total: 0 };
    }

    recentInvoices.forEach(inv => {
      const date = new Date(inv.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (salesByMonth[key]) {
        salesByMonth[key].total += inv.total;
      }
    });

    const monthlySales = Object.values(salesByMonth);

    // Obtener las últimas 5 facturas
    const sortedInvoices = [...invoices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const latestInvoices = sortedInvoices.slice(0, 5);

    // Cargar los clientes para las últimas 5 facturas
    const clientsMap = {};
    clientsSnapshot.forEach(doc => {
      clientsMap[doc.id] = doc.data();
    });

    latestInvoices.forEach(inv => {
      inv.client = clientsMap[inv.clientId] || null;
    });

    res.json({
      clientsCount,
      productsCount,
      invoicesCount,
      totalRevenue,
      pendingInvoices,
      paidInvoices,
      monthlySales,
      latestInvoices
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
