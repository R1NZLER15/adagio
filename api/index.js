'use strict'
var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

//connect to db
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/adagio_db',{useNewUrlParser: true})
    .then(() => {
        console.log('==Conexión exitosa')
        //create server
        app.listen(port, () => {
            console.log("==Servidor corriendo")
        });
    })
    .catch(err => console.log(err));