'use strict'
const Publication = require('../models/publication');
const Like = require('../models/user_like');
const Comment = require('../models/publication_comment');
const User = require('../models/user');
const Follow = require('../models/follower_followed');
const Group = require('../models/group');
const GroupMember = require('../models/group_member');
const path = require('path');
const fs = require('fs');
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

function publicationTest(req, res) {
    res.status(200).send({
        message: 'Beep. Boop. Publication test.',
        userId: req.user.sub
    });
}


//*SAVE/EDIT/DELETE - PUBLICATIONS 


function savePublication(req, res) {
    let params = req.body;
    if (params.text_field || req.files.media_field || req.files.document_field) {
        let publication = new Publication();
        if (params.text_field) {
            publication.text_field = params.text_field;
        }
        if (req.files.media_field && req.files.document_field) {
            const media_file_path = req.files.media_field.path;
            RemoveUploadMediaFiles(res, media_file_path);
            const document_file_path = req.files.document_field.path;
            RemoveUploadDocumentFiles(res, document_file_path);
            return err0r(res, 403, 'ERR0R Solo puedes subir 1 tipo de archivo a la vez.')
        }
        if (req.files.media_field) {
            const file_path = req.files.media_field.path;
            const file_split = file_path.split('\\');
            const file_name = file_split[2];
            const ext_split = file_name.split('\.');
            const file_ext = ext_split[1];
            if (file_ext == 'jpg' ||
                file_ext == 'jpeg' ||
                file_ext == 'png' ||
                file_ext == 'gif' ||
                file_ext == 'mp4') {
                publication.media_field = file_name;
            } else {
                return RemoveUploadMediaFiles(res, file_path, 'ERR0R. Solo puedes subir archivos en formato; .jpg .jpeg .png .gif ó .mp4');
            }
        } else if (req.files.document_field) {
            const file_path = req.files.document_field.path;
            const file_split = file_path.split('\\');
            const file_name = file_split[2];
            const ext_split = file_name.split('\.');
            const file_ext = ext_split[1];
            if (file_ext == 'pdf' ||
                file_ext == 'docx' ||
                file_ext == 'pptx' ||
                file_ext == 'xlsx' ||
                file_ext == 'doc') {
                publication.document_field = file_name;
            } else {
                return RemoveUploadDocumentFiles(res, file_path, 'ERR0R. Solo puedes subir archivos en formato; .pdf .docx .pptx .xlsx ó .doc');
            }
        }
        publication.user_id = req.user.sub;
        publication.likes = 0;
        publication.created_at = moment().unix();
        publication.save((err, publicationSaved) => {
            if (err) return err0r(res, 500, err);
            res.status(201).send({
                publication: publicationSaved
            });
        });
    } else {
        return err0r(res, 403);
    }
}

function RemoveUploadMediaFiles(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        if (message) {
            return res.status(403).send({
                message: message
            });
        }
    });
}

function RemoveUploadDocumentFiles(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        if (message) {
            return res.status(403).send({
                message: message
            });
        }
    });
}

function getMediaFile(req, res) {
    let media_file = req.params.media_file;
    let path_file = './uploads/publications/'+media_file;
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
        publicationId = req.params.publicationId
    }
    Publication.findById(publicationId, (err, result) => {
        if (err) return err0r(res, 500, err);
        if (!result) return err0r(res, 404, 'ERR0R. Esta publicación no existe.');
        if (userId != result.user_id) return err0r(res, 403, 'ERR0R. Acceso denegado.');
        Publication.findByIdAndUpdate(publicationId, {
            $set: {
                text_field: params.text_field,
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
        publicationId = req.params.publicationId
    }
    Publication.findById(publicationId, (err, result) => {
        if (err) return err0r(res, 500, err);
        if (!result) return err0r(res, 404, 'ERR0R. Esta publicación no existe.');
        if (userId != result.user_id) return err0r(res, 403, 'ERR0R. Acceso denegado.');
        Publication.findByIdAndDelete(publicationId, (err, success) => {
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
        })
    })
}

//Get global & popular posts
function getPublications(req, res) {
    let page = 1;
    if (req.params.page) {
        page = parseInt(req.params.page);
    }
    const itemsPerPage = 5;
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
            })
        });
    }).sort('-created_at').populate({
        path: 'user_id',
        select: '-password'
    });
}
//Get posts only from the people that i follow
function getFollowedPublications(req, res) {
    let page = 1;
    if (req.params.page) {
        page = parseInt(req.params.page);
    }
    const itemsPerPage = 5;
    Follow.find({
        follower: req.user.sub
    }).populate({
        path: 'followed',
        select: '-password'
    }).exec((err, follows) => {
        if (err) return err0r(res);
        let followsArr = [];
        follows.forEach((follow) => {
            followsArr.push(follow.followed)
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
                })
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
    let userId = req.user.sub;
    if (req.params.user_id) {
        userId = req.params.user_id;
    }
    if (req.params.page) {
        page = parseInt(req.params.page);
    }
    const itemsPerPage = 5;
    Publication.find({
        'user_id': userId
    }, null, {
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
            })
        });
    }).sort('-created_at').populate({
        path: 'user_id',
        select: '-password'
    });
}


