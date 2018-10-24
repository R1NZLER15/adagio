'use strinct'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var PublicationSchema = new Schema({
    text: String,
    file: String,
    created_at: Date, 
    user: {Type: Schema.ObjectId,ref: 'User'}
});

module.exports = mongoose.model('Publication', PublicationSchema);