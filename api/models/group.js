'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var GroupSchema = new Schema({
	name: String,
	group_link: String,
	description: String,
	type: String,
	category: String,
	privacy: String,
	cover: String,
	banner: String,
	group_admin_id: {type: mongoose.ObjectId, ref:'User'},
	created_at: String
});
/*
*type: Define if the group is a social group or a proyect group
*Types; public, private, classroom(private, joinable via key), proyect(users can create
*these groups for school proyects, the group gets deleted a few days after the proyect presentation)
*category: topic of the group (only public or private groups have this option)
*/

module.exports = mongoose.model('Group', GroupSchema);