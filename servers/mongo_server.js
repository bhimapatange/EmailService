
/*******************************************************************************
 * Copyright (c) Sterlite Technologies Ltd.
 ******************************************************************************/

var mongoose = require('mongoose');
var config = require('config');
var log = require('logger/logger');
var rabbitmq = require('servers/rabbitmq_server');


exports.mongoConnection = function () {

    let connection_uri = '';
    if(config.database.mongo.username && config.database.mongo.password) {
        connection_uri = `mongodb://${config.database.mongo.username}:${config.database.mongo.password}@${config.database.mongo.host}:${config.database.mongo.port}/${config.database.mongo.name}?authSource=admin`;
    } else {
        connection_uri = `mongodb://${config.database.mongo.host}:${config.database.mongo.port}/${config.database.mongo.name}`;
    }
    mongoose.connect(connection_uri, {
        // useMongoClient: true,
        useNewUrlParser: true,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 1000 });

    mongoose.connection.on('connected', function () {
        log.info('Mongoose default connection open to ' + 'mongodb://' + config.database.mongo.host + '/' + config.database.mongo.name);
        // rabbitmq.createConnection();
    });

    mongoose.connection.on('error', function (err) {
        log.info('Mongoose default connection error: ' + err);
    });


    mongoose.connection.on('disconnected', function () {
        log.info('Mongoose default connection disconnected');
    });


    process.on('SIGINT', function () {
        mongoose.connection.close(function () {
            log.info('Mongoose default connection disconnected through app termination');
            process.exit(0);
        });
    });
};
