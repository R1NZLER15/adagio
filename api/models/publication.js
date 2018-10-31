'use strinct'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var PublicationSchema = new Schema({
    type: String,
    text: String,
    media: String,
    file: String,
    created_at: String, 
    user_id: {type: mongoose.ObjectId,ref: 'User'}
});
//type: define if the post belongs to a group or if its a public post

module.exports = mongoose.model('Publication', PublicationSchema);