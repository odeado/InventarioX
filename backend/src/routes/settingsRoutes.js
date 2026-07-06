const express = require('express');
const router = express.Router();
const { db } = require('../utils/firebase');
const { doc, getDoc, setDoc } = require('firebase/firestore');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', '1'));
    if (!settingsDoc.exists()) {
      const defaultSettings = {
        id: '1',
        companyName: 'Mi Empresa',
        logoUrl: null,
        themeColors: '#0f172a',
        address: null,
        phone: null,
        email: null,
        website: null,
        currency: 'USD',
        taxRate: 0.0,
        invoiceFooter: null,
        invoicePrefix: 'INV-',
        nextInvoiceNum: 1,
        updatedAt: new Date().toISOString(),
        taxId: null,
        activity: null
      };
      await setDoc(doc(db, 'settings', '1'), defaultSettings);
      return res.json(defaultSettings);
    }
    res.json(settingsDoc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const settingsRef = doc(db, 'settings', '1');
    const data = { ...req.body, updatedAt: new Date().toISOString() };
    delete data.id;
    
    await setDoc(settingsRef, data, { merge: true });
    
    const settingsDoc = await getDoc(settingsRef);
    res.json(settingsDoc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
