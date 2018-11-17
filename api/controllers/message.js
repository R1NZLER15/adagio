'use strict';
const Message = require('../models/message');
const User = require('../models/user');
//const Follow = require('../models/follower_followed');
const Conversation = require('../models/conversation');
const moment = require('moment');
const fs = require('fs');
//const path = require('path');

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

function messageTest(req, res) {
	res.status(200).send({
		message: 'Beep. Boop. Notification test.',
		userId: req.user.sub,
		userNick: req.user.unique_nick,
		userRole: req.user.role
	});
}

function saveMessage(req, res) {
	let params = req.body;
	let userId = req.user.sub;
	let receiverId = params.receiver_id;
	if (req.params.receiver_id) {
		receiverId = req.params.receiver_id;
	}
	if (receiverId == req.user.sub) return err0r(res, 403, 'ERR0R. Actualmente no te puedes enviar mensajes a ti mismo.');
	if (receiverId != undefined) {
		if (params.text_field || req.files.media_field) {
			User.findById(receiverId, (err, success) => {
				if (err) return err0r(res, 500, err);
				if (!success) return err0r(res, 404, 'No existe este usuario');
				let update = [];
				if (params.text_field) {
					update = {
						'last_message': params.text_field,
						'updated_at': moment().unix()
					};
				} else {
					update = {
						'updated_at': moment().unix()
					};
				}
				Conversation.findOne({
					$or: [{
						$and: [{
							'user_1': userId
						}, {
							'user_2': receiverId
						}]
					}, {
						$and: [{
							'user_1': receiverId
						}, {
							'user_2': userId
						}]
					}]
				}, (err, convFound) => {
					if (err) return err0r(res, 500, err);
					if (!convFound) {
						let newConv = new Conversation();
						newConv.user_1 = userId;
						newConv.user_2 = receiverId;
						if (params.text_field) {
							newConv.last_message = params.text_field;
						}
						newConv.updated_at = moment().unix();
						newConv.save();
					}
					Conversation.findOneAndUpdate({
						$or: [{
							$and: [{
								'user_1': userId
							}, {
								'user_2': receiverId
							}]
						}, {
							$and: [{
								'user_1': receiverId
							}, {
								'user_2': userId
							}]
						}]
					}, update);
				});
				let message = new Message();
				if (params.text_field) {
					message.text_field = params.text_field;
				} else if (req.files.media_field) {
					const file_path = req.files.media_field.path;
					const file_split = file_path.split('//');
					const file_name = file_split[2];
					const ext_split = file_name.split('/.');
					const file_ext = ext_split[1];
					if (file_ext == 'jpg' ||
                        file_ext == 'jpeg' ||
                        file_ext == 'png' ||
                        file_ext == 'gif' ||
                        file_ext == 'mp4') {
						message.media_field = file_name;
					} else {
						return RemoveUploadedMediaFiles(res, file_path, 'ERR0R. Solo puedes subir archivos en formato; .jpg .jpeg .png .gif ó .mp4');
					}
				}
				message.emitter_id = userId;
				message.receiver_id = receiverId;
				message.created_at = moment().unix();
				message.viewed = false;
				message.save((err, messageSaved) => {
					if (err) return err0r(res, 500, err);
					return res.status(201).send({
						messageSaved
					});
				});
			});
		} else return err0r(res, 500, 'Por favor completa los campos requeridos.');
	} else return err0r(res, 500, 'Por favor ingresa el destinatario.');
}

function RemoveUploadedMediaFiles(res, file_path, message) {
	fs.unlink(file_path, (err) => {
		if(err) return err0r(res,500,err);
		if (message) {
			return res.status(403).send({
				message: message
			});
		}
	});
}

function getConversation(req, res) {
	let userId = req.user.sub;
	let otherUserId = req.params.other_user_id;
	let page = 1;
	let itemsPerPage = 10;
	if (req.params.page) {
		page = parseInt(req.params.page);
	}
	Message.find({
		$or: [{
			$and: [{
				'emitter_id': userId
			}, {
				'receiver_id': otherUserId
			}]
		},
		{
			$and: [{
				'emitter_id': otherUserId
			}, {
				'receiver_id': userId
			}]
		}
		]
	},
	null, {
		skip: (itemsPerPage * (page - 1)),
		limit: itemsPerPage
	},
	(err, messages) => {
		if (err) return err0r(res, 500, err);
		if (!messages) return err0r(res, 404, 'No tienes conversaciones con este usuario.');
		Message.countDocuments({
			$or: [{
				$and: [{
					'emitter_id': userId
				}, {
					'receiver_id': otherUserId
				}]
			},
			{
				$and: [{
					'emitter_id': otherUserId
				}, {
					'receiver_id': userId
				}]
			}
			]
		}, (err, total) => {
			if (err) return err0r(res, 500, err);
			Message.update({
				'emitter_id': otherUserId,
				'receiver_id': userId,
				'viewed': false
			}, {
				'viewed': true
			}, {
				'multi': true
			});
			res.status(200).send({
				total,
				pages: Math.ceil(total / itemsPerPage),
				page: page,
				messages
			});
		});
	}).sort('-created_at');
}

function getConversations(req, res) {
	let userId = req.user.sub;
	let itemsPerPage = 10;
	let page = 1;
	if (req.params.page) {
		page = req.params.page;
	}
	Conversation.find({
		$or: [{
			'user_1': userId
		}, {
			'user_2': userId
		}]
	}, null, {
		skip: (itemsPerPage * (page - 1)),
		limit: itemsPerPage
	}, (err, conversations) => {
		if (err) return err0r(res, 500, err);
		if (!conversations) return err0r(res, 404, 'No tienes conversaciones con otros usuarios.');
		Conversation.countDocuments({
			$or: [{
				'user_1': userId
			}, {
				'user_2': userId
			}]
		}, (err, total) => {
			res.status(200).send({
				total,
				pages: Math.ceil(total / itemsPerPage),
				page: page,
				messages: conversations
			});
		});
	}).sort('-updated_at');
}

module.exports = {
	messageTest,
	saveMessage,
	getConversation,
	getConversations
};