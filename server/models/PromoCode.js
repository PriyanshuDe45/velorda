const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique : true, uppercase: true},
    expiresAt: { type: Date , required : true},
    freeMinutes: {type: Number ,default: null},
    discountPercent : { type: Number, default: null, min : 0, max: 100},
    category: { type: mongoose.Schema.Types.ObjectId, ref: ' Category', required: true}
}, {timestamps: true});

module.exports = mongoose.model('PromoCode', promoCodeSchema);