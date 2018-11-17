'use strict';
const Follow = require('../models/follower_followed');
const Notification = require('../models/notification');
const moment = require('moment');

function followTest(req, res) {
	res.status(200).send({
		message: 'Beep Boop. Follow test.'
	});
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
		const notification = new Notification();
		notification.receiver_id = params.followed;
		notification.emitter_id = req.user.sub;
		notification.text = `El usuario ${req.user.unique_nick} te está siguiendo.`;
		notification.link = `/users/${req.user.sub}`;
		notification.type = 'Seguimiento';
		notification.created_at = moment().unix();
		notification.viewed = false;
		notification.save();
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

//Users that a certain user follows
function getUserFollows(req, res) {
	let userId = req.user.sub;
	let page = 1;
	if (req.params.id && req.params.page) {
		userId = req.params.id;
	}
	if (req.params.page) {
		page = parseInt(req.params.page);
	}
	let itemsPerPage = 5;
	Follow.find({
		follower: userId
	}, null, {
		skip: (itemsPerPage * (page - 1)),
		limit: itemsPerPage
	}, (err, follows) => {
		if (err) return err0r(res);
		if (!follows) return err0r(res, 404, 'ERR0R. No estás siguiendo a ningun usuario.');
		Follow.countDocuments({
			follower: userId
		}, (err, total) => {
			if (err) return err0r(res);
			return res.status(200).send({
				total,
				pages: Math.ceil(total / itemsPerPage),
				follows
			});
		});
	}).populate({
		path: 'followed',
		select: '-password'
	});
}

//Users that follow a certain user
function getUserFollowers(req, res) {
	let userId = req.user.sub;
	let page = 1;
	if (req.params.id && req.params.page) {
		userId = req.params.id;
	}
	if (req.params.page) {
		page = parseInt(req.params.page);
	}
	let itemsPerPage = 5;
	Follow.findOne({
		followed: userId
	}, null, {
		skip: (itemsPerPage * (page - 1)),
		limit: itemsPerPage
	}, (err, follows) => {
		if (err) return err0r(res);
		if (!follows) return err0r(res, 404, 'ERR0R. Ningun usuario te sigue.');
		Follow.countDocuments({
			followed: userId
		}, (err, total) => {
			if (err) return err0r(res);
			return res.status(200).send({
				total,
				pages: Math.ceil(total / itemsPerPage),
				follows
			});
		});
	}).populate({
		path: 'follower',
		select: '-password'
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
};