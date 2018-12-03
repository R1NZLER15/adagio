'use strict';
const mongoose = require('mongoose');
const Schema =  mongoose.Schema;

var UserSchema = new Schema({
	names: String,
	fst_surname: String,
	snd_surname: String,
	unique_nick: String,
	email: String,
	gender: String,
	password: String,
	avatar: String,
	cover: String,
	about_me: String,
	join_date: String,
	birthday: String,
	role: String,
	badges: String,
	student_id: String,
	group: String,
	grade: String,
	turn: String,
	career: String
	/*role:
        guest
        student
        graduated
        teacher
        principal
        dev
        mod
        admin
    */
});

module.exports = mongoose.model('User', UserSchema);