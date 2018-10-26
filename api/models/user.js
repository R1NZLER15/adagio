'use strict'
const mongoose = require('mongoose');
const Schema =  mongoose.Schema;

var UserSchema = new Schema({
    student_id: String,
    names: String,
    fst_surname: String,
    snd_surname: String,
    unique_nick: String,
    email: String,
    gender: String,
    password: String,
    avatar: String,
    banner: String,
    about_me: String,
    group: String,
    grade: String,
    join_date: String,
    birthday: String,
    role: String,
    badges: String
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