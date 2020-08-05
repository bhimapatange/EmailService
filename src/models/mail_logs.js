/*******************************************************************************
 * Copyright (c) Sterlite Technologies Ltd.
 ******************************************************************************/

const log = require('logger/logger');

/**
 *
 * @type {*|exports|module.exports}
 */
const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    mailLogs = new Schema({
        type: {
            type : String,
            default: ''
        },
        email: {
            type : String,
            default: ''
        },
        error: {
            type : String,
            default: ''
        }
    }, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });


const MailLogs = mongoose.model('mailLogs', mailLogs, 'mailLogs');

exports.create = (document) => {
    log.info("DATA: ", document);
    return MailLogs.create(document)
};

exports.findOne = (key, value) => {
    const condition = {};
    condition[key] = value;
    console.log('condition: ', condition);
    return MailLogs.findOne(condition);
};

exports.find = (condition, parameters) => {
    return MailLogs.find(condition, parameters)
};

exports.findOneAndUpdate = (filter, data, parameters) => {
    return MailLogs.findOneAndUpdate(filter, data, parameters)
};
