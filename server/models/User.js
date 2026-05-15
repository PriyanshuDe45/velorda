const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    key: { type: String, unique : true},
    name: { type: String, required : true},
    email : { type: String, unique : true, required: true, lowercase: true },
    phone : { type: String, required: true, unique : true},
    password: { type: String, required : true}, 
}, {timestamps: true});


module.exports = mongoose.model('User', userSchema);