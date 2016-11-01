"use strict";

let VKResponse = require("./Response");

class VKErrorResponse extends VKResponse {
  constructor(err, request = null) {
    super();
    this._type = 'Error';

    if(typeof request === 'object') {
      this.request = request;
    }

    if(err instanceof Error) {
      this._errorObject = err;
      this._name = err.name || 'ErrorResponse';
      this._description = err.description || null;
      this._code = err.code || null;
      this._httpStatus = err.httpStatus || null;
    } else {
      this._error = err;
    }
  }

  toString() {
    for(let prop in this) {
      console.log(`${prop}: ${this[prop]}`);
    }
  }
}

module.exports = VKErrorResponse;
