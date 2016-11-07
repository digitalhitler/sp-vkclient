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
      debug         = require('debug')('sp-vkclient'),
      co            = require('co'),
      c             = require('chalk');


// List of default settings & options values;
const SPVK_OPTIONS = {
  FULLSCOPE: 'notify,friends,photos,audio,video,docs,notes,pages,status,offers,questions,wall,groups,messages,email,notifications,stats,ads,market,offline',
  DEFAULT_APPLICATION_ID: 2274003, // another one ID: 3140623;
  DEFAULT_APPLICATION_SECRET: 'hHbZxrka2uZ6jB1inYsH' // and another one secret: 'VeWdmVclDCtn6ihuP1nt';
}

/**
 * @class VK
 * @extends EventEmitter
 */
class VK extends EventEmitter {
  /**
   * VK Client object constructor
   * @param config
   */
  constructor(config) {
    super();

    // Fill general state values
    this.initialized = false;
    this.authorized = false;
    this.verbose = config.verbose || false;
    this.lastRequest = 0;

    // Add links to response constructors:
    this.SuccessResponse = require("./Response/SuccessResponse");
    this.ErrorResponse = require("./Response/ErrorResponse");

    // And schema-based objects:
    this.Objects = {
      Videoalbum: require("./Object/VKVideoalbum")
    };

    // Enable verbose mode if requested
    if(this.verbose) {
      if(!process.env.DEBUG) {
        process.env.DEBUG = 'sp-vkclient:*'
      }
    }
  }

  /**
   * Perform full cycle of initialization process
   * @param config
   * @param force
   * @returns {Promise<U>|Promise.<T>} Promise that resolves with initialized instance of VKClient
   */
  static initialize(config) {

    async function performInitialization(config) {
      let facadeInstance;
      try {
        facadeInstance        = new VK(config);
        facadeInstance.config = VK.normalizeConfiguration(config);
        facadeInstance.log    = debug;
        facadeInstance._request = require('request-promise');

        if(facadeInstance.config.auth && facadeInstance.config.auth.need === true) {
          facadeInstance.log('VKClient: authorizing by credentials');
          let authorized = facadeInstance.authorizeByLogin(facadeInstance.config.auth.login, facadeInstance.config.auth.password);
            if(authorized.access_token && authorized.user_id && authorized.email) {
              facadeInstance.config.token = authorized.access_token;
              facadeInstance.authorized = true;
              facadeInstance.userEmail = authorized.email;
              delete facadeInstance.config.auth;
            }
        }

        if(facadeInstance.config.fastLoad !== true) {

          let currentUser = await facadeInstance.getUsers([]);
          if (currentUser && currentUser[0] && currentUser[0].id) {
            facadeInstance.userId        = currentUser[0].id;
            facadeInstance.userFirstName = currentUser[0].first_name;
            facadeInstance.userLastName  = currentUser[0].last_name;

            if (facadeInstance.verbose) facadeInstance.log('VKClient: authorized as ' + facadeInstance.userId);
            facadeInstance.authorized = true;
            return facadeInstance;
          } else {
            return false;
          }
        }

        facadeInstance.initialized = true;
        facadeInstance.log('Completely initialized VK client', config);
        facadeInstance.emit('client:initialized');

        return facadeInstance;
      } catch(e) {
        throw e;
      }
    }
    return new Promise((done, failed) => {
      let client = performInitialization(config);
      if(client.initialized === true) {
        done(client);
      } else {
        failed(client);
      }
    }).catch((err) => {
      VK.handleError(err);
    });
  }

  static normalizeConfiguration(config) {
    let normalizedConfig = {};

    normalizedConfig.appId = config.appId || SPVK_OPTIONS.DEFAULT_APPLICATION_ID;
    normalizedConfig.appSecret = config.appSecret || SPVK_OPTIONS.DEFAULT_APPLICATION_SECRET;

    normalizedConfig.fastInit = config.fastInit || false;

    if(config.requestsInterval) {
      if(typeof config.requestsInterval === 'number') {
        normalizedConfig.requestsInterval = (config.requestsInterval === 0 ? null : config.requestsInterval);
      } else {
        throw new TypeError(`passed config.requestsInterval is not a number.`);
      }
    } else {
      normalizedConfig.requestsInterval = 330;
    }

    normalizedConfig.scope = config.scope || SPVK_OPTIONS.FULLSCOPE;
    if(typeof normalizedConfig.scope !== 'array' && normalizedConfig.scope.split) {
      normalizedConfig.scope = normalizedConfig.scope.split(',');
    }
    normalizedConfig.lang = config.lang || 0;
    normalizedConfig.version = config.version || '5.58';

    if(config.token !== undefined) {
      normalizedConfig.token = config.token || null;
    }

    if(config.auth) {
      // @todo: implement!
      if(!config.auth.login || !config.auth.password) {
        throw new ReferenceError(`config.auth is set but no login and password properties are present!`);
      } else {
        normalizedConfig.auth = config.auth;
        normalizedConfig.auth.need = true;
        delete normalizedConfig.token;
      }
    }

    return normalizedConfig;
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

  apiRequestPlain (method, params = {}) {
    let reject = false;
    let request = [ method, params ];

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
          // @todo: refactor this condition
          if(!reply.error && !reply.response.error) {
            let result = new this.SuccessResponse(reply, request);
            result.request = request;
            return result;

          } else {
            // @todo: implement error codes & descriptions from https://vk.com/dev/errors
            let result = new this.ErrorResponse(reply.error || reply.response.error, request);
            result.request = request;
            return result;
          }
        })
        .catch(error => {
          let result = null;

          debugger;
          // Connection was lost, trying to resend data
      if (error.error && ~['ETIMEDOUT', 'ESOCKETTIMEDOUT', 'ECONNRESET', 'ECONNREFUSED'].indexOf(error.error.code))
        return apiRequestPlain.call(this, url, params);

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

  async authorizeByLogin() {
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
  async getVideoAlbums(ownerId = null, needSystem = 1) {
    let self = this;
    let albums = await self.apiRequestPlain('execute', this.prepareExecuteQuery('video.getAlbums', {
      extended: 1,
      need_system: needSystem,
      owner_id: ownerId || null
    }));
    let formatted;

    if(albums && albums instanceof this.SuccessResponse) {
      formatted = albums.getFormattedItems(this.Objects.Videoalbum);
      debugger;
    }

    console.log('done', albums);
    debugger;
  }

  async getVideo(ownerId = null, videoId = null, accessKey = '') {
    if(typeof accessKey === 'string' && accessKey.length > 0) {
      accessKey = '_' + accessKey;
    }
    return this.apiRequestPlain('video.get', {
      videos: ownerId + '_' + videoId + accessKey,
      count: 200,
      extended: 1
    });
  }

  getVideos(ownerId = null, albumId = null) {
    return this.apiRequestPlain('execute', this.prepareExecuteQuery('video.get', {
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
    return this.apiRequestPlain('users.get', this.prepareQuery({
      user_ids: ids
    }));
  }

  getGroups(ids) {
    if(typeof ids === 'array') {
      ids = ids.join(',');
    } else if(ids === undefined || ids === null) {
      ids = null;
    }
    return this.apiRequestPlain('groups.getById', this.prepareQuery({
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
