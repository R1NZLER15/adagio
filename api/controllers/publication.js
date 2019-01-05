'use strict';
const Publication = require('../models/publication');
const Like = require('../models/user_like');
const Comment = require('../models/publication_comment');
const User = require('../models/user');
const Follow = require('../models/follower_followed');
const Group = require('../models/group');
const GroupMember = require('../models/group_member');
const Notification = require('../models/notification');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const itemsPerPage = 10;

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

function publicationTest(req, res) {
	res.status(200).send({
		message: 'Beep. Boop. Publication test.',
		userId: req.user.sub
	});
}


//*SAVE/EDIT/DELETE - PUBLICATIONS 


function savePublication(req, res) {
	let params = req.body;
	let userId = req.user.sub;
	User.findById(userId, (err, user) => {
		if (err) return err0r(res, 500, err);
		if(!params.text) return err0r(res, 400);
		let publication = new Publication();
		//let text = params.text;
		//text = text.replace(/\n/g, '\\n');
		publication.text = params.text;
		publication.user_id = req.user.sub;
		publication.likes = 0;
		if(user.role == 'administrator') {
			publication.type = params.type;
		}
		publication.created_at = moment().unix();
		publication.save((err, publicationSaved) => {
			if (err) return err0r(res, 500, err);
			if (user.role == 'administrator') {
				User.find({}, (err, users) => {
					users.forEach((user) => {
						let newNotification = new Notification();
						newNotification.receiver_id = user._id;
						newNotification.emitter_id = userId;
						if (!params.type) {
							newNotification.type = 'publicación';
						} else {
							newNotification.type = params.type;
						}
						newNotification.text = 'La administración ha publicado una nueva actualización';
						newNotification.link = `/publication/${publicationSaved._id}`;
						newNotification.created_at = moment().unix();
						newNotification.viewed = false;
						newNotification.save();
					});
				});
			}
			Publication.findById(publicationSaved._id, (err, publicationResponse) => {
				res.status(201).send({
					publication: publicationResponse
				});
			}).sort('-created_at').populate({
				path: 'user_id',
				select: '-password'
			});
		});
	});
}

function saveMediaFile(req, res) {
	const publicationId = req.params.publicationId;
	Publication.findOne({
		'_id': publicationId,
		'user_id': req.user.sub
	}, (err, publication)=> {
		if(err) return err0r(res, 500, err);
		if(publication.media_file) return err0r(res, 403);
		if(publication.document_file) return err0r(res, 403, 'Solo puedes agregar un tipo de archivo');
		const file_path = req.files.media_file.path;
		const file_split = file_path.split('//');
		const file_name = file_split[2];
		const ext_split = file_name.split('/.');
		const file_ext = ext_split[1];
		if (file_ext == 'jpg' ||
			file_ext == 'jpeg' ||
			file_ext == 'png' ||
			file_ext == 'gif' ||
			file_ext == 'mp4') {
			Publication.findById(publicationId, {'media_file': file_name});
		} else {
			return RemoveUploadMediaFiles(res, file_path, 'ERR0R. Solo puedes subir archivos en formato; .jpg .jpeg .png .gif ó .mp4');
		}
	});
}

