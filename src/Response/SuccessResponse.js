"use strict";

let VKResponse = require("./Response");

class VKSuccessResponse extends VKResponse {
  constructor(data, request = null) {
    super(data);
    this._type = 'Success';

    if(typeof request === 'object') {
      this.request = request;
    }
  }
}

module.exports = VKSuccessResponse;
