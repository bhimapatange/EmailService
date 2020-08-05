
/*******************************************************************************
 * Copyright (c) Sterlite Technologies Ltd.
 ******************************************************************************/

const Response = require('src/utils/Response'),
    request = require('request'),
    EndPoints = require('src/utils/Endpoints');


/**
 *
 * @param response
 * @param body
 * @param success
 * @param error
 * @returns {*}
 */
const  handleResponse =  (response, body, success, error) => {
    /**
     * Check if error code is greater than 299
     * else set to 500
     */
    if(response && response.statusCode > 299) {
        return error(body, response.statusCode);
    } else {
        if( body) {

            /**
             * Check the type of data and convert to object
             * @type {{}}
             */

            let resp_data = {};
            if (typeof body === 'string') {
                resp_data = JSON.parse(body);
            } else {
                resp_data = JSON.parse(JSON.stringify(body));
            }

            return success(resp_data);
        } else {
            return success(response);
        }
    }
};

/**
 * Class to perform rest request
 * This class is used to call third party APIs
 *
 */
class PerformRequest {

    constructor( options  ) {
        this.method = options.method;
        this.url = options.url;
        this.data = options.data;
        this.form = options.form;
        this.qs = options.params;
        this.headers = options.headers;
    }

    /**
     * Method to call APIs
     * @param success
     * @param error
     * @returns {*}
     */
    makeRequest(  success , error  ) {
        try {

            /**
             * Options for http request
             * @type {{url: *, method: *}}
             */
            const options = {
                url: this.url,
                method: this.method,
                headers : this.headers };

            if( this.method === 'POST' || this.method === 'PUT'  ) {
                switch(this.headers['Content-Type']){
                    case EndPoints.CONTENT_TYPE.JSON:
                        options.json = this.data;
                        break;
                    case EndPoints.CONTENT_TYPE.FORM:
                        options.form = this.data;
                        break;
                    case EndPoints.CONTENT_TYPE.FORM_DATA:
                        console.log('1');
                        options.formData = this.data;
                        break;
                    case EndPoints.CONTENT_TYPE.TEXT_XML:
                        options.body = this.data;
                        break;
                    default:
                        options.json = this.data;
                        break;
                }
                if(this.headers['Content-Type'] === EndPoints.CONTENT_TYPE.FORM_DATA) {
                    this.headers['Content-Type'] = `${this.headers['Content-Type']}; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW`;
                }
                console.log('options: ', JSON.stringify(options));
                
                // if (this.form) { options.formData = this.form; }

                // if (this.data) {
                //     options.body = this.data;
                //     options.json = true;
                // }
            }

            /**
             * Request method call
             */


            request( options, ( err , response , body ) => {
                if( err ) {
                    /**
                     * Check if error code is greater than 299
                     * else set to 500
                     */
                    if(response && response.statusCode > 299) {
                        return error(body, response.statusCode);
                    } else {
                        return error(err, 500);
                    }
                } else {
                    /**
                     * Handle response
                     */
                    return handleResponse(response, body, success, error);
                }
            });
        } catch ( err ) {
            return error(err, 500);
        }
    }

}

module.exports = PerformRequest;
