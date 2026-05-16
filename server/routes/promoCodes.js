const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const PromoCode = require('../models/PromoCode');
const Category = require('../models/Category');
const { verifyToken } = require('../middleware/auth');

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = Math.floor(Math.random() * 6) + 5;
  let code = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

router.get('/', verifyToken, async (req, res) => {
  try {
    const categories = await Category.find({ owner: req.user._id }).select('_id');
    const categoryIds = categories.map(c => c._id);
    const promos = await PromoCode.find({ category: { $in: categoryIds } })
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(promos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { categoryId, expiresAt, freeMinutes, discountPercent } = req.body;
    if (!categoryId || !expiresAt)
      return res.status(400).json({ error: 'Category and expiry required' });
    if (!freeMinutes && !discountPercent)
      return res.status(400).json({ error: 'Set free minutes or discount percent' });

    const category = await Category.findOne({ _id: categoryId, owner: req.user._id });
    if (!category) return res.status(403).json({ error: 'Not your category' });

    let code;
    let attempts = 0;
    do {
      code = generateCode();
      attempts++;
    } while (await PromoCode.findOne({ code }) && attempts < 10);

    const promo = await PromoCode.create({
      code,
      expiresAt: new Date(expiresAt),
      freeMinutes: freeMinutes ? parseInt(freeMinutes) : null,
      discountPercent: discountPercent ? parseFloat(discountPercent) : null,
      category: categoryId,
    });

    res.status(201).json(promo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const promo = await PromoCode.findById(req.params.id);
    if (!promo) return res.status(404).json({ error: 'Not found' });
    await promo.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;