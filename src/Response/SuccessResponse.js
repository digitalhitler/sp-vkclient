"use strict";

const VKResponse = require("./Response");
const VKObject = require("../Object/VKObject");

class VKSuccessResponse extends VKResponse {
  constructor(data, request = null) {
    super(data);
    this._type = 'Success';

    if(typeof request === 'object') {
      console.log('----------request param is set', request);
      this.request = request;
      console.log('this.request result iiiiiiiiiis', this.request);
    }
  }

  getAssociatedItems(fieldName = 'id', fieldNumberize = true) {
    let result = false,
        item,
        key;

    if (   this.response
        && this.response.items
        && this.response.items.length > 0) {

      result = {};

      for(let curr in this.response.items) {

        key = curr;

        if(fieldNumberize === true) {

          curr = parseInt(curr);
          key = (isNaN(curr) ? false : curr);

        }

        if(key !== false) {
          item                    = this.response.items[key];
          result[item[fieldName]] = item;
        }
      }
    }

    return result;
  }

  getFormattedItems(objectType = null) {
    let result = {}, items;
    if(this.response && this.response.items && this.response.items.length > 0) {

      if (objectType !== null) {

        for(let curr in this.response.items) {

          let item = this.response.items[curr];
          let itemObj = new objectType(item);
          itemObj.fillObject();

          if(itemObj._filled) {
            result[itemObj.id] = itemObj;
          } else {
            result.push(itemObj);
          }
        }

        return result;

      } else {
        return TypeError('objectType has no VKObject in prototype tree.');
      }
    }
  }
}

module.exports = VKSuccessResponse;
