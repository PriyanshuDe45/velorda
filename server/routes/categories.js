const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Bicycle = require('../models/Bicycle');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const categories = await Category.find({ owner: req.user._id });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const category = await Category.create({ name, owner: req.user._id });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, owner: req.user._id });
    if (!category) return res.status(404).json({ error: 'Not found' });
    category.name = req.body.name || category.name;
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, owner: req.user._id });
    if (!category) return res.status(404).json({ error: 'Not found' });
    const bikeCount = await Bicycle.countDocuments({ category: category._id });
    if (bikeCount > 0) return res.status(400).json({ error: 'Cannot delete category with bicycles' });
    await category.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;