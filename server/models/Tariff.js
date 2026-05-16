const mongoose = require('mongoose');

const tariffSchema = new mongoose.Schema({
    key: { type :String, unique: true, sparse: true},
    name: {type: String, required:true},
    type: { type: String, enumn:  [ 'STATIC','DYNAMIC'], required :true},
    basePrice: { type: Number, required : true},
    minPrice: { type : Number , default : null},
    maxPrice: { type : Number , default : null},
    isArchived: { type : Boolean , default : null},
    category : { type: mongoose.Schema.Types.ObjectId, ref: ' Category', required :true}
}, { timestamp: true});

tariffSchema.index({name :1 , type: 1, category: 1}, { unique : true});

module.exports = mongoose.model('Tariff', tariffSchema);