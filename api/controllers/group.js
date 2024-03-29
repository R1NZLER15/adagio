'use strict';
const User = require('../models/user');
const Group = require('../models/group');
const GroupJoinRequest = require('../models/group_join_request');
const GroupMember = require('../models/group_member');
const Notification = require('../models/notification');
const moment = require('moment');
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

function saveGroup(req, res) {
	const userId = req.user.sub;
	const today = new Date();
	const dd = today.getDate() < 10 ? '0' + today.getDate() : today.getDate();
	const mm = today.getMonth() + 1 < 10 ? '0' + today.getMonth() + 1 : today.getMonth() + 1;
	const yyyy = today.getFullYear();
	const currentDay = dd + '/' + mm + '/' + yyyy;
	const params = req.body;
	let group = new Group();
	if (params.name && params.type && params.privacy) {
		if (params.type == 'social' && !params.category) return err0r(res, 404, 'Por favor describe la categoria del grupo');
		group.name = params.name;
		group.type = params.type;
		group.privacy = params.privacy;
		if (params.type == 'social') {
			group.category = params.category;
		} else if (params.type == 'proyect') {
			group.category = null;
			group.privacy = 'private';
		}
		group.cover = 'default-group-cover.png';
		group.banner = 'default-group-banner.png';
		User.findById(userId, (err, result) => {
			if (err) return err0r(res);
			group.group_admin = result;
		});
		group.created_at = currentDay;
		Group.find({
			group_link: params.group_link
		}).exec((err, result) => {
			if (err) return err0r(res);
			if (result && result.length > 1) {
				return err0r(res, 403, 'ERR0R. Ya existe un grupo con este identificador');
			} else {
				group.group_link = params.group_link;
				group.save((err, success) => {
					if (err) return err0r(res);
					res.status(200).send({
						success
					});
				});
			}
		});
	}
}

function uploadGroupAvatar(req, res) {

}

function uploadGroupCover(req, res) {

}

function RemoveUploadMediaFiles(res, file_path, message) {
	fs.unlink(file_path, (err) => {
		if (err) return err0r(res, 404, 'ERR0R 404.');
		if (message) {
			return res.status(403).send({
				message: message
			});
		}
	});
}

function updateGroup(req, res) {
	const params = req.body;
	const userId = req.user.sub;
	const groupId = params.group_id;
	Group.findById(groupId, (err, group) => {
		if (err) return err0r(res, 500, err);
		if (!group) return err0r(res, 404, 'ERR0R. Este grupo no existe');
		if (userId != group.group_admin) return err0r(res, 403, 'Acceso denegado');
		Group.findByIdAndUpdate(groupId, {
			'name': params.name,
			'privacy': params.privacy,
			'description': params.description,
			'category': params.category
		});
	});
}

function deleteGroup(req, res) {
	const groupId = req.params.group_id;
	const userId = req.user.sub;
	Group.findOneAndDelete({
		'_id': groupId,
		'group_admin': userId
	}, (err, success) => {
		if (err) return err0r(res);
		if (!success) return err0r(res, 403, 'No tienes permiso para hacer esto.');
		return res.status(200).send({
			message: 'Grupo eliminado.'
		});
	});
}

function joinGroup(req, res) {
	let params = req.body;
	let userId = req.user.sub;
	let groupId = params.group_id;
	Group.findById(groupId, (err, group) => {
		if (err) return err0r(res, 500, err);
		if (!group) return err0r(res, 404, 'ERR0R. Este grupo no existe.');
		if (group.privacy == 'private') {
			return joinGroupRequest(res, userId, groupId);
		}
		GroupMember.findOne({
			'user_id': userId,
			'group_id': groupId
		}, (err, exists) => {
			if (err) return err0r(res, 500, err);
			if (exists) return err0r(res, 403, 'Ya eres miembro de este grupo.');
			else {
				let newMember = new GroupMember();
				newMember.user_id = userId;
				newMember.group_id = groupId;
				newMember.save((err, success) => {
					if (err) return err0r(res, 500, err);
					return res.status(201).send({
						success
					});
				});
			}
		});
	});
}

function joinGroupRequest(res, userId, groupId) {
	let newRequest = new GroupJoinRequest();
	newRequest.user_id = userId;
	newRequest.groupId = groupId;
	newRequest.created_at = moment().unix();
	newRequest.save((err, requestSaved) => {
		if (err) return err0r(res);
		res.status(201).send({
			requestSaved
		});
	});
}

function getJoinGroupRequests(req, res) {
	const itemsPerPage = 5;
	let page = 1;
	if (req.params.page) {
		page = parseInt(req.params.page);
	}
	const userId = req.user.sub;
	const groupId = req.params.group_id;
	Group.findById(groupId, (err, group) => {
		if (err) return err0r(res);
		if (group.group_admin != userId) return err0r(res, 403, 'Acceso denegado.');
		GroupJoinRequest.find({
			'group_id': groupId
		}, null, {
			skip: (itemsPerPage * (page - 1)),
			limit: itemsPerPage
		}, (err, requests) => {
			if (err) return err0r(res);
			GroupJoinRequest.countDocuments({
				'group_id': groupId
			}, (err, total) => {
				if (err) return err0r(res);
				res.status(200).send({
					total: total,
					pages: Math.ceil(total / itemsPerPage),
					page: page,
					requests: requests
				});
			});
		}).sort('-created_at').populate({
			path: 'user_id',
			select: '-password'
		});
	});
}

