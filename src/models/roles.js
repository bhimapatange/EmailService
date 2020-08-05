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
    _featureSchema = new Schema({
        name: {
            type: String,
            default: ""
        },
        access: {
            type: String,
            default: "none"
        }
    }),
    roles = new Schema({
        role_name: {
            type : String,
            default: ''
        },
        features: {
            type : [_featureSchema],
            default: []
        }
    });


const Roles = mongoose.model('Roles', roles, 'roles');

exports.create = (document) => {
    log.info("DATA: ", document);
    return Roles.create(document)
};

exports.createMany = (data) => {
    return Roles.insertMany(data);
};

exports.findOne = (key, value) => {
    const condition = {};
    condition[key] = value;
    console.log('condition: ', condition);
    return Roles.findOne(condition);
};

exports.find = (condition, parameters) => {
    return Roles.find(condition, parameters)
};

exports.findOneAndUpdate = (filter, data, parameters) => {
    return Roles.findOneAndUpdate(filter, data, parameters)
};
