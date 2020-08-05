/*******************************************************************************
 * Copyright (c) Sterlite Technologies Ltd.
 ******************************************************************************/

const log = require('logger/logger'),
    config = require('config'),
    Response = require('src/utils/Response'),
    StatusCodes = require('src/utils/StatusCodes'),
    ResponseMessages = require('src/utils/ResponseMessages'),
    EndPoints = require('src/utils/Endpoints'),
    fs = require("fs"),
    Constants = require('src/utils/Constants');

    const Utils = require('src/utils/utils');
    const nodeMailer = require('nodemailer');
    const cron = require('node-cron');
    const MailLog = require('src/models/mail_logs');

    const transporter = nodeMailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'zerodayiauro@gmail.com',
            pass: 'zerodayiauro100'
        }
    });
    
    const ejs = require("ejs");

const triggerMail = (members, projectID, sprintID, name) => {
    // ?sprintID=${sprintID}
    members.forEach(member => {
        let mailOptions = {
            from: 'Sterlite DSR <sterlitemail@gmail.com>', // sender address
            to: member.email, // list of receivers
            subject: `Sterlite Daily Report | ${name}`, // Subject line
            // text: 'Report', // plain text body
            html: `<p>Following is the link for daily status report of project "${name}":</p>
                <a href="${config.frontend_service.baseURL}/${config.frontend_service.directory}/#/home/projectdetails/${projectID}/entire-report">Click here!</a>` // html body
        };

        if(member.email) {
            transporter.sendMail(mailOptions, (error, info) => {
                console.log("Email info: ", info);
                if (error) {
                    console.log("Email error: ", error);
                    MailLog.create({
                        type: "Error",
                        email: member.email,
                        error: JSON.stringify(error)
                    });
                    // reply(Response.sendResponse(false, error, ResponseMessages.EMAIL_SENT_FAILED, StatusCodes.BAD_REQUEST)).code(StatusCodes.BAD_REQUEST);
                } else {
                    // reply(Response.sendResponse(true, null, ResponseMessages.EMAIL_SENT_SUCCESS, StatusCodes.OK)).code(StatusCodes.OK);
                    MailLog.create({
                        type: "Success",
                        email: member.email,
                        error: ""
                    });
                }
            });
        }
    });

};

const sendMail = () => {
    console.log('scheduled');
    // const job = cron.schedule('00 21 * * *', () => {
        const jira_options = {
            url: `${EndPoints.JIRA_PROJECT_ID_URL}email-data`,
            method: 'GET',
            headers: {
                'Authorization': server.app.admin_token.authorization
            }
        };

        console.log("jira_options: ", jira_options);

        Utils.callAPI(jira_options, undefined, success => {
            console.log("Get email data success: ", success);
            if(success.result && success.result.length) {
                success.result.forEach(scrum => {
                    if(scrum.scrum_members && scrum.scrum_members.length > 0) {
                        triggerMail(scrum.scrum_members, scrum.project_id, scrum.sprint_id, scrum.name)
                    }
                })
            }
        }, (error) => {
            console.log("Get email data error: ", error);
        });

        // triggerMail(request, reply);
    // });
};

const synchronizeLdapUsers = () => {
    const user_mgmnt_options = {
        url: `${EndPoints.USER_MGMNT_URL}addLdapUsers`,
        method: 'GET',
        headers: {
            'Authorization': server.app.admin_token.authorization
        }
    };

    console.log("user_mgmnt_options: ", user_mgmnt_options);

    Utils.callAPI(user_mgmnt_options, undefined, success => {
        console.log("Ldap users added: ", success);
    }, (error) => {
        console.log("Error adding ldap users: ", error);
    });
};

const sendWSRMail = () => {
    console.log('scheduled');
    // const job = cron.schedule('00 21 * * *', () => {
    const jira_options = {
        url: `${EndPoints.UPLOAD_REQUIREMENT_URL}wsr-emails-list`,
        method: 'GET',
        headers: {
            'Authorization': server.app.admin_token.authorization
        }
    };

    console.log("jira_options: ", jira_options);

    Utils.callAPI(jira_options, undefined, success => {
        console.log("Get email data success: ", success);
        // if(success.result && success.result.length) {
        //     success.result.forEach(scrum => {
        //         if(scrum.scrum_members && scrum.scrum_members.length > 0) {
        //             triggerMail(scrum.scrum_members, scrum.project_id, scrum.sprint_id, scrum.name)
        //         }
        //     })
        // }
    }, (error) => {
        console.log("Get email data error: ", error);
    });

    // triggerMail(request, reply);
    // });
};

