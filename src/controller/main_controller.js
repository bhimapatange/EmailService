
/*******************************************************************************
 * Copyright (c) Sterlite Technologies Ltd.
 ******************************************************************************/

//Include all the required files
const Response = require('src/utils/Response'),
    log = require('logger/logger'),
    Joi = require('joi'),
    emailFactory = require('src/factory/email_factory'),
    Validation = require('src/validations');

/**
 *
 * Endpoint to check whether the JIRA
 * micro service is installed or not
 */


exports.start = {
    auth : false,
    handler : (request, reply) => {
        reply('Email Service is working!!!');
    }};

exports.sendMail = {
    description: 'Send E-mail',
    // notes: 'Add workflow to the project',
    tags: ['api', 'email'],
    auth: 'simple',
    plugins: {
        'hapi-swagger': {
            responses: Response.responses}},
    validate : Validation.email_validations.sendMail,
    handler : (request, reply) => {
        emailFactory.startCronjob();
    }};

exports.mailInit = {
    description: 'Initiate E-mail',
    // notes: 'Add workflow to the project',
    tags: ['api', 'email'],
    auth: 'simple',
    plugins: {
        'hapi-swagger': {
            responses: Response.responses}},
    validate : Validation.email_validations.mailInit,
    handler : (request, reply) => {
        emailFactory.mailInit(request, reply);
    }};


exports.sendMailToUser = {
    description: 'Initiate E-mail',
    // notes: 'Add workflow to the project',
    tags: ['api', 'email'],
    auth: false,
    plugins: {
        'hapi-swagger': {
            responses: Response.responses}},
            validate : Validation.email_validations.sendMailToUser,
    handler : (request, reply) => {
       
       emailFactory.sendMailToUser(request, reply);
    }};
