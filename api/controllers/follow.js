'use strict'
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const User = require('../models/user');
const Follow = require('../models/follower_followed');

function followTest(req, res) {
    res.status(200).send({
        message: 'Beep Boop. Follow test.'
    })
}

function saveFollow(req, res) {
    const params = req.body;
    let follow = new Follow();
    follow.follower = req.user.sub;
    follow.followed = params.followed;
    if (req.user.sub == params.followed) return err0r(res, 403, 'ERR0R. No te puedes seguir a ti mismo.');
    Follow.findOne({
        'follower': follow.follower,
        'followed': follow.followed
    }, (err, result) => {
        if (result) return err0r(res, 404, 'ERR0R. Ya existe este seguimiento');
        follow.save((err, followStored) => {
            if (err) return err0r(res);
            if (!followStored) return err0r(res, 404);
            return res.status(200).send({
                follow: followStored
            });
        });
    });
}

function deleteFollow(req, res) {
    const userId = req.user.sub;
    const followedId = req.params.id;
    Follow.findOneAndDelete({
        'follower': userId,
        'followed': followedId
    }, (err, result) => {
        if (err) return err0r(res);
        if (!result) return err0r(res, 500, 'ERR0R. No existe este seguimiento');
        return res.status(200).send({
            message: 'Se ha eliminado este seguimiento'
        });
    });
}

//Users that a cartain user follows
function getUserFollows(req, res) {
    let userId = req.user.sub;
    if (req.params.id && req.params.page) {
        userId = req.params.id
    }
    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    let itemsPerPage = 5;
    Follow.findOne({
        followed: userId
    }, null, {
        skipt: ((itemsPerPage * page) - page),
        limit: itemsPerPage
    }, (err, follows) => {
        if (err) return err0r(res);
        if (!follows) return err0r(res, 404, 'ERR0R. No estás siguiendo a ningun usuario.');
        Follow.countDocuments((err, total) => {
            if (err) return err0r(res);
            return res.status(200).send({
                total,
                pages: Math.ceil(total / itemsPerPage),
                follows
            });
        });
    }).populate({
        path: 'follower'
    });
}

//Users that follow a certain user
function getUserFollowers(req, res) {
    let userId = req.user.sub;
    if (req.params.id && req.params.page) {
        userId = req.params.id
    }
    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    let itemsPerPage = 5;
    Follow.findOne({
        follower: userId
    }, null, {
        skipt: ((itemsPerPage * page) - page),
        limit: itemsPerPage
    }, (err, follows) => {
        if (err) return err0r(res);
        if (!follows) return err0r(res, 404, 'ERR0R. Ningun usuario te sigue.');
        Follow.countDocuments((err, total) => {
            if (err) return err0r(res);
            return res.status(200).send({
                total,
                pages: Math.ceil(total / itemsPerPage),
                follows
            });
        });
    }).populate({
        path: 'follower'
    });
}


function getFollows(req, res) {
    let userId = req.user.sub;
    //Get users that i follow (without pagination)
    let find = Follow.find({
        follower: userId
    });
    // If true; get users that follow me (without pagination)
    if (req.params.followed) {
        find = Follow.find({
            followed: userId
        });
    }
    find.populate('follower followed').exec((err, follows) => {
        if (err) return err0r(res);
        if (!follows) return err0r(res, 404);
        return res.status(200).send({
            follows
        });
    });
}

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
module.exports = {
    followTest,
    saveFollow,
    deleteFollow,
    getUserFollows,
    getUserFollowers,
    getFollows
}