//*LIKE/UNLIKE - PUBLICATIONS


function savePublicationLike(req, res) {
    let params = req.body;
    let userId = req.user.sub;
    let publicationId = params.publicationId;
    if (req.params.publicationId) {
        publicationId = req.params.publicationId
    }
    Like.findOne({
        'user_id': userId,
        'publication_id': publicationId
    }, (err, result) => {
        if (err) return err0r(res, 500, err);
        if (result) return err0r(res, 403, 'ERR0R. Ya existe este me gusta.')
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
                like.liked_user_id = publication.user_id
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

function deletePublicationLike(req, res) {
    let params = req.body;
    let userId = req.user.sub;
    let publicationId = params.publicationId;
    if (req.params.publicationId) {
        publicationId = req.params.publicationId
    }
    Like.findOneAndRemove({
        'user_id': userId,
        'publication_id': publicationId
    }, (err, result) => {
        if (err) return err0r(res, 500, err);
        if (!result) return err0r(res, 403, 'ERR0R. No existe este me gusta.')
        if (result) {
            Publication.findByIdAndUpdate(publicationId, {
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


//* SAVE/EDIT/DELETE - COMMENTS
//TODO: Move the comment functions onto their own controller file


function savePublicationComment(req, res) {
    let params = req.body;
    let userId = req.user.sub;
    let publicationId = params.publicationId;
    if (req.params.publicationId) {
        publicationId = req.params.publicationId
    }
    Publication.findById(publicationId, (err, publicationResult) => {
        if (err) return err0r(res, 500, err);
        if (!publicationResult) return err0r(res, 404, 'ERR0R. Esta publicación no existe.');
        if (publicationResult) {
            let comment = new Comment();
            comment.publication_id = publicationId;
            comment.user_id = userId;
            if (params.text_field || params.media_field) {
                if (params.text_field) {
                    comment.text_field = params.text_field;
                }
                if (params.media_field) {
                    comment.media_field = params.media_field;
                }
                comment.likes = 0;
                comment.created_at = moment().unix();
                comment.save((err, commentSaved) => {
                    Comment.find({
                        'publication_id': publicationId
                    }, {
                        limit: 10
                    }, (err, comments) => {
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
        commentId = req.params.commentId
    }
    Comment.findById(commentId, (err, result) => {
        if (err) return err0r(res, 500, err);
        if (!result) return err0r(res, 404, 'ERR0R. Este comentario no existe.');
        if (userId != result.user_id) return err0r(res, 403, 'ERR0R. Acceso denegado.');
        Comment.findByIdAndUpdate(commentId, {
            $set: {
                text_field: params.text_field,
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
        commentId = req.params.commentId
    }
    Comment.findById(commentId, (err, result) => {
        if (err) return err0r(res, 500, err);
        if (!result) return err0r(res, 404, 'ERR0R. Este comentario no existe.');
        if (userId != result.user_id) return err0r(res, 403, 'ERR0R. Acceso denegado.');
        Comment.findByIdAndRemove(commentId, (err, success) => {
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
        publicationId = req.params.publicationId
    }
    let page = 1;
    if (req.params.page) {
        page = parseInt(req.params.page);
    }
    const itemsPerPage = 5;
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
        commentId = req.params.commentId
    }
    Like.findOne({
        'user_id': userId,
        'comment_id': commentId
    }, (err, result) => {
        if (err) return err0r(res, 500, err);
        if (result) return err0r(res, 403, 'ERR0R. Ya existe este me gusta.')
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
        commentId = req.params.commentId
    }
    Like.findOneAndRemove({
        'user_id': userId,
        'comment_id': commentId
    }, (err, result) => {
        if (err) return err0r(res, 500, err);
        if (!result) return err0r(res, 403, 'ERR0R. No existe este me gusta.')
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
    editPublication,
    deletePublication,
    getMediaFile,
    getDocumentFile,
    getPublications,
    getPublication,
    getUserPublications,
    getFollowedPublications,
    savePublicationLike,
    deletePublicationLike,
    savePublicationComment,
    editPublicationComment,
    deletePublicationComment,
    getPublicationComments,
    savePublicationCommentLike,
    deletePublicationCommentLike
}