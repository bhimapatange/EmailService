/*******************************************************************************
 * Copyright (c) Sterlite Technologies Ltd.
 ******************************************************************************/

const Joi = require('joi');
module.exports = (() => {
    return {
        sendMail: {
            payload: {
                email: Joi.string().required().example('test@test.com').description('Email of user to send mail'),
                projectID: Joi.string().required().example('123456').description('Project ID of report'),
                sprintID: Joi.string().required().example('123').description('Sprint ID of report')
            },
            headers: Joi.object({
                'authorization': Joi.string().required()
            }).options({ allowUnknown: true })
        },
        mailInit: {
            params: {
                type: Joi.string().required().example('approval').valid('approval', 'approved').description('Type of mail template.'),
            },
            payload: {
                email: Joi.string().required().example('john.doe@test.com').description('Email of user to send mail'),
                name: Joi.string().allow(null, '').example('John Doe').description('name of the person to send email'),
                no_of_requests: Joi.number().allow(null, 0).example(1).description('Number of requests.')
            },
            headers: Joi.object({
                'authorization': Joi.string().required()
            }).options({ allowUnknown: true })
        },
        sendMailToUser: {
            payload: {
                email: Joi.string().required().example('test@test.com').description('Email of user to send mail'),
                mail_type :Joi.string(),
                board_id: Joi.string().when('mail_type', { is: 'intro', then: Joi.string().required() }),
                project_name: Joi.string().when('mail_type', { is: 'intro', then: Joi.string().required() }),
                 site_link : Joi.string().when('mail_type', { is: 'forgot_password', then: Joi.string().required() }),
                 forgot_password_link : Joi.string().when('mail_type', { is: 'forgot_password', then: Joi.string().required() })

            }
        }
    };
})();
