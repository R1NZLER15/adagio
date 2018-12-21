'use strinct';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PublicationSchema = new Schema({
	text: String,
	media_file: String,
	document_file: String,
	likes: Number,
	type: String,
	group: {type: mongoose.ObjectId, ref: 'Group'},
	created_at: String,
	updated_at: String,
	user_id: {type: mongoose.ObjectId, ref: 'User'}
});
//type: define if the post belongs to a group or if its a public post

module.exports = mongoose.model('Publication', PublicationSchema);