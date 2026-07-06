const express = require('express');
const router = express.Router();
const prisma = require('../utils/db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { client: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { clientId, status, subtotal, taxAmount, discount, total, notes, dueDate, items } = req.body;
  try {
    // Generar numero de factura
    const settings = await prisma.settings.findUnique({ where: { id: "1" } });
    const nextNum = settings ? settings.nextInvoiceNum : 1;
    const prefix = settings ? settings.invoicePrefix : "INV-";
    const number = `${prefix}${String(nextNum).padStart(5, '0')}`;

    // Actualizar numero de factura
    if (settings) {
      await prisma.settings.update({ where: { id: "1" }, data: { nextInvoiceNum: nextNum + 1 } });
    }

    const invoice = await prisma.invoice.create({
      data: {
        number,
        clientId,
        status: status || "PENDING",
        subtotal,
        taxAmount,
        discount: discount || 0,
        total,
        notes,
        dueDate: dueDate ? new Date(dueDate) : null,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice
          }))
        }
      },
      include: { items: true, client: true }
    });

    // Opcional: reducir stock (puede manejarse segun regla de negocio)

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true } }, client: true }
    });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status: req.body.status }
    });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.invoice.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
