const mongoose = require('mongoose');

const bookingSchema  = new mongoose.Schema({
    key:  { type: String, unique : true, sparse : true},
    renter :  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    bicycle: { type: mongoose.Schema.Types.ObjectId, ref: 'Bicycle',required: true},
    status: {type: String, enum:['active','completed','booked'],default: 'completed'},
    startedAt: { type: Date, required: true},
    endedAt: {type: Date, default: null},
    percentageOfWear: { type: Number, default: 0},
    photos: [{ type: String }],
    finalPrice: {type: [String], defaul:[]},
    rating: { type: Number, default : null, min:1,max: 5},
}, { timestamps: true});

module.exports = mongoose.model('Booking', bookingSchema);