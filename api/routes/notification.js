'use strict';
const express = require('express');
const NotificationController = require('../controllers/notification');

const api = express.Router();
const md_auth = require('../middlewares/authenticated');

api.get('/notification-test', md_auth.verifyAuth, NotificationController.notificationTest);
api.get('/notifications/:page?', md_auth.verifyAuth, NotificationController.getNotifications);
api.get('/unviewed-notifications/', md_auth.verifyAuth, NotificationController.getUnviewedNotifications);
api.get('/dimiss-notification/:notification_id', md_auth.verifyAuth, NotificationController.dimissNotification);

module.exports = api;