function interactJoinRequest(req, res) {
	const groupId = req.params.group_id;
	const requestId = req.params.request_id;
	const decision = req.params.decision;
	const userId = req.user.sub;
	Group.findById(groupId, (err, group) => {
		if (err) return err0r(res);
		if (!group) return err0r(res, 404);
		if (group.group_admin != userId) return err0r(res, 403, '¡Acceso denegado!');
		GroupJoinRequest.findById(requestId, (err, request) => {
			if (err) return err0r(res);
			if (!request) return err0r(res, 404, 'No existe esta solicitud');
			if (decision == 'true') {
				const aprovedUserId = request.user_id;
				return aproveRequest(res, aprovedUserId, groupId);
			}
			if (decision == 'false') {
				const rejectedUserId = request.user_id;
				return rejectRequest(res, rejectedUserId, groupId);
			}
		});
	});
}

function aproveRequest(res, aprovedUserId, groupId) {
	GroupMember.findOne({
		'user_id': aprovedUserId,
		'group_id': groupId
	}, (err, exists) => {
		if (err) return err0r(res, 500, err);
		if (exists) return err0r(res, 403, 'Este usuario ya es miembro del grupo.');
		else {
			let newMember = new GroupMember();
			newMember.user_id = aprovedUserId;
			newMember.group_id = groupId;
			newMember.save((err, success) => {
				if (err) return err0r(res, 500, err);
				return res.status(201).send({
					success
				});
			});
		}
	});
}

function rejectRequest(res, rejectedUserId, groupId) {
	GroupJoinRequest.findOneAndDelete({
		'user_id': rejectedUserId,
		'group_id': groupId
	}, (err, success) => {
		if (err) return err0r(res);
		if (success) return res.stats(200).send({
			message: 'Usuario rechazado.'
		});
	});
}

function leaveGroup(req, res) {
	let params = req.body;
	let userId = req.user.sub;
	let groupId = params.group_id;
	GroupMember.findOneAndDelete({
		'user_id': userId,
		'group_id': groupId
	}, (err, success) => {
		if (err) return err0r(res, 500, err);
		if (!success) return err0r(res, 403, 'No puedes abandonar este grupo porque ni siquiera eres parte de el... -.-');
		res.status(200).send({
			message: 'Has abandonado este grupo'
		});
	});
}

function deleteGroupMember(req, res) {
	let params = req.body;
	let userId = req.user.sub;
	let groupId = params.group_id;
	let groupMember = params.group_member;
	Group.findOne({
		'_id': groupId,
		'group_admin': userId
	}, (err, success) => {
		if (err) return err0r(res, 500, err);
		if (!success) return err0r(res, 403, 'Acceso denegado.');
		GroupMember.findOneAndDelete({
			'group_id': groupId,
			'user_id': groupMember
		}, (err, found) => {
			if (err) return err0r(res, 500, err);
			if (!found) return err0r(res, 404, 'No se encontró a este miembro');
			res.status(200).send({
				message: `Usuario ${groupMember} eliminado del grupo.`
			});
		});
	});
}

function inviteUser(req, res) {
	const userId = req.user.sub;
	const invitedUserId = req.params.invited_user_id;
	const groupId = req.params.group_id;
	if (!invitedUserId) return err0r(res, 403, 'Ingresa el id del usuario que deseas invitar.');
	User.findById(invitedUserId, (err, user) => {
		if (err) return err0r(res, 500, err);
		if (!user) return err0r(res, 404, 'ERR0R. Este usuario no existe.');
	});
	Group.findById(groupId, (err, group) => {
		if (err) return err0r(res, 500, err);
		if (!group) return err0r(res, 404, 'ERR0R. Este grupo no existe.');
		if (group.privacy == 'private' && group.group_admin != userId) return err0r(res, 403, 'Solo el administrador puede invitar usuarios.');
		let newMember = new GroupMember();
		newMember.user_id = invitedUserId;
		newMember.group_id = groupId;
		newMember.save((err, success) => {
			const notification = new Notification();
			notification.receiver_id = invitedUserId;
			notification.emitter_id = userId;
			notification.text = `El usuario ${req.user.unique_nick} te ha invitado al grupo ${group.name}.`;
			notification.link = `/group/${group._id}`;
			notification.type = 'invitación_grupo';
			notification.created_at = moment().unix();
			notification.viewed = false;
			notification.save();
			if (err) return err0r(res, 500, err);
			res.status(201).send({
				success
			});
		});
	});
}

function saveProjectCountdown(req, res) {

}

function saveProjectTaskList(req, res) {
	//create a task list
}

function saveProjectTasks(req, res) {
	//add tasks to the task list
}

function deleteProjectTasks(req, res) {
	//i dont need to explain this...
}

module.exports = {
	groupTest,
	saveGroup,
	uploadGroupAvatar,
	uploadGroupCover,
	updateGroup,
	deleteGroup,
	joinGroup,
	joinGroupRequest,
	getJoinGroupRequests,
	interactJoinRequest,
	leaveGroup,
	deleteGroupMember,
	inviteUser,
	saveProjectCountdown,
	saveProjectTaskList,
	saveProjectTasks,
	deleteProjectTasks
};