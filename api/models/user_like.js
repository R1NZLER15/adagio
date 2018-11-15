'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User_LikeSchema=new Schema({
	user_id: {type: mongoose.ObjectId,ref: 'User'},
	publication_id: {type: mongoose.ObjectId,ref: 'Publication'},
	comment_id: {type: mongoose.ObjectId,ref: 'Comment'},
	liked_user_id: {type: mongoose.ObjectId,ref: 'User'}
});
module.exports = mongoose.model('UserLike', User_LikeSchema);