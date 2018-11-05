'use strict'
const express = require('express');
const MessageController = require('../controllers/message');

const api = express.Router();
const md_auth = require('../middlewares/authenticated');

const multipart = require('connect-multiparty');
const md_upload = multipart({
    uploadDir: './uploads/messages'
});

api.get('/message-test', md_auth.verifyAuth, MessageController.messageTest);
api.post('/save-message', [md_auth.verifyAuth, md_upload], MessageController.saveMessage)

module.exports = api;