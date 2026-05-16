const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  code:            { type: String, required: true, unique: true },
  expiresAt:       { type: Date, required: true },
  freeMinutes:     { type: Number, default: null },
  discountPercent: { type: Number, default: null },
  category:        { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
}, { timestamps: true });

module.exports = mongoose.model('PromoCode', promoCodeSchema);