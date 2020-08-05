
/*******************************************************************************
 * Copyright (c) Sterlite Technologies Ltd.
 ******************************************************************************/

const mainController = require('src/controller/main_controller');

module.exports = [
    { method: 'GET', path: '/', config: mainController.start },  
    { method: 'GET', path: '/email', config: mainController.start },
    // { method: 'POST', path: '/sendMail', config: mainController.sendMail },
      { method: 'POST', path: '/mail-init/{type}', config: mainController.mailInit },
      { method: 'POST', path: '/sendEmailToUser', config: mainController.sendMailToUser }
    ];

