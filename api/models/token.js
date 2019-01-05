'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var TokenSchema = new Schema({
	token: String,
	school: String,
	turn: String,
	grade: String,
	group: String,
	created_at: String,
	expires_at: String
});

module.exports = mongoose.model('Token', TokenSchema);