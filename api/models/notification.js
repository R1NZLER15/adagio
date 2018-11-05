'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    receiver_id: {type: Schema.ObjectId, ref: 'User'},
    origin: {type: Schema.ObjectId, ref: 'User'},
    text: String,
    link: String,
    type: String,
    created_at: String,
    viewed: Boolean
});

module.exports = mongoose.model('Notification', NotificationSchema)