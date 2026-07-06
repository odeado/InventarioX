const express = require('express');
const router = express.Router();
const prisma = require('../utils/db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = { ...req.body };
    if (typeof data.sku === 'string') {
      data.sku = data.sku.trim() || null;
    }
    const product = await prisma.product.create({ data });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (typeof data.sku === 'string') {
      data.sku = data.sku.trim() || null;
    }
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
