
/*******************************************************************************
 * Copyright (c) Sterlite Technologies Ltd.
 ******************************************************************************/

const Hapi = require('hapi'),
    corsHeaders = require('hapi-cors-headers'),
    config = require('config'),
    Inert = require('inert'),
    Vision = require('vision'),
    HapiSwagger = require('hapi-iauro-swaggered'),
    pack = require('package'),
    cluster = require('cluster'),
    log = require('logger/logger'),
    routes = require('src/routes'),
    numberOfCPUs = require('os').cpus().length,
    Basic = require('hapi-auth-basic');
    global.server = new Hapi.Server();
    const emailFactory = require('src/factory/email_factory');

    server.app['admin_token'] = {
        authorization : '',
        jira_authorization : '',
        session_time : 15
    };

let redisClient;

try {

    if (process.env.NODE_ENV !== 'test' && cluster.isMaster) {
        for (let i = 0; i < numberOfCPUs; i++) {
            let worker = cluster.fork();
            log.info('worker %s started.', worker.id);
        }
    }else {

        const options = {
            schemes : [config.excel_env.svc_protocol],
            // basePath : config.swagger_base_path,
            tags: [
                {
                    'name' : 'Email-Service'
                }
            ],
            info: {
                title: `Email Service APIs - ${config.env}`,
                version: pack.version
            },
            grouping : 'tags'
        };

        let server_register_plugins = [Inert,
            Vision,
            {
                register: HapiSwagger,
                options: options
            },
            Basic,
            {
                register: require('hapi-redis'),
                options: config.redis_env
            }];

        let server_connection_options = {
            host : config.server.host,
            port: config.server.port,
            state: {
                strictHeader: false,
                ignoreErrors: true
            },
            routes: {
                cors: true,
                timeout: {
                    server: 1200000, // 1,200,000 or 20 minutes
                    socket: 1300000
                }
            }
        };

        if(config.env === 'production' || config.env === 'preprod') {
            server_register_plugins = [
                Basic,
                {
                    register: require('hapi-redis'),
                    options: config.redis_env
                }];
            server_connection_options.routes.cors = {
                origin: ["*"],
                headers: ["Accept", "Content-Type"],
                additionalHeaders: ["X-Requested-With"]
            };
        }

        server.connection(server_connection_options);

        server.register(server_register_plugins, function (err) {
                if(!err) {
                    redisClient = server._plugins['hapi-redis'].client;
                    server.auth.strategy('simple', 'basic', { validateFunc: validate});
                    for(const route in routes) {
                        server.route(routes[route]);
                    }
                    intializeConfiguration();
                    server.start(error => {
                        if (error) {
                            throw error;
                        } else {
                            log.info('Email server is Running on : ' + server.info.uri);
                            emailFactory.startCronjob();
                        }
                    });
                }else {
                    throw err;
                }
            }
        );

        server.on('response', function (request) {
            if(request.response) {
                log.error(request.info.remoteAddress + ': ' + request.method.toUpperCase() + ' ' + request.url.path + ' --> ' + request.response.statusCode);
            } else {
                log.info("No statusCode : ",request.info.remoteAddress + ': ' + request.method.toUpperCase() + ' ' + request.url.path + ' --> ');
            }
        });

        server.ext('onPreResponse', corsHeaders);
    }


}catch (er) {
    log.error("ERROR : ", er);
}

const intializeConfiguration = () => {
    redisClient.get(`iro_config-${config.env}`,
    (err_admin, value_admin) => {
        if(err_admin) {
            return callback(null, false);
        } 
        if(value_admin) {
            try {
            const admin_redis_details = JSON.parse(value_admin);
            server.app.admin_token = {
                authorization : `Basic ${admin_redis_details.iro_admin.authorization}`,
                jira_authorization : `Basic ${admin_redis_details.jira_admin.authorization}`,
                session_time : admin_redis_details.session_time
            };

            console.log(server.app.admin_token);
        } catch (err) {
            log.error('ERROR : ', err);
        }
        }
    });
};

const validate = (request, username, password, callback) => {

    /**
     * Get value from redis using username as a key
     */
    let _username = '';
    const user_split = username.split('@');
    if (user_split.length === 1) {
        _username = username;
        username = username + '@sterlite.com';
    } else {
        _username = user_split[0];
    }
    
    
    redisClient.get(`iro_config-${config.env}`,
        (err_admin, value_admin) => {
            if(err_admin) {
                return callback(null, false);
            } 
            if(value_admin) {
                const admin_redis_details = JSON.parse(value_admin);
                server.app.admin_token = {
                    authorization : `Basic ${admin_redis_details.iro_admin.authorization}`,
                    jira_authorization : `Basic ${admin_redis_details.jira_admin.authorization}`,
                    session_time : admin_redis_details.session_time
                };
                if(admin_redis_details.iro_admin.username === _username && admin_redis_details.iro_admin.password === password) {
                    callback(null, true, {name: admin_redis_details.iro_admin.username});
                } else {
                    redisClient.get(`${username}-${config.env}`,
                        (err, value) => {
                            if (err) {
                                return callback(null, false);
                            } else {
                                /**
                                 * Get value from redis using value of above function as a key
                                 */
                                redisClient.get(value,
                                    (err, value2) => {
                                        if (err) {
                                            return callback(null, false);
                                        } else {
                                            try {
                                                const user_data_redis = JSON.parse(value2);
                                                const token = request.headers.authorization.split(' ');
                                                if (user_data_redis && user_data_redis.token_with_timestamp === token[token.length - 1]) {
                                                    const isValidSession = validateSessionTime(user_data_redis.timestamp, new Date().getTime());
                                                    if (isValidSession) {
                                                        user_data_redis.timestamp = new Date().getTime();
                                                        server.app.user_details = user_data_redis;
                                                        const reporter_authorization = Buffer.from(`${user_data_redis.jira_username}:${password.split(':')[0]}`).toString('base64');
                                                        server.app.admin_token = {
                                                            authorization : `Basic ${admin_redis_details.iro_admin.authorization}`,
                                                            session_time : admin_redis_details.session_time
                                                        };
                                                        redisClient.set(value, JSON.stringify(user_data_redis));
                                                        callback(null, true, user_data_redis);
                                                    } else {
                                                        return callback(null, false);
                                                    }
                                                } else {
                                                    return callback(null, false);
                                                }
                                            } catch (err) {
                                                return callback(null, false);
                                            }
                                        }

                                    });
                            }

                        });
                }
            }

        });
};

const validateSessionTime = (last_timestamp, current_timestamp) => {
    const sessionTime = server.app.admin_token.session_time*60*1000;
    if((current_timestamp - last_timestamp) > sessionTime) {
        return false;
    }
    return true;
};

module.exports = server;
