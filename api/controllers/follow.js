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
    Follow.findOne({
        'follower': follow.follower,
        'followed': follow.followed
    }, (err, result) => {
        if (result) return res.status(403).send({
            message: 'Ya existe este follow'
        });
        follow.save((err, followStored) => {
            if (err) return res.status(500).send({
                message: 'ERR0R'
            });
            if (!followStored) return res.status(404).send({
                message: 'ERR0R'
            });
            return res.status(200).send({
                follow: followStored
            });
        });
    });
}

module.exports = {
    followTest,
    saveFollow
}