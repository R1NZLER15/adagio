'use strict';
const bcrypt = require('bcrypt-nodejs');
const User = require('../models/user');
const Follow = require('../models/follower_followed');
const jwt = require('../services/jwt');
const fs = require('fs');
const path = require('path');
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

function userTest(req, res) {
	res.status(200).send({
		message: 'Beep. Boop. User test.'
	});
}

function saveUser(req, res) {
	const params = req.body;
	let user = new User();
	//TODO: Create a username/nick blacklist (profanity/false identity filter)
	//TODO: 
	if (params.names && params.unique_nick && params.email && params.password) {
		user.names = params.names;
		user.fst_surname = params.fst_surname;
		user.snd_surname = params.snd_surname;
		user.unique_nick = params.unique_nick;
		user.email = params.email;
		user.birthday = params.birthday;
		user.gender = params.gender;
		if (params.role === 'student') {
			user.role = 'student';
			user.student_id = null;
			user.group = params.group;
			user.grade = params.grade;
			user.career = params.career;
			user.turn = params.career;
		} else if (params.role === 'graduated'){
			user.role = 'graduated';
			user.career = params.career;
			user.group = params.group;
		} else {
			user.role = 'guest';
		}
		user.avatar = 'default-avatar.png';
		user.cover = 'default-cover.png';
		user.about = '';
		user.join_date = moment().unix();
		//TODO: Find a way to verify if the user data matches an existing user from the school DB
		User.find({
			$or: [{
				'unique_nick': user.unique_nick.toLowerCase()
			}, {
				'email': user.email.toLowerCase()
			}]
		}).exec((err, users) => {
			if (err) return err0r(res, 500, 'ERR0R en la petición de datos.');
			if (users && users.length >= 1) {
				return err0r(res, 403, 'ERR0R. Ya existe un usuario con los mismos datos.');
			} else {
				bcrypt.hash(params.password, null, null, (err, hash) => {
					user.password = hash;
					user.save((err, userStored) => {
						if (err) return err0r(res, 500);
						if (userStored) {
							let follow = new Follow();
							follow.follower = userStored._id;
							follow.followed = '5c04aed81a52e3712841f28e';
							follow.save();
							res.status(200).send({
								user: userStored
							});
						} else {
							return err0r(res, 404, 'ERR0R. No se pudo registrar el usuario.');
						}
					});
				});
			}
		});
	} else {
		return err0r(res, 400, 'ERR0R. Por favor completa los campos obligatorios.');
	}
}

function loginUser(req, res) {
	const params = req.body;
	const email = params.email;
	const password = params.password;
	User.findOne({
		'email': email
	}, (err, user) => {
		if (err) return err0r(res, 500);
		if (user) {
			bcrypt.compare(password, user.password, (err, success) => {
				if (err) return err0r(res, 500, err);
				if (success) {
					if (params.gettoken) {
						return res.status(200).send({
							token: jwt.createToken(user)
						});
					} else {
						user.password = undefined;
						return res.status(200).send({
							user
						});
					}
				} else {
					return err0r(res, 400, 'ERR0R. Contraseña incorrecta.');
				}
			});
		} else {
			return err0r(res, 400, 'ERR0R. Datos incorrectos o inexistentes.');
		}
	});
}
//Get user data
function getUser(req, res) {
	const userId = req.params.id;

	User.findById(userId, (err, user) => {
		if (err) return err0r(res);
		if (!user) return err0r(res, 404, 'ERR0R. Este usuario no existe.');
		//Check if im following <this> user, and if the user is following me
		followCheck(req.user.sub, userId).then((result) => {
			res.status(200).send({
				user,
				following: result.following,
				followsMe: result.followsMe
			});
		});
	});
}
async function followCheck(me, user) {
	let following = await Follow.findOne({
		'follower': me,
		'followed': user
	}).exec().then((following) => {
		return following;
	});
	let followsMe = await Follow.findOne({
		'follower': user,
		'followed': me
	}).exec().then((followsMe) => {
		return followsMe;
	});
	return {
		following: following,
		followsMe: followsMe
	};
}

function getUsers(req, res) {
	const userId = req.user.sub;
	let page = 1;
	if (req.params.page) {
		page = parseInt(req.params.page);
	}
	const itemsPerPage = 5;
	User.find({}, '-password', {
		skip: (itemsPerPage * (page - 1)),
		limit: itemsPerPage
	}, (err, users) => {
		if (err) return err0r(res);
		if (!users) return err0r(res, 404, 'ERR0R. No hay usuarios.');
		User.countDocuments((err, total) => {
			if (err) return err0r(res);
			followUserIds(userId).then((success) => {
				return res.status(200).send({
					users_following: success.following,
					users_following_me: success.followed,
					total,
					pages: Math.ceil(total / itemsPerPage),
					page: page,
					users
				});
			});
		});
	});
}
async function followUserIds(userId) {
	let following = await Follow.find({
		'follower': userId
	}).select({
		'_id': 0,
		'_v': 0,
		'follower': 0
	}).exec().then((success) => {
		let followingArr = [];
		success.forEach((follow) => {
			followingArr.push(follow.followed);
		});
		return followingArr;
	});
	let followed = await Follow.find({
		'followed': userId
	}).select({
		'_id': 0,
		'_v': 0,
		'followed': 0
	}).exec().then((success) => {
		let followsArr = [];
		success.forEach((follow) => {
			followsArr.push(follow.follower);
		});
		return followsArr;
	});
	return {
		following: following,
		followed: followed
	};
}

