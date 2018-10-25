'use strict'
const mongoose = require('mongoose');
const Schema =  mongoose.Schema;

var ReportSchema = new Schema({
    reporter: {type: Schema.ObjectId,ref: 'User'},
    type: String,
    text: String,
    file: String,
    created_at: String
});

module.exports = mongoose.model('Report', ReportSchema);