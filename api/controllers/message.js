'use strict'
const Message = require('../models/message');
const User = require('../models/user');
const Follow = require('../models/follower_followed');
const moment = require('moment');

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

function messageTest(req, res) {
    res.status(200).send({
        message: 'Beep. Boop. Notification test.',
        userId: req.user.sub,
        userNick: req.user.unique_nick,
        userRole: req.user.role
    });
}

function saveMessage(req, res) {
    let params = req.body;
    let receiverId = params.receiver_id;
    if (receiverId == req.user.sub) return err0r(res, 403, 'ERR0R. Actualmente no te puedes enviar mensajes a ti mismo.');
    if (receiverId != undefined) {
        if (params.text_field || req.files.media_field) {
            User.findById(receiverId, (err, success) => {
                if (err) return err0r(res, 500, err);
                if (!success) return err0r(res, 404, 'No existe este usuario');
                let message = new Message();
                if (params.text_field) {
                    message.text_field = params.text_field;
                }
                if (req.files.media_field) {
                    const file_path = req.files.media_field.path;
                    const file_split = file_path.split('\\');
                    const file_name = file_split[2];
                    const ext_split = file_name.split('\.');
                    const file_ext = ext_split[1];
                    if (file_ext == 'jpg' ||
                        file_ext == 'jpeg' ||
                        file_ext == 'png' ||
                        file_ext == 'gif' ||
                        file_ext == 'mp4') {
                        message.media_field = file_name;
                    } else {
                        return RemoveUploadedMediaFiles(res, file_path, 'ERR0R. Solo puedes subir archivos en formato; .jpg .jpeg .png .gif ó .mp4');
                    }
                }
                message.emitter = req.user.sub;
                message.receiver = receiverId;
                message.created_at = moment().unix();
                message.viewed = false;
                message.save((err, messageSaved) => {
                    if (err) return err0r(res, 500, err);
                    return res.status(201).send({
                        messageSaved
                    });
                });
            });
        } else return err0r(res, 500, 'Por favor completa los campos requeridos.')
    } else return err0r(res, 500, 'Por favor ingresa el destinatario.')
}

function RemoveUploadedMediaFiles(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        if (message) {
            return res.status(403).send({
                message: message
            });
        }
    });
}

module.exports = {
    messageTest,
    saveMessage
}