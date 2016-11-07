"use strict";

class VKResponse {
  constructor(data) {
    this._data = data || null;
    this._request = undefined;
    this._type = undefined;
    this._httpStatus = 200;
  }

  set request(req) {
    console.log('---------trying to set request', req);
    let result
    if(req && !this._requestHasBeenSet) {
      this._requestHasBeenSet = true;
      if(typeof req === 'array') {
        this._request = {
          method: req[0],
          params: req[1]
        };
      } else if(typeof req === 'object' && (req.method && req.params || req.length === 2)) {
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
    return this._request || null;
  }

  get data() {
    return this._data || false;
  }

  get response() {
    if(this._data && this._data.response) {
      return this._data.response;
    } else return false;
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
