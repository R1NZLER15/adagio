'use strict'
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

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
app.get('/test', (req, res) => {
    res.status(200).send({
        message: 'Beep. Boop.'
    })
})

//export
module.exports = app;