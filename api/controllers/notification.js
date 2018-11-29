'use strict';
const Notification = require('../models/notification');

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

function notificationTest(req, res) {
	res.status(200).send({
		message: 'Beep. Boop. Notification test.',
		userId: req.user.sub
	});
}

function getNotifications(req, res) {
	const userId = req.user.sub;
	let page = 1;
	if (req.params.page) {
		page = parseInt(req.params.page);
	}
	const itemsPerPage = 5;
	Notification.find({
		'receiver_id': userId
	}, null, {
		skip: (itemsPerPage * (page - 1)),
		limit: itemsPerPage
	}, (err, notifications) => {
		Notification.countDocuments({
			'receiver_id': userId
		}, (err, total) => {
			if (err) return err0r(res, 500, err);
			res.status(200).send({
				total: total,
				pages: Math.ceil(total / itemsPerPage),
				page: page,
				notifications
			});
		});
	}).sort('-created_at').populate({
		path: 'emitter_id',
		select: '-password'
	});
}

function getUnviewedNotifications(req, res) {
	const userId = req.user.sub;
	Notification.countDocuments({
		'receiver_id': userId,
		'viewed': false
	}, (err, total) => {
		if (err) return err0r(res, 500, err);
		res.status(200).send({
			notifications: total
		});
	});
}

function dimissNotification(req, res) {
	const notificationId = req.params.notification_id;
	Notification.findByIdAndUpdate(notificationId, {
		$set: {
			'viewed': true
		}
	}, {
		'new': true
	}, (err, dimissedNotification) => {
		if (err) return err0r(res);
		res.status(200).send({
			dimissedNotification: dimissedNotification
		});
	});
}

module.exports = {
	notificationTest,
	getNotifications,
	getUnviewedNotifications,
	dimissNotification
};