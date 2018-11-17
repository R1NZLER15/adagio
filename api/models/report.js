'use strict';
const mongoose = require('mongoose');
const Schema =  mongoose.Schema;

var ReportSchema = new Schema({
	reporter_id: {type: Schema.ObjectId,ref: 'User'},
	reported_id: {type: Schema.ObjectId,ref: 'User'},
	publication_id: {type: Schema.ObjectId,ref: 'Publication'},
	comment_id: {type: Schema.ObjectId,ref: 'Comment'},
	type: String,
	text: String,
	media: String,
	created_at: String
});
//type: define if the report is a user report or a bug report

module.exports = mongoose.model('Report', ReportSchema);