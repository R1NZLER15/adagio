'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
	receiver_id: {type: Schema.ObjectId, ref: 'User'},
	origin: {type: Schema.ObjectId, ref: 'User'},
	text: String,
	link: String,
	type: String,
	created_at: String,
	viewed: Boolean
});
/*
*seguimiento
*comentario
*me gusta
*invitación a un grupo
!admin: publicación
!admin: convocatoria
!admin: beca
!admin: evento
*/
module.exports = mongoose.model('Notification', NotificationSchema);