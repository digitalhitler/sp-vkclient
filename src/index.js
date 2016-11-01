/**
 * @project
 * sp-vkclient
 *
 * @description
 * VK.com API client based on generator flow.
 *
 * @repository
 * See `README.md` or visit GitHub repo for details:
 * https://github.com/digitalhitler/sp-vkclient
 *
 * @author
 * © Sergey Petrenko <spetrenko@me.com>
 */
'use strict';

const EventEmitter  = require('eventemitter3'),
      co            = require('co'),
      c             = require('chalk');

class VK extends EventEmitter {
  constructor(config) {
    super();
    this.initialized = false;
    this.authorized = false;
    this.verbose = true;
    this.when = this.on;
    this.lastRequest = 0;
    this.SuccessResponse = require("./Response/SuccessResponse");
    this.ErrorResponse = require("./Response/ErrorResponse");
    let result = this.init(config);
  }

  init(config, force = false) {
    let clientOptions = {};

    if(this.verbose) {
      console.log('VK module config:');
      console.dir(config);
    }

    if(this instanceof EventEmitter) {
      this.on('initialized', () => {
        if(this.config.auth && this.config.auth.need === true) {
          console.error('I am waiting for auth!');
        }
      });
      if(!this.initialized || force === true) {
        this.config = {};

        this.config.appId = config.appId || 2274003; //3140623;
        this.config.appSecret = config.appSecret || 'hHbZxrka2uZ6jB1inYsH'; // 'VeWdmVclDCtn6ihuP1nt';

        this.config.scope = config.scope || 'notify,friends,photos,audio,video,docs,notes,pages,status,offers,questions,wall,groups,messages,email,notifications,stats,ads,market,offline';
        if(typeof this.config.scope !== 'array' && this.config.scope.split) {
          this.config.scope = this.config.scope.split(',');
        }
        this.config.lang = config.lang || 0;
        this.config.version = config.version || '5.58';

        if(config.token !== undefined) {
          this.config.token = config.token || null;
        }

        if(config.auth) {
          // @todo: implement!
          if(!config.auth.login || !config.auth.password) {
            throw new ReferenceError(`config.auth is set but no login or password property are present!`);
          } else {
            this.config.auth = config.auth;
            this.config.auth.need = true;
            delete this.config.token;
          }
        }

        if(this.verbose) {
          console.log('Creating instance of VKClient.');
        }

        this._request = require('request-promise');

        this.initialized = true;
        this.emit('initialized');

        let self = this;
        co(function *initializationRequestFlow() {
          if(self.config.auth && self.config.auth.need === true) {
            console.log('VKClient: authorizing by credentials');
            let authResult = yield self.authorizeByLogin(self.config.auth.login, self.config.auth.password);
            if(authResult.access_token && authResult.user_id && authResult.email) {
              self.config.token = authResult.access_token;
              self.authorized = true;
              self.userEmail = authResult.email;
              delete self.config.auth;
            }
          }

          let currentUser = yield self.getUsers([]);
          if(currentUser && currentUser[0] && currentUser[0].id) {
            self.userId = currentUser[0].id;
            self.userFirstName = currentUser[0].first_name;
            self.userLastName = currentUser[0].last_name;
            if(self.verbose) console.log('VKClient: authorized as ' + self.userId);
            self.authorized = true;

            return yield Promise.resolve(true);
          } else {
            return yield Promise.reject(new self.ErrorResponse(ReferenceError(`Cant detect token owner`)));
          }
        })
            .then(function (res) {
              self.emit('ready');
              return true;
            })
            .catch(function (err) {
              let cName = c.dim;
              let cVal = c.bold.orange.underline;
              console.error(c.bold('* * * * * * * EXECUTION ERROR * * * * * * * *'));
              debugger;
              console.log(   cName('Type: ') + cVal(err._type) + '  ' + cName('Name: ') + cVal(err._name) + '   ' + cName('Code: ') + cVal(err._code));
              if(err._description) console.log(c.bold(err._description));
              if(err._errorObject && err._errorObject.message) console.log(c.bold.underline(err._errorObject.message));
              if(err._httpStatus) console.log(c.bold.yellow(`HTTP status: ${err._httpStatus}`));
              if(err._errorObject && err._errorObject.stack) {
                if(typeof err._errorObject.stack === 'object'
                    || typeof err._errorObject.stack === 'array') {
                  console.log(c.bold.underline('Stack:'))
                  for(let curr of err._errorObject.stack) {
                    console.log(curr);
                  }
                }
              }
            });
      }
    } else {
      throw new ReferenceError(`Cannot use VK without an constructed object.`);
      return false;
    }
  }

  *testMethod() {
    yield 'one';
    yield 'mor' +
    'e';
    yield 'time';
  }

