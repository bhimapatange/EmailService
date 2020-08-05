
/*******************************************************************************
 * Copyright (c) Sterlite Technologies Ltd.
 ******************************************************************************/

const CallAPI = require('src/classes/RESTClient');
exports.callAPI = (options, contentType, success, error) => {

    console.log("########### : server.app.admin_token : ", server.app.admin_token );
    let apiCall = new CallAPI(options);
    // if (contentType !== undefined) {
    //     apiCall = new CallAPI(options);
    // } else {
    //     apiCall = new CallAPI(options, contentType);
    // }
    apiCall.makeRequest(result => {
        success(result);
    }, (err, statusCode) => {
        error(err, statusCode);
    });
};

exports.hashCode = (plain_string) => {
    let hash = 0, i, chr;
    if (plain_string.length === 0) return hash;
    for (i = 0; i < plain_string.length; i++) {
        chr   = plain_string.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

exports.validateScehma = (schema_flow) => {
    console.log("Schema: ", schema_flow);
    const statenames = schema_flow.map(state => state.statename);
    const pathsCoveredPrevious = Array.from(new Set(schema_flow.map(state => {
        if(state.prev)
            return state.prev;
    }))).filter(path => path !== undefined);

    const pathsCoveredNext = Array.from(new Set(schema_flow.map(state => {
        if(state.next)
            return state.next;
    }))).filter(path => path !== undefined);

    const pathsCovered = Array.from(new Set(pathsCoveredPrevious.concat(pathsCoveredNext)));

    console.log("statenames: ", statenames);
    console.log("pathsCovered: ", pathsCovered);
    console.log("pathsCovered Prev: ", pathsCoveredPrevious);
    console.log("pathsCovered Next: ", pathsCoveredNext);
    const remaining_paths = statenames.filter(value => !pathsCovered.includes(value));
    console.log("Remaining Paths: ", remaining_paths);

    if(remaining_paths.length > 0) {
        return {
            isValid: false,
            message: "Paths not covered: " + remaining_paths.toString(),
        };
    }

    return {
        isValid: true
    }

};


