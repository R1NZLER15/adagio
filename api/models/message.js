'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var MessageSchema = new Schema({
	text_field: String,
	media_field: String,
	document_field: String,
	viewed: String,
	created_at: String,
	emitter: {type: Schema.ObjectId, ref: 'User'},
	receiver: {type: Schema.ObjectId, ref: 'User'}
});
//emitter sends a message to receiver
module.exports = mongoose.model('Message', MessageSchema);