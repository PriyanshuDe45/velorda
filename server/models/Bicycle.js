const mongoose = require('mongoose');

const bicycleSchema = new mongoose.Schema({
    key: { type: String, unique: true, sparse: true},
    name: { type: String, required: true, maxlenght: 100},
    slug : {type: String, required: true, unique:true},
    description: { type: String, default: ''},
    wear : { type: Number, default: 0, min:0, max:100 },
    image: { type: String, default:null},
    status: {type: String , enum: ['available','unavailable'], default :'available'},
    locationX: { type: Number, required: true},
    locationY: { type: Number, required: true},
    category: { type: mongoose.Schema.Types.ObjectId, ref:'Category', required: true},
}, {timestamps:true});

module.exports = mongoose.model('Bicycle', bicycleSchema);