'use strict'
const User = require('../models/user');
const bcrypt = require('bcrypt-nodejs');

function home(req, res){
    res.status(200).send({
        message: 'Hola'
    })
}
function test(req, res){
    res.status(200).send({
        message: 'Beep. Boop.'
    })
}
function saveUser(req, res){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();
    if(dd<10){dd = '0'+dd}
    if(mm<10){mm = '0'+mm}
    var currentDay = dd + '/' + mm + '/' + yyyy;
    var params = req.body;
    let user = new User();
    if(params.names && params.fst_surname && params.snd_surname && params.unique_nick && params.email && params.password){
        user.names = params.names;
        user.fst_surname = params.fst_surname;
        user.snd_surname = params.snd_surname;
        user.unique_nick = params.unique_nick;
        user.email = params.email;
        user.birthday = params.birthday;
        user.gender = params.gender;
        user.role = 'student';
        user.avatar = null;
        user.join_date = currentDay;
        User.find({ $or: [
            {nick: user.unique_nick.toLowerCase()},
            {email: user.email.toLowerCase()}
        ]}).exec((err,users) => {
            if(err){
                return res.status(500).send({
                    message: 'ERR0R en la petición de datos.'
                });
            }
            if(users && users.length >= 1){
                return res.status(400).send({
                    message: 'Ya existe un usuario con los mismos datos.'
                });
            }
        });
        bcrypt.hash(params.password, null, null, (err, hash) =>{
            user.password = hash;
            user.save((err, userStored) => {
                if(err) return res.status(500).send({
                    message: 'ERR0R. Contacta al administrador.'
                });
                if(userStored){
                    res.status(200).send({user: userStored});
                }else{res.status(404).send({
                    message: 'ERR0R. No se pudo registrar el usuario.'
                })}
            });
        });
    }else{
        res.status(400).send({
            message: 'Por favor completa los campos obligatorios.'
        });
    }
}
module.exports = {
    home,
    test,
    saveUser
}