'use strict';
'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let CommentSchema=new Schema({
	publication_id: {type: mongoose.ObjectId,ref: 'Publication'},
	user_id: {type: mongoose.ObjectId,ref: 'User'},
	text_field: String,
	media_field: String,
	likes: Number,
	created_at: String,
	updated_at: String
});
module.exports = mongoose.model('Comment', CommentSchema);