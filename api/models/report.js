'use strict';
const mongoose = require('mongoose');
const Schema =  mongoose.Schema;

var ReportSchema = new Schema({
	reporter: {type: Schema.ObjectId,ref: 'User'},
	type: String,
	text: String,
	media: String,
	created_at: String
});
//type: define if the report is a user report or a bug report

module.exports = mongoose.model('Report', ReportSchema);