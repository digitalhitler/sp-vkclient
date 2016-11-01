"use strict";

console.log('Welcome to the test VK client runtime!\n\n');

const co = require("co");
const VK = require('./index');
//
//!function a(b) {
//  let c = b.next().value;
//  c instanceof Promise
//  && c.then((c=>a(b, c)), (a=>b.throw(a)))
//}
//(function*() {
//
//
//// наш код...
//
//// пауза
//  console.log(1);
//
//// теперь JS "научился" приостанавливать выполнение
//// кода и ждать завершения асинхронных операций
//  yield new Promise((resolve => setTimeout(resolve, 3000)));
//
//// ура, едем дальше...
//  console.log(2);
//
//
//// -- конец плоского асинхронного кода (ПОДВАЛ) --
//}());



//var co = require('co');
//
//co(function *(){
//  // yield any promise
//  var result = yield Promise.resolve(true);
//}).catch(onerror);
//
//co(function *(){
//  // resolve multiple promises in parallel
//  var a = VKClient.getUsers([1,4912250]);
//  var b = Promise.resolve(2);
//  var c = Promise.resolve(3);
//  var res = yield [a, b, c];
//  console.log(res);
//  // => [1, 2, 3]
//}).catch(onerror);
//
//// errors can be try/catched
//co(function *(){
//  try {
//    yield Promise.reject(new Error('boom'));
//  } catch (err) {
//    console.error(err.message); // "boom"
//  }
//}).catch(onerror);
//
//function onerror(err) {
//  // log any uncaught errors
//  // co will not throw any errors you do not handle!!!
//  // HANDLE ALL YOUR ERRORS!!!
//  console.dir(err);
//  console.error(err.stack);
//}
//
//VKClient.getVideoAlbums().then(res => {
//  if(res && res.items && res.items.length > 0) {
//
//  }
//}).catch(err => {
//  console.error('Fatality!', err);
//});
//


