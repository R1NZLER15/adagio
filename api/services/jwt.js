'use strict'
const jwt = require('jwt-simple');
const moment = require('moment');
const key = 'SuperSecretKey_WhyAreYouViewingThis?'

exports.createToken = function (user) {
    var payload = {
        sub: user._id,
        names: user.names,
        fst_surname: user.fst_surname,
        snd_surname: user.snd_surname,
        unique_nick: user.unique_nick,
        email: user.email,
        birthday: user.birthday,
        gender: user.gender,
        role: user.role,
        avatar: user.avatar,
        banner: user.banner,
        about: user.about,
        badges: user.badges,
        student_id: user.student_id,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix()
    }
    return jwt.encode(payload, key);
}