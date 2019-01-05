'use strict';
const express = require('express');
const TokenController = require('../controllers/token');
const api = express.Router();
const md_auth = require('../middlewares/authenticated');

api.get('/token-test', md_auth.verifyAuth, TokenController.tokenTest);
api.post('/generate-tokens', md_auth.verifyAuth, TokenController.saveToken);

module.exports = api;