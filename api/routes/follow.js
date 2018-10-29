'use strict'
const express = require('express');
const FollowController = require('../controllers/follow');
const api = express.Router();
const md_auth = require('../middlewares/authenticated');

api.get('/follow-test', md_auth.verifyAuth, FollowController.followTest);
api.post('/follow', md_auth.verifyAuth, FollowController.saveFollow);
api.delete('/follow/:id', md_auth.verifyAuth, FollowController.deleteFollow);
api.get('/followed/:id?/:page?', md_auth.verifyAuth, FollowController.getUserFollows);
api.get('/follows/:id?/:page?', md_auth.verifyAuth, FollowController.getUserFollowers);
api.get('/my-follows/:followed?', md_auth.verifyAuth, FollowController.getFollows);

module.exports = api;