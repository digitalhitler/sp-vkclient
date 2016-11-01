'use strict';

class VKRequestError extends Error {
  constructor (errorObject = {}) {
    super(errorObject.error);

    this.name = 'VKRequestError';
    this.code = errorObject.code || null;
    this.httpStatus = errorObject.httpStatus || null;
    this.description = errorObject.description;
  }
}

module.exports = VKRequestError;