  apiRequest (method, params = {}) {
    let reject = false;
    let request = [ method, params ];
    console.log(request);
    if(!this._request || typeof this._request !== 'function') {
      reject = new ReferenceError(`Cant send requests while client is not initialized fully yet.`);
    }
    if (typeof method !== 'string') {
      reject = new TypeError('"method" must be a string');
    }

    if(reject !== false) {
      return Promise.reject(
          new this.ErrorResponse(reject, request)
      );
    }

    if(this.lastRequest > 0 && Date.now() - this.lastRequest < 350) {
      var waitTill = this.lastRequest + 350;
      if(waitTill > Date.now()) {
        console.log(`Paused due to dont oversize requests count...`);
        while(waitTill > Date.now()){}
        console.log(`Resumed`);
      }
    }
    this.lastRequest = Date.now();
    let query = Object.assign({
      v: this.config.version,
      access_token: this.config.token || '',
      lang: this.config.lang
    }, params);
    return this._request(`https://api.vk.com/method/${method}`, {
      qs: query,
      timeout: 30000,
      json: true
    })
        .then(reply => {
          if(!reply.error && !reply.response.error) {
            return new this.SuccessResponse(reply, request);

          } else {
            return new this.ErrorResponse(reply.error || reply.response.error, request);
          }
        })
        .catch(error => {
          let result = null;

          debugger;
          // Connection was lost, trying to resend data
      if (error.error && ~['ETIMEDOUT', 'ESOCKETTIMEDOUT', 'ECONNRESET', 'ECONNREFUSED'].indexOf(error.error.code))
        return apiRequest.call(this, url, params);

      // Captcha needed
      if (error.code === 14) {
        error.description = 'Captcha wanted';
        result = new this.ErrorResponse(new Error(error), request);
      }

      // Probably auth error
      if (error.error && error.error.error && error.error.error_description) {
        result = new this.ErrorResponse(new VKAuthError({
          error:       'VK Error - ' + error.error.error,
          description: error.error.error_description
        }), request);
      }

      return result;
    });
  }

  authorizeByLogin() {
    return this._request('https://oauth.vk.com/token', {
      qs: {
        grant_type:    'password',
        client_id:     this.config.appId,
        client_secret: this.config.appSecret,
        username:      this.config.auth.login,
        password:      this.config.auth.password,
        scope:         this.config.scope.join(','),
        v:             this.config.version
      },
      json: true,
      timeout: 5000
    });
  }

  //getVideoAlbums(ownerId = null) {
  //
  //  return "resultofreturn" + ownerId;
  //}
  getVideoAlbums(ownerId = null, need_system = 0) {
    let self = this;
    return self.apiRequest('execute', this.prepareExecuteQuery('video.getAlbums', {
      extended: 1,
      need_system: 1,
      owner_id: ownerId || null
    }));
  }

  getVideo(ownerId = null, videoId = null, accessKey = '') {
    if(typeof accessKey === 'string' && accessKey.length > 0) {
      accessKey = '_' + accessKey;
    }
    return this.apiRequest('video.get', {
      videos: ownerId + '_' + videoId + accessKey,
      count: 200,
      extended: 1
    });
  }

  getVideos(ownerId = null, albumId = null) {
    return this.apiRequest('execute', this.prepareExecuteQuery('video.get', {
      owner_id: ownerId || null,
      album_id: albumId || null,
      count: 200,
      extended: 1
    }));
  }

  getUsers(ids) {
    if(typeof ids === 'array') {
      ids = ids.join(',');
    } else if(ids === undefined || ids === null) {
      ids = null;
    }
    return this.apiRequest('users.get', this.prepareQuery({
      user_ids: ids
    }));
  }

  getGroups(ids) {
    if(typeof ids === 'array') {
      ids = ids.join(',');
    } else if(ids === undefined || ids === null) {
      ids = null;
    }
    return this.apiRequest('groups.getById', this.prepareQuery({
      group_ids: ids
    }));
  }

  prepareExecuteQuery(method, options = {}) {
    let queryCode = '',
        queryOptions = [];
    if(!method || typeof method !== 'string') {
      throw new TypeError(`method is not a string.`);
    }
    if(!options || typeof options !== 'object') {
      options = {};
    }

    options.count = options.count || 100;
    options = this.prepareQuery(options);

    if(options.count > 0) {
      for(let option in options) {
        queryOptions.push(`"${option}": "${options[option]}"`);
      }
      queryOptions = queryOptions.join(', ');
    }
    queryCode = `
    var items = [];
    var result = API.${method}({ ${queryOptions}, "offset": 0 });
    if(!result.items) {
      return false;
    }
    var totalPlanned = parseInt(result.count);
    var total = result.items.length;
    
    var offset = parseInt(result.items.length);
    var iterations = 1;
    var left = totalPlanned - offset;
    
    items = result.items;
    if(offset > 0) {
      while(offset < 10000 && left > 0 && iterations < 23) {
        iterations = iterations + 1;
        result = API.${method}({ ${queryOptions}, "offset": offset }).items;
        if(result.length > 0) {
          offset = offset + result.length;
          left = left - result.length;
          total = total + result.length;
          items = items + result;
        }
      }
    }
    return {
      count: total,
      countPlanned: totalPlanned,
      iterations: iterations,
      items: items,
    };
    `;
    console.log(queryCode);
    return {
      'code': queryCode
    }
  }

  prepareQuery(fields) {
    if(!fields || typeof fields !== 'object') {
      throw new ReferenceError(`Failed to request with fields is: `, fields);
    } else {
      for(let field in fields) {
        if(fields[field] === null) {
          delete fields[field];
        }
      }
      fields.lang = this.config.lang;
      return fields;
    }
  }

  static handleError(err) {
    console.error('Error happened!');
    console.dir(err);
  }
}


module.exports = VK;
