'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupJoinRequestSchema = new Schema({
	user_id: {type: mongoose.ObjectId, ref: 'User'},
	group_id: {type: mongoose.ObjectId, ref: 'Group'},
	created_at: Number
});

module.exports = mongoose.model('Group_Join_Request', GroupJoinRequestSchema);