function saveDocumentFile(req, res) {
	const publicationId = req.params.publicationId;
	Publication.findOne({
		'_id': publicationId,
		'user_id': req.user.sub
	}, (err, publication)=> {
		if(err) return err0r(res, 500, err);
		if(publication.document_file) return err0r(res, 403);
		if(publication.media_file) return err0r(res, 403, 'Solo puedes agregar un tipo de archivo');
		const file_path = req.files.document_file.path;
		const file_split = file_path.split('//');
		const file_name = file_split[2];
		const ext_split = file_name.split('/.');
		const file_ext = ext_split[1];
		if (file_ext == 'pdf' ||
			file_ext == 'docx' ||
			file_ext == 'pptx' ||
			file_ext == 'xlsx' ||
			file_ext == 'doc') {
			Publication.findById(publicationId, {'document_file': file_name});
		} else {
			return RemoveUploadDocumentFiles(res, file_path, 'ERR0R. Solo puedes subir archivos en formato: .pdf .docx .pptx .xlsx ó .doc');
		}
	});
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

function RemoveUploadDocumentFiles(res, file_path, message) {
	fs.unlink(file_path, (err) => {
		if (err) return err0r(res, 404, 'ERR0R 404.');
		if (message) {
			return res.status(403).send({
				message: message
			});
		}
	});
}

function getMediaFile(req, res) {
	let media_file = req.params.media_file;
	let path_file = './uploads/publications/' + media_file;
	fs.exists(path_file, (exists) => {
		if (exists) {
			return res.sendFile(path.resolve(path_file));
		} else {
			return err0r(res, 404, 'ERR0R. No existe esta imagen');
		}
	});
}

function getDocumentFile(req, res) {
	let document_file = req.params.document_file;
	let path_file = './uploads/publications/' + document_file;
	fs.exists(path_file, (exists) => {
		if (exists) {
			return res.sendFile(path.resolve(path_file));
		} else {
			return err0r(res, 404, 'ERR0R. No existe esta imagen');
		}
	});
}

function editPublication(req, res) {
	let params = req.body;
	let userId = req.user.sub;
	let publicationId = params.publicationId;
	if (req.params.publicationId) {
		publicationId = req.params.publicationId;
	}
	Publication.findById(publicationId, (err, result) => {
		if (err) return err0r(res, 500, err);
		if (!result) return err0r(res, 404, 'ERR0R. Esta publicación no existe.');
		if (userId != result.user_id || req.user.role != 'administrator') return err0r(res, 403, 'ERR0R. Acceso denegado.');
		Publication.findByIdAndUpdate(publicationId, {
			$set: {
				text: params.text,
				updated_at: moment().unix()
			}
		}, {
			new: true
		}, (err, success) => {
			res.status(201).send({
				success
			});
		});
	});
}

function deletePublication(req, res) {
	let params = req.body;
	let userId = req.user.sub;
	let publicationId = params.publicationId;
	if (req.params.publicationId) {
		publicationId = req.params.publicationId;
	}
	Publication.findById(publicationId, (err, result) => {
		if (err) return err0r(res, 500, err);
		if (!result) return err0r(res, 404, 'ERR0R. Esta publicación no existe.');
		if (userId != result.user_id) return err0r(res, 403, 'ERR0R. Acceso denegado.');
		Publication.findByIdAndDelete(publicationId, (err, success) => {
			if (err) return err0r(res, 500, err);
			if (!success) return err0r(res, 404, 'ERR0R.');
			res.status(200).send({
				message: 'Publicación borrada.'
			});
		});
	});
}


//*GET - PUBLICATIONS


//Get a single publication
function getPublication(req, res) {
	let publicationId = req.params.publicationId;
	Publication.findById(publicationId, (err, publication) => {
		if (err) return err0r(res, 500, err);
		if (!publication) return err0r(res, 404, 'Esta publicación no existe');
		res.status(200).send({
			publication
		});
	});
}

//Get global & popular posts
function getPublications(req, res) {
	let page = 1;
	if (req.params.page) {
		page = parseInt(req.params.page);
	}
	//! Volver esto compatible con las publicaciones de grupos privados
	Publication.find({}, null, {
		skip: (itemsPerPage * (page - 1)),
		limit: itemsPerPage
	}, (err, publications) => {
		if (err) return err0r(res, 500, err);
		if (!publications) return err0r(res, 404, 'No hay publicaciones para mostrar.');
		Publication.countDocuments({}, (err, total) => {
			if (err) return err0r(res, 500, err);
			res.status(200).send({
				total,
				pages: Math.ceil(total / itemsPerPage),
				page: page,
				publications
			});
		});
	}).sort('-created_at').populate({
		path: 'user_id',
		select: '-password'
	});
}

//Get posts from a group
function getGroupPublications(req, res) {
	let page = 1;
	let total;
	const userId = req.user.sub;
	const groupId = req.params.group_id;
	if(req.params.page) {
		page = req.params.page;
	}
	Group.findById(groupId, (err, group) => {
		if(err) return err0r(res);
		if(!group) return err0r(res, 404, 'Este grupo no existe');
		GroupMember.findOne({'user_id': userId, 'group_id': groupId},(err, groupMember) => {
			if(err) return err0r(res);
			if(!groupMember && group.privacy == 'private') return err0r(res, 403, 'No puedes ver las publicaciones de este grupo.');
			Publication.find({'group_id': groupId}, null, {
				skip: (itemsPerPage * (page - 1)),
				limit: itemsPerPage
			}, (err, publications) => {
				if(err) return err0r(res);
				res.status(200).send({
					total,
					pages: Math.ceil(total / itemsPerPage),
					page: page,
					publications
				});
			});
		});
	});
}

//Get posts only from the people that i follow
function getFollowedPublications(req, res) {
	let page = 1;
	if (req.params.page) {
		page = parseInt(req.params.page);
	}
	Follow.find({
		follower: req.user.sub
	}).populate({
		path: 'followed',
		select: '-password'
	}).exec((err, follows) => {
		if (err) return err0r(res);
		let followsArr = [];
		follows.forEach((follow) => {
			followsArr.push(follow.followed);
		});
		followsArr.push(req.user.sub);
		Publication.find({
			'user_id': {
				$in: followsArr
			}
		}, null, {
			skip: (itemsPerPage * (page - 1)),
			limit: itemsPerPage
		}, (err, publications) => {
			if (err) return err0r(res, 500, err);
			if (!publications) return err0r(res, 404, 'No hay publicaciones para mostrar.');
			Publication.countDocuments({
				'user_id': {
					$in: followsArr
				}
			}, (err, total) => {
				if (err) return err0r(res, 500, err);
				res.status(200).send({
					total,
					pages: Math.ceil(total / itemsPerPage),
					page: page,
					publications
				});
			});
		}).sort('-created_at').populate({
			path: 'user_id',
			select: '-password'
		});
	});
}

//Get posts from a single user
function getUserPublications(req, res) {
	let page = 1;
	let userId = req.params.user_id;
	if (req.params.page) {
		page = parseInt(req.params.page);
	}
	Publication.find({
		'user_id': userId
	}, null, {
		skip: (itemsPerPage * (page - 1)),
		limit: itemsPerPage
	}, (err, publications) => {
		if (err) return err0r(res, 500, err);
		if (!publications) return err0r(res, 404, 'No hay publicaciones para mostrar.');
		Publication.countDocuments({
			'user_id': userId
		}, (err, total) => {
			if (err) return err0r(res, 500, err);
			res.status(200).send({
				total,
				pages: Math.ceil(total / itemsPerPage),
				page: page,
				publications
			});
		});
	}).sort('-created_at').populate({
		path: 'user_id',
		select: '-password'
	});
}


//*LIKE/UNLIKE - PUBLICATIONS


function LikePublication(req, res) {
	let params = req.body;
	let userId = req.user.sub;
	let publicationId = params.publicationId;
	if (req.params.publicationId) {
		publicationId = req.params.publicationId;
	}
	Like.findOne({
		'user_id': userId,
		'publication_id': publicationId
	}, (err, result) => {
		if (err) return err0r(res, 500, err);
		if (result) {
			Like.findOneAndRemove({
				'user_id': userId,
				'publication_id': publicationId
			}, (err) => {
				if (err) return err0r(res, 500, err);
				Publication.findByIdAndUpdate(publicationId, {
					$inc: {
						'likes': -1
					}
				}, {
					new: true
				},(err, publication) => {
					if (err) return err0r(res);
					return res.status(200).send({
						message: 'Ya no te gusta ésta publicación.',
						publication: publication
					});
				});
			});
		}
		if (!result) {
			Publication.findByIdAndUpdate(publicationId, {
				$inc: {
					'likes': 1
				}
			}, {
				new: true
			}, (err, publication) => {
				if (err) return err0r(res, 500, err);
				let like = new Like();
				like.user_id = userId;
				like.publication_id = publicationId;
				like.liked_user_id = publication.user_id;
				like.save((err, newLike) => {
					if (err) return err0r(res, 500, err);
					res.status(201).send({
						publication: publication,
						newLike: newLike
					});
				});
			});
		}
	});
}

//* SAVE/EDIT/DELETE - COMMENTS
//TODO: Move the comment functions onto their own controller file

function savePublicationComment(req, res) {
	let params = req.body;
	let userId = req.user.sub;
	let publicationId = params.publicationId;
	if (req.params.publicationId) {
		publicationId = req.params.publicationId;
	}
	Publication.findById(publicationId, (err, publicationResult) => {
		if (err) return err0r(res, 500, err);
		if (!publicationResult) return err0r(res, 404, 'ERR0R. Esta publicación no existe.');
		if (publicationResult) {
			let comment = new Comment();
			comment.publication_id = publicationId;
			comment.user_id = userId;
			if (params.text || params.media_file) {
				if (params.text) {
					comment.text = params.text;
				}
				if (params.media_file) {
					comment.media_file = params.media_file;
				}
				comment.likes = 0;
				comment.created_at = moment().unix();
				comment.save((err, commentSaved) => {
					Comment.find({
						'publication_id': publicationId
					}, {
						limit: 10
					}, (err, comments) => {
						if (err) return err0r(res, 500, err);
						if (!comments) return err0r(res, 404, 'ERR0R.');
						res.status(201).send({
							Publication: publicationResult,
							comment: commentSaved
						});
					}).sort('created_at');
				});
			} else {
				return err0r(res, 403);
			}
		}
	});
}

function editPublicationComment(req, res) {
	let params = req.body;
	let userId = req.user.sub;
	let commentId = params.commentId;
	if (req.params.commentId) {
		commentId = req.params.commentId;
	}
	Comment.findById(commentId, (err, result) => {
		if (err) return err0r(res, 500, err);
		if (!result) return err0r(res, 404, 'ERR0R. Este comentario no existe.');
		if (userId != result.user_id) return err0r(res, 403, 'ERR0R. Acceso denegado.');
		Comment.findByIdAndUpdate(commentId, {
			$set: {
				text: params.text,
				updated_at: moment().unix()
			}
		}, {
			new: true
		}, (err, success) => {
			res.status(201).send({
				success
			});
		});
	});
}

function deletePublicationComment(req, res) {
	let params = req.body;
	let userId = req.user.sub;
	let commentId = params.commentId;
	if (req.params.commentId) {
		commentId = req.params.commentId;
	}
	Comment.findById(commentId, (err, result) => {
		if (err) return err0r(res, 500, err);
		if (!result) return err0r(res, 404, 'ERR0R. Este comentario no existe.');
		if (userId != result.user_id) return err0r(res, 403, 'ERR0R. Acceso denegado.');
		Comment.findByIdAndRemove(commentId, (err, success) => {
			if (err) return err0r(res, 500, err);
			if (success) return err0r(res, 404, 'ERR0R.');
			res.status(200).send({
				message: 'Comentario borrado.'
			});
		});
	});
}


//*GET - COMMENTS
function getPublicationComments(req, res) {
	let params = req.body;
	let publicationId = params.publicationId;
	if (req.params.publicationId) {
		publicationId = req.params.publicationId;
	}
	let page = 1;
	if (req.params.page) {
		page = parseInt(req.params.page);
	}
	Publication.findById(publicationId, (err, publication) => {
		if (err) return err0r(res, 500, err);
		if (!publication) return err0r(res, 404, 'ERR0R. No existe esta publicación');
		if (publication) {
			Comment.find({
				'publication_id': publicationId
			}, null, {
				skip: (itemsPerPage * (page - 1)),
				limit: itemsPerPage
			}, (err, comments) => {
				if (err) return err0r(res, 500, err);
				Comment.countDocuments({
					'publication_id': publicationId
				}, (err, total) => {
					if (err) return err0r(res, 500, err);
					res.status(200).send({
						publication: publicationId,
						total,
						pages: Math.ceil(total / itemsPerPage),
						page: page,
						comments
					});
				});
			}).sort('-created_at');
		}
	});
}


//*LIKE/UNLIKE - COMMENTS


function savePublicationCommentLike(req, res) {
	let params = req.body;
	let userId = req.user.sub;
	let commentId = params.commentId;
	if (req.params.commentId) {
		commentId = req.params.commentId;
	}
	Like.findOne({
		'user_id': userId,
		'comment_id': commentId
	}, (err, result) => {
		if (err) return err0r(res, 500, err);
		if (result) return err0r(res, 403, 'ERR0R. Ya existe este me gusta.');
		if (!result) {
			Comment.findByIdAndUpdate(commentId, {
				$inc: {
					'likes': 1
				}
			}, {
				new: true
			}, (err, updatedLikes) => {
				if (err) return err0r(res, 500, err);
				let like = new Like();
				like.user_id = userId;
				like.comment_id = commentId;
				like.save((err, newLike) => {
					if (err) return err0r(res, 500, err);
					res.status(201).send({
						updatedLikes: updatedLikes,
						newLike: newLike
					});
				});
			});
		}
	});
}

function deletePublicationCommentLike(req, res) {
	let params = req.body;
	let userId = req.user.sub;
	let commentId = params.commentId;
	if (req.params.commentId) {
		commentId = req.params.commentId;
	}
	Like.findOneAndRemove({
		'user_id': userId,
		'comment_id': commentId
	}, (err, result) => {
		if (err) return err0r(res, 500, err);
		if (!result) return err0r(res, 403, 'ERR0R. No existe este me gusta.');
		if (result) {
			Comment.findByIdAndUpdate(commentId, {
				$inc: {
					'likes': -1
				}
			}, {
				new: true
			}, (err, updatedLikes) => {
				if (err) return err0r(res, 500, err);
				res.status(200).send({
					updatedLikes: updatedLikes
				});
			});
		}
	});
}


module.exports = {
	publicationTest,
	savePublication,
	saveMediaFile,
	saveDocumentFile,
	editPublication,
	deletePublication,
	getMediaFile,
	getDocumentFile,
	getPublications,
	getGroupPublications,
	getPublication,
	getUserPublications,
	getFollowedPublications,
	LikePublication,
	savePublicationComment,
	editPublicationComment,
	deletePublicationComment,
	getPublicationComments,
	savePublicationCommentLike,
	deletePublicationCommentLike
};