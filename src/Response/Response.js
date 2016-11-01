"use strict";

class VKResponse {
  constructor(data) {
    this._data = data || null;
    this._request = undefined;
    this._type = undefined;
    this._httpStatus = 200;
  }

  set request(req) {
    if(req && !this._requestHasBeenSet) {
      this._requestHasBeenSet = true;
      if(typeof req === 'array') {
        this._request = {
          method: req[0],
          params: req[1]
        };
      } else if(typeof req === 'object' && req.method && req.params) {
        this._request = req;
      } else {
        this._requestHasBeenSet = false;
        return false;
      }
    } else {
      return false;
    }
  }

  get request() {
    return this._request;
  }

  toString() {

  }

  toJSON() {
    return {
      type: this._type,
      httpStatus: this._httpStatus,
      data: this._data,
      request: this._request
    };
  }
}

module.exports = VKResponse;
