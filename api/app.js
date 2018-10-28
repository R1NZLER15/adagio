'use strict'
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

//load routes
const user_routes = require('./routes/user');
const follow_routes = require('./routes/follow');

//middlewares
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

//cores

//routes
app.use('/api', user_routes);
app.use('/api', follow_routes);

//export
module.exports = app;