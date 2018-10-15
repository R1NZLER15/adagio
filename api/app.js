'use strict'
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

//load rutes

//middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
//cores

//rutes
app.get('/', (req, res) => {
    res.status(200).send({
        message: 'Hola'
    })
})

//export
module.exports = app;