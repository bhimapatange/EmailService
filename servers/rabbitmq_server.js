/*******************************************************************************
 * Copyright (c) Sterlite Technologies Ltd.
 ******************************************************************************/

var amqp = require('amqplib/callback_api');
var log = require('logger/logger');
// var ExcelLogs = require('src/models/excel_logs');
var config= require('config');

exports.createConnection = function (){
    amqp.connect(`${config.rabbitmq.host}:${config.rabbitmq.port}`, function(err, conn) {
    // amqp.connect('amqp://sahil:iauro100@54.88.201.180', function(err, conn) {
    // amqp.connect('amqp://localhost', function(err, conn) {
        if(err) {
            console.log(err);
            return;
        }
        conn.createChannel(function(err, ch) {
            var excelLogs = 'EXCEL_LOGS';
            var jiraLogs = 'JIRA_LOGS';

            ch.assertQueue(excelLogs, {durable: false});
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", excelLogs);
            ch.consume(excelLogs, async function(msg) {
                console.log(" [x] Received from excelLogs %s", msg.content);
                // log.info("LOG: ", JSON.parse(msg.content));
                try {
                    // const result = await ExcelLogs.create(JSON.parse(msg.content));
                    // console.log("Excel log create success: ", result);
                } catch(err) {
                    // console.log("Excel log create error: ", err);
                }

            }, {noAck: true});

            // ch.assertQueue(jiraLogs, {durable: false});
            // console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", jiraLogs);
            // ch.consume(jiraLogs, function(msg) {
            //     console.log(" [x] Received from jiraLogs %s", JSON.parse(msg.content));
            // }, {noAck: true});
        });
    });
};
