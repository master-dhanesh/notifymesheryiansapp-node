const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    username: String,
    title: String,
    senderemail: String,
    receiveremail: String,
    message: String,
    timer: Date
}, {timestamps: true});

module.exports = mongoose.model('data', dataSchema);