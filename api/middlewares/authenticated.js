'use strict';
const jwt = require('jwt-simple');
const moment = require('moment');
const key = 'SuperSecretKey_WhyAreYouViewingThis?';

exports.verifyAuth = function (req, res, next) {
	if (!req.headers.authorization) {
		return res.status(403).send({
			message: 'Petición denegada.'
		});
	}
	let token = req.headers.authorization.replace(/['"]/g, '');
	try {
		var payload = jwt.decode(token, key);
		if (payload.exp <= moment().unix()) {
			return res.status(401).send({
				message: 'Tu token ha expirado.'
			});
		}
	} catch (ex) {
		return res.status(401).send({
			message: 'Tu token no es valido.'
		});
	}
	req.user = payload;
	next();
};