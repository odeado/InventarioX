const express = require('express');
const router = express.Router();
const { db } = require('../utils/firebase');
const { collection, getDocs, query, where, doc, getDoc, setDoc } = require('firebase/firestore');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const crypto = require('crypto');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    if (usersSnapshot.size > 0) {
      return res.status(403).json({ error: 'Admin already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    
    // Guardar usuario
    await setDoc(doc(db, 'users', userId), {
      id: userId,
      name,
      email,
      password_hash,
      role: 'ADMIN',
      createdAt: new Date().toISOString()
    });

    // Crear configuración por defecto si no existe
    await setDoc(doc(db, 'settings', '1'), {
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
    }).catch(() => {});

    res.json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', req.user.id));
    if (!userDoc.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userDoc.data();
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
