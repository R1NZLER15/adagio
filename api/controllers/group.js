'use strict'
const User = require('../models/user');
const Group = require('../models/group');
const GroupMember = require('../models/group_member');
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

function updateGroup(req, res) {
    const params = req.body;
    const userId = req.user.sub;
    const groupId = params.group_id;
    Group.findById(groupId, (err, group) => {
        if (err) return err0r(res, 500, err);
        if (!group) return err0r(res, 404, 'ERR0R. Este grupo no existe');
        if (userId != group.group_admin) return err0r(res, 403, 'Acceso denegado');
        console.log(group);
        Group.findByIdAndUpdate(groupId, {
            'name': params.name,
            'privacy': params.privacy,
            'description': params.description,
            'category': params.category
        });
    });
}

function deleteGroup(req, res) {
    const groupId = params.group_id;
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
        if (group.privacy == "private") return err0r(res, 403, 'No te puedes unir a este grupo.');
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

function joinGroupRequest(req, res) {

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
    })
}

function deleteGroupMember(req, res) {

}

function inviteUser(req, res) {
    let params = req.body;
    let userId = req.user.sub;
    let invitedUserId = params.invited_user_id;
    if (!invitedUserId) return err0r(res, 403, 'Ingresa el id del usuario que deseas invitar.');
    User.findById(invitedUserId, (err, user) => {
        if (err) return err0r(res, 500, err);
        if (!user) return err0r(res, 404, 'ERR0R. Este usuario no existe.');
        console.log(user._id);
    })
    let groupId = params.group_id;
    Group.findById(groupId, (err, group) => {
        if (err) return err0r(res, 500, err);
        if (!group) return err0r(res, 404, 'ERR0R. Este grupo no existe.');
        if (group.privacy == "private" && group.group_admin != userId) return err0r(res, 403, 'Solo el administrador puede invitar usuarios.');
        newMember = new GroupMember();
        newMember.user_id = invitedUserId;
        newMember.group_id = groupId;
        newMember.save((err, success) => {
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
    saveGroup
}