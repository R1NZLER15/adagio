'use strinct';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PublicationSchema = new Schema({
	text_field: String,
	media_field: String,
	document_field: String,
	likes: Number,
	type: String,
	created_at: String,
	updated_at: String,
	user_id: {type: mongoose.ObjectId,ref: 'User'}
});
//type: define if the post belongs to a group or if its a public post

module.exports = mongoose.model('Publication', PublicationSchema);