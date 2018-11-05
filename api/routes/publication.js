'use strict'
const express = require('express');
const PublicationController = require('../controllers/publication');

const api = express.Router();
const md_auth = require('../middlewares/authenticated');

const multipart = require('connect-multiparty');
const md_upload = multipart({
    uploadDir: './uploads/publications'
});
api.get('/publication-test', md_auth.verifyAuth, PublicationController.publicationTest);
//save/edit/delete - publication
api.post('/save-publication', [md_auth.verifyAuth, md_upload], PublicationController.savePublication);
api.post('/edit-publication/:publicationId', md_auth.verifyAuth, PublicationController.editPublication);
api.delete('/delete-publication/:publicationId', md_auth.verifyAuth, PublicationController.deletePublication);
//get - publications
api.get('/get-media/:media_file', md_auth.verifyAuth, PublicationController.getMediaFile);
api.get('/get-document/:document_file', md_auth.verifyAuth, PublicationController.getDocumentFile);
api.get('/publication/:publicationId', md_auth.verifyAuth, PublicationController.getPublication);
api.get('/publications/:page?', md_auth.verifyAuth, PublicationController.getPublications);
api.get('/followed-publications/:page?', md_auth.verifyAuth, PublicationController.getFollowedPublications);
//like/unlike - publication
api.post('/like-publication/:publicationId?', md_auth.verifyAuth, PublicationController.savePublicationLike);
api.delete('/unlike-publication/:publicationId?', md_auth.verifyAuth, PublicationController.deletePublicationLike);
//save/edit/delete - comment
api.post('/save-comment/:publicationId?', md_auth.verifyAuth, PublicationController.savePublicationComment);
api.post('/edit-comment/:publicationId?', md_auth.verifyAuth, PublicationController.editPublicationComment);
api.delete('/delete-comment/:publicationId?', md_auth.verifyAuth, PublicationController.deletePublicationComment);
//like/unlike - comment
api.post('/like-comment/:commentId?', md_auth.verifyAuth, PublicationController.savePublicationCommentLike);
api.delete('/unlike-comment/:commentId?', md_auth.verifyAuth, PublicationController.deletePublicationCommentLike);
//get - comments
api.get('/publication-comments/:publicationId/:page?', md_auth.verifyAuth, PublicationController.getPublicationComments);
module.exports = api;