'use strict'
const User = require('../models/user');
const Follow = require('../models/follower_followed');
const Publication = require('../models/publication');
const Like = require('../models/user_like');
const Comment = require('../models/publication_comment');
const Group = require('../models/group');

function statisticsTest(req, res) {
    res.status(200).send({
        message: 'Beep. Boop. Statistics test.',
        userId: req.user.sub
    });
}

function getStats(req, res) {
    let userId = req.user.sub;
    if (req.params.id) {
        userId = req.params.id;
    }
    getStatsCallback(userId).then((success) => {
        return res.status(200).send({
            following: success.following,
            followed: success.followed,
            publications: success.publications,
            received_likes: success.received_likes
        });
    });

}
//Get followers and follows
async function getStatsCallback(userId) {
    let following = await Follow.countDocuments({
        'follower': userId
    }).exec().then((success) => {
        return success;
    });
    let followed = await Follow.countDocuments({
        'followed': userId
    }).exec().then((success) => {
        return success;
    });
    let publications = await Publication.countDocuments({
        'user_id': userId
    }).exec().then((success) => {
        return success;
    });
    let received_likes = await Like.countDocuments({
        'liked_user_id': userId
    }).exec().then((success) => {
        return success;
    });
    return {
        following,
        followed,
        publications,
        received_likes
    }
}
function getGlobalStats(req,res){
    getGlobalStatsCallback().then((success)=>{
        return res.status(200).send({
            users: success.users,
            publications: success.publications,
            groups: success.groups
        });
    });
}
async function getGlobalStatsCallback(){
    let users = await User.countDocuments().exec().then((success)=>{
        return success;
    });
    let publications = await Publication.countDocuments().exec().then((success)=>{
        return success;
    });
    let groups = await Group.countDocuments().exec().then((success)=>{
        return success;
    });
    return{
        users,
        publications,
        groups
    }
}

module.exports = {
    statisticsTest,
    getStats,
    getGlobalStats
}