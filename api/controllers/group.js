'use strict'
const User = require('../models/user');
const Group = require('../models/group');
const fs = require('fs');
const path = require('path');

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

function groupTest(req, res) {
    res.status(200).send({
        message: 'Beep. Boop. Group test.'
    });
}

function saveGroup(res, req) {

}

function updateGroup(req, res) {

}

function deleteGroup(req, res) {

}

function joinGroup(req, req) {

}

function leaveGroup(res, req) {

}

function deleteGroupMember(res, req) {

}

module.exports = {
    groupTest,
    saveGroup
}