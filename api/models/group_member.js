'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Group_MemberSchema = new Schema({
    group: {type: mongoose.ObjectId, ref:'Group'},
    member: {type: mongoose.ObjectId, ref:'User'}
});
//member belongs to group(s)
module.exports = mongoose.model('Group_Member', Group_MemberSchema);