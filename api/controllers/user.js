'use strict'
const bcrypt = require('bcrypt-nodejs');
const User = require('../models/user');
const Follow = require('../models/follower_followed');
const Student = require('../models/student');
const jwt = require('../services/jwt');
const fs = require('fs');
const path = require('path');

function err0r(res, statusCode, msg) {
    if (!statusCode) {
        statusCode = 500;
    }
    if (!msg) {
        msg = 'ERR0R';
    }
    res.status(statusCode).send({
        message: msg
    });
}

function userTest(req, res) {
    res.status(200).send({
        message: 'Beep. Boop. User test.'
    });
}

function saveUser(req, res) {
    const today = new Date();
    const dd = today.getDate() < 10 ? '0' + today.getDate() : today.getDate();
    const mm = today.getMonth() + 1 < 10 ? '0' + today.getMonth() + 1 : today.getMonth() + 1;
    const yyyy = today.getFullYear();
    const currentDay = dd + '/' + mm + '/' + yyyy;
    const params = req.body;
    let user = new User();
    let student = new Student();
    //TODO: Create a username/nick blacklist (profanity/false identity filter)
    //TODO: 
    if (params.names && params.fst_surname && params.snd_surname &&
        params.unique_nick && params.email && params.password) {
        user.names = params.names;
        user.fst_surname = params.fst_surname;
        user.snd_surname = params.snd_surname;
        user.unique_nick = params.unique_nick.toLowerCase();
        user.email = params.email;
        user.birthday = params.birthday;
        user.gender = params.gender;
        user.role = 'student';
        user.avatar = 'default-avatar.png';
        user.banner = null;
        user.about = null;
        user.badges = null;
        user.join_date = currentDay;
        //TODO: Find a way to verify if the user data matches an existing user from the school DB
        User.find({
            $or: [{
                    unique_nick: user.unique_nick
                },
                {
                    email: user.email.toLowerCase()
                }
            ]
        }).exec((err, users) => {
            if (err) return err0r(res, 500, 'ERR0R en la petición de datos.');
            if (users && users.length >= 1) {
                return err0r(res, 400, 'ERR0R. Ya existe un usuario con los mismos datos.');
            } else {
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;
                    user.save((err, userStored) => {
                        if (err) return err0r(res, 500);
                        if (userStored) {
                            if (params.isStudent) {
                                student.user_id = userStored._id;
                                student.group = params.group;
                                student.grade = params.grade;
                                student.save();
                            }
                            res.status(200).send({
                                user: userStored
                            });
                            console.log(`||==Usuario creado: ${params.unique_nick}`);
                        } else {
                            return err0r(res, 404, 'ERR0R. No se pudo registrar el usuario.');
                        }
                    });
                });
            }
        });
    } else {
        return err0r(res, 400, 'ERR0R. Por favor completa los campos obligatorios.');
    }
}

function loginUser(req, res) {
    const params = req.body;
    const email = params.email;
    const password = params.password;
    User.findOne({
        email: email
    }, (err, user) => {
        if (err) return err0r(res, 500);
        if (user) {
            bcrypt.compare(password, user.password, (err, success) => {
                if (success) {
                    if (params.getToken) {
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        user.password = undefined;
                        return res.status(200).send({
                            user
                        });
                    }
                } else {
                    return err0r(res, 400, 'ERR0R. Contraseña incorrecta.');
                }
            });
        } else {
            return err0r(res, 400, 'ERR0R. Datos incorrectos o inexistentes.');
        }
    });
}
//Get user data
function getUser(req, res) {
    const userId = req.params.id;

    User.findById(userId, (err, user) => {
        if (err) return err0r(res);
        if (!user) return err0r(res, 404, 'ERR0R. Este usuario no existe.');
        //Check if im following <this> user, and if the user is following me
        followCheck(req.user.sub, userId).then((result) => {
            res.status(200).send({
                user,
                following: result.following,
                followsMe: result.followsMe
            });
        });
    });
}
async function followCheck(me, user) {
    let following = await Follow.findOne({
        'follower': me,
        'followed': user
    }).exec().then((following) => {
        return following;
    });
    let followsMe = await Follow.findOne({
        'follower': user,
        'followed': me
    }).exec().then((followsMe) => {
        return followsMe;
    });
    return {
        following: following,
        followsMe: followsMe
    }
}

function getUsers(req, res) {
    const userIdentity = req.user.sub;
    let page = 1
    if (req.params.page) {
        page = req.params.page;
    }
    const itemsPerPage = 5;
    User.find({}, null, {
        skipt: ((itemsPerPage * page) - page),
        limit: itemsPerPage
    }, (err, users) => {
        if (err) return err0r(res);
        if (!users) return err0r(res, 404, 'ERR0R. No hay usuarios.');
        User.countDocuments((err, total) => {
            if (err) return err0r(res);
            /*followUserIds(identify_user_id).then((value) => {*/
            return res.status(200).send({
                /*users_following: value.following,
                users_follow_me: value.followed,*/
                total,
                pages: Math.ceil(total / itemsPerPage),
                users
            });
        });
    });
}
async function followUserIds(userId) {
    let following = await Follow.find({
        'user': userId
    }).select('')
}

function updateUser(req, res) {
    const userId = req.params.id;
    const update = req.body;
    delete update.password;
    if (userId != req.user.sub) return err0r(res, 500, 'ERR0R. No tienes permiso para hacer esto.');
    User.findOneAndUpdate(userId, update, {
        new: true
    }, (err, userUpdated) => {
        if (err) return err0r(res);
        if (!userUpdated) return err0r(res, 404, 'ERR0R. No se ha podido actualizar el usuario');
        return res.status(200).send({
            user: userUpdated
        });
    });
}

function uploadAvatar(req, res) {
    const userId = req.params.id;
    if (req.files) {
        const file_path = req.files.avatar.path;
        const file_split = file_path.split('\\');
        const file_name = file_split[2];
        const ext_split = file_name.split('\.');
        const file_ext = ext_split[1];
        console.log(file_path);
        if (userId != req.user.sub) {
            return RemoveUploadFiles(res, file_path, 'ERR0R. No tienes permiso para hacer esto.');
        }
        if (file_ext == 'jpg' ||
            file_ext == 'jpeg' ||
            file_ext == 'png') {
            User.findById(userId, 'avatar', (err, result) => {
                let userAvatar = result.avatar;
                if (userAvatar != "default-avatar.png") {
                    fs.unlinkSync('./uploads/users/' + userAvatar);
                }
                User.findOneAndUpdate(userId, {
                    avatar: file_name
                }, {
                    new: true
                }, (err, userUpdated) => {
                    if (err) return err0r(res);
                    if (!userUpdated) return err0r(res, 404, 'ERR0R. No se ha podido actualizar el usuario');
                    return res.status(200).send({
                        user: userUpdated
                    });
                })
            });
        } else {
            return RemoveUploadFiles(res, file_path, 'ERR0R. Solo puedes subir archivos en formato; .jpg .jpeg ó .png');
        }

    } else {
        return err0r(res, 400, 'ERR0R. No se ha recibido ninguna imagen.');
    }
}

function RemoveUploadFiles(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(403).send({
            message: message
        });
    });
}

function getAvatarFile(req, res) {
    let avatar_file = req.params.avatarFile;
    let path_file = './uploads/users/' + avatar_file;
    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            return err0r(res, 404, 'ERR0R. No existe esta imagen');
        }
    });
}

function updatePass(req, res) {

}
module.exports = {
    userTest,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    updateUser,
    uploadAvatar,
    getAvatarFile,
    updatePass
}