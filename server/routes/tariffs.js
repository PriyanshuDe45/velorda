const express = require('express');
const router = express.Router();
const Tariff = require('../models/Tariff');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const { categoryId } = req.query;
    const tariffs = await Tariff.find({ category: categoryId });
    res.json(tariffs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, type, basePrice, minPrice, maxPrice, categoryId } = req.body;
    if (!name || !type || !basePrice || !categoryId)
      return res.status(400).json({ error: 'Missing required fields' });
    if (type === 'DYNAMIC' && (!minPrice || !maxPrice))
      return res.status(400).json({ error: 'Dynamic tariff requires min and max price' });
    const existing = await Tariff.findOne({ name, type, category: categoryId });
    if (existing) return res.status(400).json({ error: 'Duplicate tariff' });
    const tariff = await Tariff.create({
      name, type,
      basePrice: parseFloat(basePrice),
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      category: categoryId,
    });
    res.status(201).json(tariff);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/archive', verifyToken, async (req, res) => {
  try {
    const tariff = await Tariff.findById(req.params.id);
    if (!tariff) return res.status(404).json({ error: 'Not found' });
    tariff.isArchived = !tariff.isArchived;
    await tariff.save();
    res.json(tariff);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const tariff = await Tariff.findById(req.params.id);
    if (!tariff) return res.status(404).json({ error: 'Not found' });
    await tariff.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;