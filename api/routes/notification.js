'use strict'
const express = require('express');
const NotificationController = require('../controllers/notification');

const api = express.Router();
const md_auth = require('../middlewares/authenticated');

api.get('/notification-test', md_auth.verifyAuth, NotificationController.notificationTest);
api.get('/notifications/:page?', md_auth.verifyAuth, NotificationController.getNotifications);

module.exports = api;