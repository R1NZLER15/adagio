'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var GroupSchema = new Schema({
    name: String,
    cover: String,
    banner: String,
    about: String,
    category: String,
    privacy: String,
    members: {type: mongoose.ObjectId, ref:'User'},
    created_at: String
});

module.exports = mongoose.model('Group', GroupSchema);