function updateUser(req, res) {
	const userId = req.params.id;
	const update = req.body;
	delete update.password;
	if (userId != req.user.sub) return err0r(res, 500, 'ERR0R. No tienes permiso para hacer esto.');
	User.findOneAndUpdate(userId, update, {
		new: true
	}, (err, userUpdated) => {
		if (err) return err0r(res);
		if (!userUpdated) return err0r(res, 404, 'ERR0R. No se ha podido actualizar el usuario');
		return res.status(200).send({
			user: userUpdated
		});
	});
}

function uploadAvatar(req, res) {
	const userId = req.params.id;
	if (req.files) {
		const file_path = req.files.avatar.path;
		const file_split = file_path.split('//');
		const file_name = file_split[2];
		const ext_split = file_name.split('/.');
		const file_ext = ext_split[1];
		if (userId != req.user.sub) {
			return RemoveUploadFiles(res, file_path, 'ERR0R. No tienes permiso para hacer esto.');
		}
		if (file_ext == 'jpg' ||
			file_ext == 'jpeg' ||
			file_ext == 'png') {
			User.findById(userId, 'avatar', (err, result) => {
				let userAvatar = result.avatar;
				if (userAvatar != 'default-avatar.png') {
					fs.unlinkSync('./uploads/user/avatar/' + userAvatar);
				}
				User.findOneAndUpdate(userId, {
					avatar: file_name
				}, {
					new: true
				}, (err, userUpdated) => {
					if (err) return err0r(res);
					if (!userUpdated) return err0r(res, 404, 'ERR0R. No se ha podido actualizar el usuario');
					return res.status(200).send({
						user: userUpdated
					});
				});
			});
		} else {
			return RemoveUploadFiles(res, file_path, 'ERR0R. Solo puedes subir archivos en formato; .jpg .jpeg ó .png');
		}
	} else {
		return err0r(res, 400, 'ERR0R. No se ha recibido ninguna imagen.');
	}
}

function uploadCover(req, res) {
	const userId = req.params.id;
	if (req.files) {
		const file_path = req.files.cover.path;
		const file_split = file_path.split('//');
		const file_name = file_split[2];
		const ext_split = file_name.split('/.');
		const file_ext = ext_split[1];
		if (userId != req.user.sub) {
			return RemoveUploadFiles(res, file_path, 'ERR0R. No tienes permiso para hacer esto.');
		}
		if (file_ext == 'jpg' ||
			file_ext == 'jpeg' ||
			file_ext == 'png') {
			User.findById(userId, 'cover', (err, result) => {
				let userCover = result.cover;
				if (userCover != 'default-cover.png') {
					fs.unlinkSync('./uploads/user/cover/' + userCover);
				}
				User.findOneAndUpdate(userId, {
					cover: file_name
				}, {
					new: true
				}, (err, userUpdated) => {
					if (err) return err0r(res);
					if (!userUpdated) return err0r(res, 404, 'ERR0R. No se ha podido actualizar el usuario');
					return res.status(200).send({
						user: userUpdated
					});
				});
			});
		} else {
			return RemoveUploadFiles(res, file_path, 'ERR0R. Solo puedes subir archivos en formato; .jpg .jpeg ó .png');
		}
	} else {
		return err0r(res, 400, 'ERR0R. No se ha recibido ninguna imagen.');
	}
}

function RemoveUploadFiles(res, file_path, message) {
	fs.unlink(file_path, (err) => {
		if (err) return err0r(res, 404, 'ERR0R 404.');
		return res.status(403).send({
			message: message
		});
	});
}

function getAvatarFile(req, res) {
	let avatar_file = req.params.avatarFile;
	let path_file = './uploads/user/avatar/' + avatar_file;
	fs.exists(path_file, (exists) => {
		if (exists) {
			res.sendFile(path.resolve(path_file));
		} else {
			return err0r(res, 404, 'ERR0R. No existe esta imagen');
		}
	});
}

function getCoverFile(req, res) {
	let cover_file = req.params.coverFile;
	let path_file = './uploads/user/cover/' + cover_file;
	fs.exists(path_file, (exists) => {
		if (exists) {
			res.sendFile(path.resolve(path_file));
		} else {
			return err0r(res, 404, 'ERR0R. No existe esta imagen');
		}
	});
}

function updatePass(req, res) {
	const userId = req.user.sub;
	const params = req.body;
	const newPassword = params.new_password;
	const oldPassword = params.old_password;
	User.findById(userId, (err, userFound) => {
		if (err) return err0r(res, 500, err);
		bcrypt.compare(oldPassword, userFound.password, (err, passwordsMatch) => {
			if (err) return err0r(res, 500, err);
			if (passwordsMatch) {
				bcrypt.hash(newPassword, null, null, (err, hash)=>{	
					User.findByIdAndUpdate(userId, {'password': hash},(err,passwordUpdated)=>{
						if (err) return err0r(res, 500, err);
						res.status(201).send({
							passwordUpdated
						});
					}).select('-password');
				});
			}else {
				return err0r(res,404, 'Petición denegada, las contraseñas no coinciden');
			}
		});
	});
}

function deleteUser(req, res) {
	//TODO
}
module.exports = {
	userTest,
	saveUser,
	loginUser,
	getUser,
	getUsers,
	updateUser,
	uploadAvatar,
	uploadCover,
	getAvatarFile,
	getCoverFile,
	updatePass,
	deleteUser
};