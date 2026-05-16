const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    key : { type: String, unique : true, sparse : true},
    applicationName: { type: String , required: true},
    applicationPhone : { type: String, required: true},
    applicationEmail :{ type:String, required: true},
    applicant: { type: mongoose.Schema.Types.ObjectId, ref : 'User',required : true},
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true},
    status: { type: String, enum : ['pending','approved','rejected'], default: 'pending'},
}, { timestamps: true});

module.exports = mongoose.model('Application', applicationSchema);