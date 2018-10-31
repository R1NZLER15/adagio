'use strict'
const Publication = require('../models/publication');
const User = require('../models/user');
const Group = require('../models/group');
const Member_Group = require('../models/member_group');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

function err0r(res, statusCode, msg) {
    if (!statusCode) {
        statusCode = 500;
    }
    if (!msg) {
        msg = 'ERR0R';
    }
    res.status(statusCode).send({
        message: msg
    });
}

function publicationTest(req, res) {
    res.status(200).send({
        message: 'Beep. Boop. Publication test.'
    });
}

function savePublication(req, res){
    let params = req.body;
    if(!params.text || !params.media || !params.file) return err0r(res, 403);
    let publication = new Publication();
    publication.text = params.text;
    publication.media = params.media;
    publication.file = params.file;
    publication.user_id= req.user.sub;
    publication.created_at = moment().unix();
    publication.save();
}

/*function getFollowedPublications(req, res){
    Publication.find({user_id: {"$in": follows}}).sort('-created_at').populate('user_id').
}*/

module.exports = {
    publicationTest,
    savePublication,
    getPublications
}