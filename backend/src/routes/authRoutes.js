const express = require('express');
const router = express.Router();
const prisma = require('../utils/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      return res.status(403).json({ error: 'Admin already registered' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password_hash, role: 'ADMIN' },
    });
    
    // Also create default settings
    await prisma.settings.create({
      data: { id: "1" }
    }).catch(() => {}); // Ignore if already exists

    res.json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
