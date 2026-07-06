const express = require('express');
const router = express.Router();
const prisma = require('../utils/db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const client = await prisma.client.create({ data: req.body });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const client = await prisma.client.findUnique({ 
      where: { id: req.params.id },
      include: { invoices: { orderBy: { createdAt: 'desc' } } }
    });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.client.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
