'use strict';
const mongoose = require('mongoose');
const Schema =  mongoose.Schema;

var StudentSchema = new Schema({
	user_id: {type: mongoose.ObjectId,ref: 'User'},
	student_id: String,
	group: String,
	grade: String,
	turn: String,
	career: String
});

module.exports = mongoose.model('Student', StudentSchema);