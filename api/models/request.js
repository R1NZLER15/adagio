'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var RequestSchema = new Schema({
	user_id: {type: mongoose.ObjectId,ref: 'User'},
	text_field: String,
	career: String,
	group: String,
	grade: Number,
	turn: String,
	wants_career: String,
	wants_turn: String,
	closed: Boolean,
	created_at: String,
	updated_at: String
});

module.exports = mongoose.model('Request', RequestSchema);