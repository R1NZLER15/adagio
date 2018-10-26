'use strict'
const express = require('express');
const UserController = require('../controllers/user');
const api = express.Router();
const md_auth = require('../middlewares/authenticated');

api.get('/home', md_auth.verifyAuth, UserController.home);
api.get('/test', md_auth.verifyAuth, UserController.test);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.get('/user/:id', md_auth.verifyAuth, UserController.getUser);
api.get('/users/:page?', md_auth.verifyAuth, UserController.getUsers);

module.exports = api;