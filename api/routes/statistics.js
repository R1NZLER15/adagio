'use strict';
const express = require('express');
const StatisticsController = require('../controllers/statistics');

const api = express.Router();
const md_auth = require('../middlewares/authenticated');

api.get('/stats-test', md_auth.verifyAuth, StatisticsController.statisticsTest);
api.get('/stats/:id?', md_auth.verifyAuth, StatisticsController.getStats);
api.get('/global-stats', md_auth.verifyAuth, StatisticsController.getGlobalStats);

module.exports = api;