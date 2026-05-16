const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const categories = await require('../models/Category').find({ owner: req.user._id }).select('_id');
    const categoryIds = categories.map(c => c._id);
    const applications = await Application.find({ category: { $in: categoryIds } })
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ error: 'Invalid status' });
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Not found' });
    app.status = status;
    await app.save();
    res.json(app);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;