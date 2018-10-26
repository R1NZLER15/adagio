'use strict'
const bcrypt = require('bcrypt-nodejs');
const User = require('../models/user');
const jwt = require('../services/jwt');

function home(req, res) {
    res.status(200).send({
        message: 'Hola'
    });
}

function test(req, res) {
    res.status(200).send({
        message: 'Beep. Boop.'
    });
}

function saveUser(req, res) {
    var today = new Date();
    var dd = today.getDate() < 10 ? '0' + today.getDate() : today.getDate();
    var mm = today.getMonth() + 1 < 10 ? '0' + today.getMonth() + 1 : today.getMonth() + 1;
    var yyyy = today.getFullYear();
    var currentDay = dd + '/' + mm + '/' + yyyy;
    var params = req.body;
    let user = new User();
    if (params.names && params.fst_surname && params.snd_surname &&
        params.unique_nick && params.email && params.password &&
        params.group && params.grade) {
        user.names = params.names;
        user.fst_surname = params.fst_surname;
        user.snd_surname = params.snd_surname;
        user.unique_nick = params.unique_nick.toLowerCase();
        user.email = params.email;
        user.birthday = params.birthday;
        user.gender = params.gender;
        user.role = 'student';
        user.avatar = null;
        user.banner = null;
        user.about = null;
        user.group = params.group.toUpperCase();;
        user.grade = params.grade;
        user.badges = null;
        user.student_id = null;
        /* 
        TODO: Find a way to verify the student_id (matricula)
        */
        user.join_date = currentDay;
        User.find({
            $or: [{
                    unique_nick: user.unique_nick
                },
                {
                    email: user.email.toLowerCase()
                }
            ]
        }).exec((err, users) => {
            if (err) {
                return res.status(500).send({
                    message: 'ERR0R en la petición de datos.'
                });
            }
            if (users && users.length >= 1) {
                return res.status(400).send({
                    message: 'Ya existe un usuario con los mismos datos.'
                });
            } else {
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;
                    user.save((err, userStored) => {
                        if (err) return res.status(500).send({
                            message: 'ERR0R. Contacta al administrador.'
                        });
                        if (userStored) {
                            res.status(200).send({
                                user: userStored
                            });
                            console.log(`||==Usuario creado: ${params.unique_nick}`);
                        } else {
                            res.status(404).send({
                                message: 'ERR0R. No se pudo registrar el usuario.'
                            });
                        }
                    });
                });
            }
        });
    } else {
        res.status(400).send({
            message: 'Por favor completa los campos obligatorios.'
        });
    }
}

function loginUser(req, res) {
    let params = req.body;
    let email = params.email;
    let password = params.password;

    User.findOne({
        email: email
    }, (err, user) => {
        if (err) return res.status(500).send({
            message: `ERR0R. Contacta al administrador.`
        });
        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {
                    //TODO: Return user data with token
                    if (params.getToken) {
                        res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        user.password = undefined;
                        return res.status(200).send({
                            user
                        });
                    }
                } else {
                    return res.status(400).send({
                        message: `Contraseña incorrecta.`
                    })
                }
            })
        } else {
            return res.status(400).send({
                message: `Datos incorrectos o inexistentes.`
            });
        }
    });
}
//Get user data
function getUser(req, res) {
    let userId = req.params.id;
    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({
            message: 'ERR0R'
        });
        if (!user) return res.status(404).send({
            message: 'Éste usuario no existe.'
        });
        return res.status(200).send({
            user
        });
    });
}

function getUsers(req, res) {
    let userIdentity = req.user.sub;
    let page = 1
    if (req.params.page) {
        page = req.params.page;
    }
    let itemsPerPage = 5;
    User.find({}, null, {
        skipt: ((itemsPerPage * page) - page),
        limit: itemsPerPage
    }, (err, users) => {
        if (!users)
            if (err) return res.status(404).send({
                message: 'ERR0R. No hay usuarios.'
            });
        User.countDocuments((err, total) => {
            if (err) return res.status(500).send({
                message: 'ERR0R'
            });
            /*followUserIds(identify_user_id).then((value) => {*/
            return res.status(200).send({
                users,
                /*users_following: value.following,
                users_follow_me: value.followed,*/
                total,
                pages: Math.ceil(total / itemsPerPage)
            });
        });
    });
}
module.exports = {
    home,
    test,
    saveUser,
    loginUser,
    getUser,
    getUsers
}