exports.startCronjob = () => {
    console.log("Cron job started");
    cron.schedule('00 21 * * Monday-Friday', () => {
        sendMail();
        synchronizeLdapUsers();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    // cron.schedule('00 21 * * Friday', () => {
    //     sendWSRMail();
    // }, {
    //     scheduled: true,
    //     timezone: "Asia/Kolkata"
    // });
};

exports.mailInit = (request, reply) => {
    let html = `<p>Hi ${request.payload.name},</p> <br/>
               <p>You have ${request.payload.no_of_requests} requests to be approved on DevOpsOnTap platform. Please <a href="${config.frontend_service.baseURL}/${config.frontend_service.directory}/#/home/reusability/to-be-approved">Click here!</a> to check the requests.</p><br/>
               <p>Thank you!</p>`;

    if (request.params.type === 'approved') {
        html = `<p>Hi ${request.payload.name},</p> <br/>
               <p>Your requests has been approved on DevOpsOnTap platform. Please <a href="${config.frontend_service.baseURL}/${config.frontend_service.directory}/#/home/reusability/my-raised-request">Click here!</a> to check the approved requests.</p><br/>
               <p>Thank you!</p>`;
    }
    const mailOptions = {
        html, // html body,
        from: 'Sterlite <sterlitemail@gmail.com>', // sender address
        to: request.payload.email, // list of receivers
        subject: `Sterlite Reusability`, // Subject line
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Email error: ", error);
            reply(Response.sendResponse(false, error, ResponseMessages.EMAIL_SENT_FAILED, StatusCodes.BAD_REQUEST)).code(StatusCodes.BAD_REQUEST);
        } else {
            reply(Response.sendResponse(true, null, ResponseMessages.EMAIL_SENT_SUCCESS, StatusCodes.OK)).code(StatusCodes.OK);
        }
    });
};
exports.sendMailToUser = (request, reply) => {
  
    
    const allMailTypes = {
        intro: 'intro',
        forgotPassword: 'forgot_password',
        resetPassword: 'reset_password',
        team_created : 'team_created'
    }
    var fileName;
    console.log(`mail type ${request.payload.mail_type}`);
    var mailType = request.payload.mail_type ;
    var email = request.payload.email ;
    var mailTitle ;
    var isValidParam = true;
    var parameters;
        switch(mailType) {
        case allMailTypes.intro:
            fileName = "/email_templates/intro.ejs";
            parameters = {
                project_name: request.payload.project_name,
                board_id:request.payload.board_id
            };
            mailTitle = `${request.payload.project_name} | Onboarding on aurOps`;
        
            break;
        case allMailTypes.forgotPassword:
            fileName = "/email_templates/forgot_password.ejs";
            parameters = {
                forgot_password_link : request.payload.forgot_password_link,
                site_link : request.payload.site_link
             };
            mailTitle = `Forgot Password`;
            break;
        case allMailTypes.resetPassword:
            fileName = "/email_templates/forgot_password.ejs";
            parameters = {
              };
            mailTitle = `Reset Password`;
            break;
            case allMailTypes.team_created:
            fileName = "/email_templates/team_created.ejs";
            parameters = {
              };
            mailTitle = `Team created`;
            break;
        default:
            reply(Response.sendResponse(false, `Mail type is not defined, mail types are ${allMailTypes}`, ResponseMessages.EMAIL_SENT_FAILED, StatusCodes.BAD_REQUEST)).code(StatusCodes.BAD_REQUEST);
         break;
        }
    ejs.renderFile( __dirname + fileName, parameters, function (err, data) {
    if (err) {
        console.log("Error occured in redering html file");
        console.log(err);
        reply(Response.sendResponse(false, err, ResponseMessages.EMAIL_SENT_FAILED, StatusCodes.BAD_REQUEST)).code(StatusCodes.BAD_REQUEST);
     
    } else {
  
    const mailOptions = {
       html: data, // html body,
        from: 'Test <zerodayiauro@gmail.com>', // sender address
        to: email, // list of receivers
        subject: mailTitle, // Subject line
        // attachments: [
        //     {
        //         path : "./attachments/image1.png"
        //     },
        //     {
        //         path : "./attachments/image2.png"
        //     }
        //   ]
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Email error: ", error);
            reply(Response.sendResponse(false, error, ResponseMessages.EMAIL_SENT_FAILED, StatusCodes.BAD_REQUEST)).code(StatusCodes.BAD_REQUEST);
        } else {
           reply(Response.sendResponse(true, null, ResponseMessages.EMAIL_SENT_SUCCESS, StatusCodes.OK)).code(StatusCodes.OK);
        } 
    });
}
});
};
