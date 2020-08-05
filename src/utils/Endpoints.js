
/*******************************************************************************
 * Copyright (c) Sterlite Technologies Ltd.
 ******************************************************************************/

const config = require('config');

module.exports  = Object.freeze({


    // BASE_URL: config.jira_environment.protocol + '://' + config.jira_environment.host +
    // ((config.jira_environment.port !== '') ? ':' : '') + config.jira_environment.port + '/' +
    // ((config.jira_environment.directory !== '') ? (config.jira_environment.directory + '/') : '') +
    // config.jira_environment.context + '/' + config.jira_environment.type + '/' +
    // config.jira_environment.version + '/'
    //
    EXCEL_SERVICE_BASE_URL: config.excel_env.protocol + '://' + config.excel_env.host +
        ((config.excel_env.port !== '') ? ':' : '') + config.excel_env.port + '/' +
        ((config.excel_env.directory !== '') ? (config.excel_env.directory + '/') : ''),

    JIRA_PROJECT_ID_URL: config.jira_env.protocol + '://' + config.jira_env.host +
        ((config.jira_env.port !== '') ? ':' : '') + config.jira_env.port + '/' +
        ((config.jira_env.directory !== '') ? (config.jira_env.directory + '/') : ''),

    USER_MGMNT_URL: config.user_mgmnt_env.protocol + '://' + config.user_mgmnt_env.host +
        ((config.user_mgmnt_env.port !== '') ? ':' : '') + config.user_mgmnt_env.port + '/' +
        ((config.user_mgmnt_env.directory !== '') ? (config.user_mgmnt_env.directory + '/') : ''),

    UPLOAD_REQUIREMENT_URL: config.upload_req_env.protocol + '://' + config.upload_req_env.host +
        ((config.upload_req_env.port !== '') ? ':' : '') + config.upload_req_env.port + '/' +
        ((config.upload_req_env.directory !== '') ? (config.upload_req_env.directory + '/') : ''),

    METHOD : {
        GET : 'GET',
        POST : 'POST',
        PUT : 'PUT',
        DELETE : 'DELETE'},

    CONTENT_TYPE : {
        JSON : 'application/json',
        FORM : 'application/x-www-form-urlencoded',
        FORM_DATA : 'multipart/form-data',
        XML : 'application/xml',
        TEXT_XML : 'text/xml'}
});
