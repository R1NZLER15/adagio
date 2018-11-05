'use strict'
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

//load routes
const user_routes = require('./routes/user');
const follow_routes = require('./routes/follow');
const publication_routes = require('./routes/publication');
const statistics_routes = require('./routes/statistics');
const message_routes = require('./routes/message');
const notification_routes = require('./routes/notification');

//middlewares
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

//cores

//routes
app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api', publication_routes);
app.use('/api', statistics_routes);
app.use('/api', message_routes);
app.use('/api', notification_routes);

//export
module.exports = app;