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

"use strict";

const VK = require('./src/index');

function yielder(cb) {
  function executeYield(cmd, callback) {
    callback();
  }

  const iterator = cb();
  let next = iterator.next();
  debugger;
  while(!next.done) {
    const cmd = next.value;
    executeYield(cmd, function(value) {
      next = iterator.next(value);
    });
  }
}

function* zeroFunc() {
  let prom = new Promise((res, rej) => {
    setTimeout(() => {
      res(99);
      debugger;
    }, 2000);
  });
  setTimeout(() => {
    prom.resolve(123);
  }, 2000);
  return prom;
}

yielder(function* runYieldContext() {
  let vkClient = new VK({
    'token': ''
  });

  let zero = yield zeroFunc;
  let one = yield vkClient.getGroups([1]);
  let two = yield vkClient.getUsers ([1]);
  let three = yield vkClient.getVideos(1);
  debugger;
});

console.log('Welcome to the test VK client runtime!\n\n');

