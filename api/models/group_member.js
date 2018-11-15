'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Group_MemberSchema = new Schema({
	group_id: {type: mongoose.ObjectId, ref:'Group'},
	user_id: {type: mongoose.ObjectId, ref:'User'}
});
//member belongs to group(s)
module.exports = mongoose.model('GroupMember', Group_MemberSchema);