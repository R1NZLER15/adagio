'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var GroupSchema = new Schema({
    name: String,
    cover: String,
    banner: String,
    description: String,
    type: String,
    category: String,
    privacy: String,
    group_admin: {type: mongoose.ObjectId, ref:'User'},
    created_at: String
});
/*
*type: Define if the group is a social group or a proyect group
*category: topic of the group
*/

module.exports = mongoose.model('Group', GroupSchema);