'use strict';
const Token = require('../models/token');
const moment = require('moment');

const rand = 'OPQRSTUVWXYZABCDEFGHIJKLMN0123456789klmnopqrstuvwxyzabcdefghij';

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

function tokenTest(req, res) {
	const stamp = Date.now();
	res.status(200).send({
		message: 'Beep. Boop. Token test.',
		timeStamp: stamp,
		unixStamp: moment().unix(),
		stampLength: stamp.length 
	});
}

function saveToken(req, res) {
	const params = req.body;
	const total = params.total;
	const type = params.type;
	let x = 1;
	for(x;x<=total;x++) {
		const newToken = new Token();
		let stamp = Date.now().toString().slice(-8, -4);
		let last = rand.charAt(Math.floor(Math.random() * rand.length));
		newToken.token = `${rand.charAt(x)}${params.group}${stamp}${last}`;
		if(type === 'student' || type === 'teacher') {
			newToken.type = type;
		} else {
			return err0r(res, 400, 'Tipo invalido');
		}
		newToken.school = params.school;
		if(type === 'student') {
			newToken.turn = params.turn;
			newToken.grade = params.grade;
			newToken.group = params.group;
		}
		newToken.created_at = moment().unix();
		newToken.expires_at = moment().add(30, 'days').unix();
		console.log(newToken);
		newToken.save();
	}
}

module.exports = {
	tokenTest,
	saveToken
};