// ** Supporting functions for Global usage **
// **

function sendResponse(status, statusCode, res, message){
    const response = {
        status: status,
        response: message
    }

    res.status(statusCode).json(response);
}

function sendExceptionResponse(res, error){
    sendResponse(false, 400, res, error);
}

function getResStatus(responseObj){
    return responseObj? 200 : 404;
}

function getResMessage(responseObj){
    return responseObj? responseObj : "Record not found";
}

module.exports.sendResponse = sendResponse;
module.exports.sendExceptionResponse = sendExceptionResponse;
module.exports.getResStatus = getResStatus;
module.exports.getResMessage = getResMessage;