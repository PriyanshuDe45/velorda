const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');
const router   = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password)
      return res.status(400).json({ error: 'Email/phone and password required' });

    const id = identifier.trim();
    const phoneVariants = [id, id.startsWith('+') ? id.slice(1) : '+' + id];

    const user = await User.findOne({
      $or: [{ email: id.toLowerCase() }, { phone: { $in: phoneVariants } }],
    });

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '8h' });
        res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'none',
        secure: false,
        maxAge: 8 * 60 * 60 * 1000,
        });
    res.json({ user: { _id: user._id, name: user.name, email: user.email, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

router.get('/me', verifyToken, (req, res) => {
  res.json({ user: { _id: req.user._id, name: req.user.name, email: req.user.email, phone: req.user.phone } });
});

module.exports = router;