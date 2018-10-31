'use strict'
const express = require('express');
const PublicationController = require('../controllers/publication');

const api = express.Router();
const md_auth = require('../middlewares/authenticated');

const multipart = require('connect-multiparty');
const md_upload = multipart({
    uploadDir: './uploads/publications'
});

api.get('/publication-test', md_auth.verifyAuth, PublicationController.publicationTest);
module.exports = api;