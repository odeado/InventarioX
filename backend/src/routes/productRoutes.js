const express = require('express');
const router = express.Router();
const { db } = require('../utils/firebase');
const { collection, getDocs, doc, getDoc, setDoc, deleteDoc, query, where } = require('firebase/firestore');
const authMiddleware = require('../middleware/auth');
const crypto = require('crypto');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products = [];
    querySnapshot.forEach(doc => {
      products.push(doc.data());
    });
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const id = crypto.randomUUID();
    const data = { ...req.body };
    
    if (typeof data.sku === 'string') {
      data.sku = data.sku.trim() || null;
    }

    if (data.sku) {
      const q = query(collection(db, 'products'), where('sku', '==', data.sku));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return res.status(400).json({ error: 'Ya existe un producto con este SKU.' });
      }
    }

    const productData = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'products', id), productData);
    res.json(productData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const productRef = doc(db, 'products', id);
    const productDoc = await getDoc(productRef);
    if (!productDoc.exists()) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const data = { ...req.body };
    if (typeof data.sku === 'string') {
      data.sku = data.sku.trim() || null;
    }

    if (data.sku) {
      const q = query(collection(db, 'products'), where('sku', '==', data.sku));
      const snapshot = await getDocs(q);
      const duplicates = snapshot.docs.filter(doc => doc.id !== id);
      if (duplicates.length > 0) {
        return res.status(400).json({ error: 'Ya existe un producto con este SKU.' });
      }
    }

    const productData = {
      ...productDoc.data(),
      ...data
    };

    await setDoc(productRef, productData);
    res.json(productData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const productRef = doc(db, 'products', req.params.id);
    await deleteDoc(productRef);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
