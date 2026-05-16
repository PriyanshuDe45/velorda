const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Bicycle = require('../models/Bicycle');
const Booking = require('../models/Booking');
const { verifyToken } = require('../middlewares/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

function generateSlug(name) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function randomCoord(existingCoords) {
  let x, y, safe;
  do {
    x = Math.floor(Math.random() * 4900) + 50;
    y = Math.floor(Math.random() * 4900) + 50;
    safe = existingCoords.every(c => Math.abs(c.x - x) >= 10 || Math.abs(c.y - y) >= 10);
  } while (!safe);
  return { x, y };
}

async function makeUniqueSlug(baseSlug) {
  const exists = await Bicycle.findOne({ slug: baseSlug });
  if (!exists) return baseSlug;
  let i = 1;
  while (true) {
    const numbered = `${baseSlug}-${String(i).padStart(2, '0')}`;
    const taken = await Bicycle.findOne({ slug: numbered });
    if (!taken) return numbered;
    i++;
  }
}

router.get('/', verifyToken, async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filter = categoryId ? { category: categoryId } : {};
    const bikes = await Bicycle.find(filter);
    res.json(bikes);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description, categoryId, copies = 1 } = req.body;
    const existing = await Bicycle.find({});
    const existingCoords = existing.map(b => ({ x: b.locationX, y: b.locationY }));
    const baseSlug = generateSlug(name);
    const created = [];

    for (let i = 0; i < parseInt(copies); i++) {
      const slug = await makeUniqueSlug(baseSlug);
      const { x, y } = randomCoord(existingCoords);
      existingCoords.push({ x, y });
      const bike = await Bicycle.create({
        name, slug, description: description || '',
        wear: 0, status: 'available',
        locationX: x, locationY: y,
        category: categoryId,
      });
      created.push(bike);
    }
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const bike = await Bicycle.findById(req.params.id);
    if (!bike) return res.status(404).json({ error: 'Not found' });

    if (req.body.status === 'unavailable') {
      const active = await Booking.findOne({
        bicycle: bike._id,
        status: { $in: ['active', 'booked'] },
      });
      if (active) return res.status(400).json({ error: 'Cannot set unavailable: bicycle is booked or rented' });
    }

    const { name, description, wear, status } = req.body;
    if (name !== undefined) bike.name = name;
    if (description !== undefined) bike.description = description;
    if (wear !== undefined) bike.wear = wear;
    if (status !== undefined) bike.status = status;
    await bike.save();
    res.json(bike);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const bike = await Bicycle.findById(req.params.id);
    if (!bike) return res.status(404).json({ error: 'Not found' });
    if (bike.status !== 'unavailable') return res.status(400).json({ error: 'Can only delete unavailable bicycles' });
    await bike.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/image', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const bike = await Bicycle.findById(req.params.id);
    if (!bike) return res.status(404).json({ error: 'Not found' });
    bike.image = req.file.filename;
    await bike.save();
    res.json(bike);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;