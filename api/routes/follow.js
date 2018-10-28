'use strict'
const express = require('express');
const FollowController = require('../controllers/follow');
const api = express.Router();
const md_auth = require('../middlewares/authenticated');

api.get('/follow-test', md_auth.verifyAuth, FollowController.followTest);
api.post('/follow', md_auth.verifyAuth, FollowController.saveFollow);

module.exports = api;