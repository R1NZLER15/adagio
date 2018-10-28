'use strict'
const mongoose = require('mongoose');
const Schema =  mongoose.Schema;

var StudentSchema = new Schema({
    user_id: {type: Schema.ObjectId,ref: 'User'},
    student_id: String,
    group: String,
    grade: String
});

module.exports = mongoose.model('Student', StudentSchema);