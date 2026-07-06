const express = require('express');
const router = express.Router();
const prisma = require('../utils/db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: "1" } });
    if (!settings) {
      const newSettings = await prisma.settings.create({ data: { id: "1" } });
      return res.json(newSettings);
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const settings = await prisma.settings.upsert({
      where: { id: "1" },
      update: req.body,
      create: { id: "1", ...req.body }
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
