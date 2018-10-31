'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var FollowSchema = new Schema({
    follower: {type: mongoose.ObjectId,ref: 'User'},
    followed: {type: mongoose.ObjectId,ref: 'User'}
});
//follower follows followed
module.exports = mongoose.model('Follow', FollowSchema);