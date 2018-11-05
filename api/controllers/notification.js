'use strict'
const Notification = require('../models/notification');

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

function notificationTest(req, res) {
    res.status(200).send({
        message: 'Beep. Boop. Notification test.',
        userId: req.user.sub
    });
}

function getNotifications(req, res) {
    const userId = req.body.sub;
    let page = 1;
    if (req.params.page) {
        page = parseInt(req.params.page);
    }
    const itemsPerPage = 5;
    Notification.find({
        'receiver_id': userId
    }, null, {
        skip: (itemsPerPage * (page - 1)),
        limit: itemsPerPage
    }, (err, success) => {
        if (err) return err0r(res,500,err);
        if (!success) return err0r(res,404, 'No tienes ninguna notificación.');
        res.status(200).send({
            success
        });
    });
}

function dimissNotification(req, res) {
    notificationId = req.params.notification_id;
    Notification.findByIdAndUpdate(notificationId, {
        $set: {
            'viewed': true
        }
    });
}

module.exports = {
    notificationTest,
    getNotifications,
    dimissNotification
}