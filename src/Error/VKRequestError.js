'use strict';
const util = require('util');
class VKRequestError extends Error {
  constructor (errorObject = {}) {
    super(errorObject.error);

    this.name = 'VKRequestError';
    this.code = errorObject.code || 'EVKREQUEST';
    this.requestObject = errorObject.requestObject || '<no request>';
    this.responseError = errorObject.responseError || null
    this.httpStatus = errorObject.httpStatus || '<unknown>';
    this.description = errorObject.description || '<no description>';
  }

  toString() {

    // Format server response error string if provided:
    let serverRespondWithError = '';
    if(this.responseError !== null) {
      serverRespondWithError = `Server respond with error ${this.responseError.error_code}: ${this.responseError.error_msg}\n`;
    }
    debugger;

    // Format general (common) object humanized string:
    let result = `${this.name} (${this.code}):\n${this.description}\n${serverRespondWithError}Request object:\n`;
    debugger;

    // Append request object if provided:
    if(typeof this.requestObject === 'string') {
      result = result + this.requestObject;
    } else {
      result = result + util.inspect(this.requestObject, { showHidden: true, depth: 3, color: true });
    }

    // Append HTTP code:
    result = result + `\nHTTP response status code: ${this.httpStatus}`;

    return result;
  }
}

module.exports = VKRequestError;
