const express = require('express');
const router = express.Router();
const { db } = require('../utils/firebase');
const { collection, getDocs, doc, getDoc, setDoc, deleteDoc, query, where } = require('firebase/firestore');
const authMiddleware = require('../middleware/auth');
const crypto = require('crypto');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'clients'));
    const clients = [];
    querySnapshot.forEach(doc => {
      clients.push(doc.data());
    });
    // Ordenar por createdAt descendente en memoria para evitar requerir índices compuestos en Firebase
    clients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const id = crypto.randomUUID();
    const clientData = {
      ...req.body,
      id,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'clients', id), clientData);
    res.json(clientData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const clientDoc = await getDoc(doc(db, 'clients', req.params.id));
    if (!clientDoc.exists()) {
      return res.status(404).json({ error: 'Client not found' });
    }
    const client = clientDoc.data();

    // Obtener facturas del cliente
    const q = query(collection(db, 'invoices'), where('clientId', '==', req.params.id));
    const querySnapshot = await getDocs(q);
    const invoices = [];
    querySnapshot.forEach(doc => {
      invoices.push(doc.data());
    });
    invoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    client.invoices = invoices;
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const clientRef = doc(db, 'clients', req.params.id);
    const clientDoc = await getDoc(clientRef);
    if (!clientDoc.exists()) {
      return res.status(404).json({ error: 'Client not found' });
    }
    const data = { ...clientDoc.data(), ...req.body };
    await setDoc(clientRef, data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const clientRef = doc(db, 'clients', req.params.id);
    await deleteDoc(clientRef);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
