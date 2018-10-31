'use strict'
const express = require('express');
const UserController = require('../controllers/user');

const api = express.Router();
const md_auth = require('../middlewares/authenticated');

const multipart = require('connect-multiparty');
const md_upload = multipart({
    uploadDir: './uploads/users'
});

api.get('/user-test', md_auth.verifyAuth, UserController.userTest);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.get('/user/:id', md_auth.verifyAuth, UserController.getUser);
api.get('/users/:page?', md_auth.verifyAuth, UserController.getUsers);
api.get('/get-stats/:id?', md_auth.verifyAuth, UserController.getStats);
api.put('/update-user/:id', md_auth.verifyAuth, UserController.updateUser);
api.post('/upload-user-avatar/:id', [md_auth.verifyAuth, md_upload], UserController.uploadAvatar);
api.get('/get-user-avatar/:avatarFile', UserController.getAvatarFile);

module.exports = api;