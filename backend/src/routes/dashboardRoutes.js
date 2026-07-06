const express = require('express');
const router = express.Router();
const prisma = require('../utils/db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/stats', async (req, res) => {
  try {
    const clientsCount = await prisma.client.count();
    const productsCount = await prisma.product.count();
    const invoicesCount = await prisma.invoice.count();
    
    const invoices = await prisma.invoice.findMany();
    const totalRevenue = invoices.reduce((acc, inv) => acc + inv.total, 0);
    const pendingInvoices = invoices.filter(inv => inv.status === 'PENDING').length;
    const paidInvoices = invoices.filter(inv => inv.status === 'PAID').length;

    // Obtener ventas mensuales reales de los últimos 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentInvoices = await prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

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

    // Obtener los ultimos 5
    const latestInvoices = await prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: true }
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
