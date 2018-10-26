'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var FollowSchema = new Schema({
    follower: {type: Schema.ObjectId,ref: 'User'},
    followed: {type: Schema.ObjectId,ref: 'User'}
});
//follower follows followed
module.exports = mongoose.model('Follow', FollowSchema);