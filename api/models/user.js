'use strict'
const mongoose = require('mongoose');
const Schema =  mongoose.Schema;

var UserSchema = new Schema({
    names: String,
    fst_surname: String,
    snd_surname: String,
    unique_nick: String,
    gender: String,
    email: String,
    password: String,
    avatar: String,
    banner: String,
    join_date: Date,
    birthday: Date,
    role: String,
    badges: String
    /*ip: String*/
    /*roles:
        user
        teacher
        principal
        mod
        admin
        dev
    */
});

module.exports = mongoose.model('User', UserSchema);