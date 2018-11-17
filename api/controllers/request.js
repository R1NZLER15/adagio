'use strict';
const Request = require('../models/request');
const Notification = require('../models/notification');
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

function requestTest(req, res) {
	res.status(200).send({
		message: 'Beep. Boop. Request test.',
		userId: req.user.sub
	});
}

function saveRequest(req, res) {
	const params = req.body;
	const userId = req.user.sub;
	Request.findOne({
		'user_id': userId
	}, (err, result) => {
		if (err) return err0r(res, 500, err);
		if (result) return err0r(res, 403, 'Ya tienes una solicitud no puedes crear más.');
	});
	if (!params.career &&
		!params.group &&
		!params.turn &&
		!params.wants_career &&
		!params.wants_turn) return err0r(res, 403, 'Ingresa los campos necesarios.');
	const newRequest = new Request();
	newRequest.user_id = userId;
	newRequest.text_field = params.text_field;
	newRequest.career = params.career;
	newRequest.group = params.group;
	newRequest.grade = parseInt(params.grade);
	newRequest.turn = params.turn;
	newRequest.wants_career = params.wants_career;
	newRequest.wants_turn = params.wants_turn;
	newRequest.closed = false;
	newRequest.created_at = moment().unix();
	newRequest.save((err, success) => {
		if (err) return err0r(res, 500, err);
		return res.status(200).send({
			success
		});
	});
}

function updateRequest(req, res) {
	const userId = req.user.sub;
	const update = req.body;
	update.updated_at = moment().unix();
	delete update._id;
	delete update.user_id;
	delete update.created_at;
	const requestId = req.body.request_id;
	Request.findById(requestId, (err, requestFound)=>{
		if (err) return err0r(res, 500, err);
		if(!requestFound) return err0r(res, 404, 'ERR0R 404.');
		if(userId != requestFound.user_id) return err0r(res, 403, 'Accesso denegado.');
		Request.findByIdAndUpdate(requestId, update, (err, updatedRequest)=>{
			if (err) return err0r(res, 500, err);
			res.status(201).send({
				updatedRequest
			});
		});
	});
}

function deleteRequest(req, res) {
	const userId = req.user.sub;
	const requestId = req.body.request_id;
	Request.findById(requestId, (err, requestFound)=>{
		if (err) return err0r(res, 500, err);
		if(!requestFound) return err0r(res, 404, 'ERR0R 404.');
		if(userId != requestFound.user_id) return err0r(res, 403, 'Accesso denegado.');
		Request.findByIdAndDelete(requestId,(err)=>{
			if (err) return err0r(res, 500, err);
			res.status(201).send({
				message: 'Tu solicitud ha sido borrada.'
			});
		});
	});
}

function respondRequest(req, res) {
	const userId = req.user.sub;
	const requestId = req.body.request_id;
	Request.findById(requestId, (err, requestFound)=>{
		if (err) return err0r(res, 500, err);
		if(!requestFound) return err0r(res, 404, 'ERR0R 404.');
		const notification = new Notification();
		notification.receiver_id = requestFound.user_id;
		notification.emitter_id = userId;
		notification.text = `El usuario ${req.user.unique_nick} ha respondido tu solicitud.`;
		notification.link = `/requests/${requestId}`;
		notification.type = 'Respuesta solicitud';
		notification.created_at = moment().unix();
		notification.viewed = false;
		notification.save();
	});
}

function closeRequest(req, res) {
	const userId = req.user.sub;
	const requestId = req.body.request_id;
	Request.findById(requestId, (err, requestFound)=>{
		if (err) return err0r(res, 500, err);
		if(!requestFound) return err0r(res, 404, 'ERR0R 404.');
		if(userId != requestFound.user_id) return err0r(res, 403, 'Accesso denegado.');
		Request.findByIdAndUpdate(requestId, {'closed': true}, (err, closedRequest)=>{
			if (err) return err0r(res, 500, err);
			res.status(201).send({
				closedRequest
			});
		});
	});
}

module.exports = {
	requestTest,
	saveRequest,
	updateRequest,
	deleteRequest,
	respondRequest,
	closeRequest
};