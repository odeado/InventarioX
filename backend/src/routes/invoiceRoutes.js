const express = require('express');
const router = express.Router();
const { db } = require('../utils/firebase');
const { collection, getDocs, doc, getDoc, setDoc, deleteDoc } = require('firebase/firestore');
const authMiddleware = require('../middleware/auth');
const crypto = require('crypto');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'invoices'));
    const invoices = [];
    querySnapshot.forEach(doc => {
      invoices.push(doc.data());
    });

    // Cargar los clientes en un solo llamado para optimizar
    const clientsSnapshot = await getDocs(collection(db, 'clients'));
    const clientsMap = {};
    clientsSnapshot.forEach(doc => {
      clientsMap[doc.id] = doc.data();
    });

    invoices.forEach(inv => {
      inv.client = clientsMap[inv.clientId] || null;
    });

    invoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { clientId, status, subtotal, taxAmount, discount, total, notes, dueDate, items } = req.body;
  try {
    const id = crypto.randomUUID();
    
    // Obtener y actualizar número de factura
    const settingsRef = doc(db, 'settings', '1');
    const settingsDoc = await getDoc(settingsRef);
    let nextNum = 1;
    let prefix = 'INV-';
    
    if (settingsDoc.exists()) {
      const settingsData = settingsDoc.data();
      nextNum = settingsData.nextInvoiceNum || 1;
      prefix = settingsData.invoicePrefix || 'INV-';
      
      // Incrementar el número siguiente en settings
      await setDoc(settingsRef, { nextInvoiceNum: nextNum + 1 }, { merge: true });
    }

    const number = `${prefix}${String(nextNum).padStart(5, '0')}`;

    // Obtener detalles de productos para cada item
    const itemsWithProducts = await Promise.all(items.map(async (item) => {
      const productDoc = await getDoc(doc(db, 'products', item.productId));
      const productData = productDoc.exists() ? productDoc.data() : { name: item.name };
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        product: productData
      };
    }));

    const invoiceData = {
      id,
      number,
      clientId,
      status: status || "PENDING",
      subtotal,
      taxAmount,
      discount: discount || 0,
      total,
      notes: notes || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      createdAt: new Date().toISOString(),
      items: itemsWithProducts
    };

    await setDoc(doc(db, 'invoices', id), invoiceData);
    res.json(invoiceData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const invoiceDoc = await getDoc(doc(db, 'invoices', req.params.id));
    if (!invoiceDoc.exists()) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const invoice = invoiceDoc.data();

    // Obtener detalles del cliente
    const clientDoc = await getDoc(doc(db, 'clients', invoice.clientId));
    invoice.client = clientDoc.exists() ? clientDoc.data() : null;

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { clientId, status, subtotal, taxAmount, discount, total, notes, dueDate, items } = req.body;
  try {
    const invoiceRef = doc(db, 'invoices', id);
    const invoiceDoc = await getDoc(invoiceRef);
    if (!invoiceDoc.exists()) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Obtener detalles de productos para cada item
    const itemsWithProducts = await Promise.all(items.map(async (item) => {
      const productDoc = await getDoc(doc(db, 'products', item.productId));
      const productData = productDoc.exists() ? productDoc.data() : { name: item.name };
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        product: productData
      };
    }));

    const invoiceData = {
      ...invoiceDoc.data(),
      clientId,
      status: status || "PENDING",
      subtotal,
      taxAmount,
      discount: discount || 0,
      total,
      notes: notes || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      items: itemsWithProducts
    };

    await setDoc(invoiceRef, invoiceData);
    res.json(invoiceData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const invoiceRef = doc(db, 'invoices', req.params.id);
    const invoiceDoc = await getDoc(invoiceRef);
    if (!invoiceDoc.exists()) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const data = { ...invoiceDoc.data(), status: req.body.status };
    await setDoc(invoiceRef, data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const invoiceRef = doc(db, 'invoices', req.params.id);
    await deleteDoc(invoiceRef);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
