'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Member_GroupSchema = new Schema({
    member: {type: mongoose.ObjectId, ref:'User'},
    group: {type: mongoose.ObjectId, ref:'Group'}
});
//member belongs to group(s)
module.exports = mongoose.model('Member_Group', Member_GroupSchema);