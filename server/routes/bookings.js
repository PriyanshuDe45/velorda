const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const { from, to, page = 1 } = req.query;
    const limit = 10;
    const skip = (parseInt(page) - 1) * limit;

    const filter = {};
    if (from || to) {
      filter.startedAt = {};
      if (from) filter.startedAt.$gte = new Date(from);
      if (to) filter.startedAt.$lte = new Date(to);
    }

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
     .populate('renter', 'name phone')
        .populate('bicycle', 'name slug')
        .populate('tariff', 'name basePrice')
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ bookings, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
        res.status(500).json({ error: err.message });
  }
});

router.get('/export', verifyToken, async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};
    if (from || to) {
      filter.startedAt = {};
      if (from) filter.startedAt.$gte = new Date(from);
      if (to) filter.startedAt.$lte = new Date(to);
    }

    const bookings = await Booking.find(filter)
      .populate('renter', 'name phone')
      .populate('bicycle', 'name')
      .sort({ startedAt: -1 });

    const rows = [
      ['Renter Name', 'Phone', 'Bicycle', 'Start Date', 'End Date', 'Wear %', 'Photos', 'Final Price', 'Rating'],
    ];

    bookings.forEach(b => {
      rows.push([
        b.renter?.name || '',
        b.renter?.phone || '',
        b.bicycle?.name || '',
        b.startedAt ? b.startedAt.toISOString() : '',
        b.endedAt ? b.endedAt.toISOString() : '',
        b.percentageOfWear,
        (b.photos || []).join(' | '),
        b.finalPrice,
        b.rating ?? '',
      ]);
    });

    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const date = new Date().toISOString().slice(0, 10);
    const filename = `exports_history_${date}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;