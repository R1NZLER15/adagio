'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var ConversationSchema = new Schema({
	user_1: {type: Schema.ObjectId, ref: 'User'},
	user_2: {type: Schema.ObjectId, ref: 'User'},
	last_message: String,
	updated_at: String
});
module.exports = mongoose.model('Conversation', ConversationSchema);