"use strict";

class VKObject {

  constructor(data, schema) {
    this._data = data;
    this._schema = schema;
    this._filled = true;
  }

  static processField(key, curr, data) {
    let result = {
      id: false,
      val: null
    };
    let identifier = (curr.key || false),
        field = curr.field,
        value = (data[field] || undefined),
        def = (curr.default || null),
        proper = true,
        type = curr.type;
    switch(type) {
      case String:
        value = data[field];
        break;
      case Number:
        value = parseInt(data[field]);
        if (isNaN(value)) {
          proper = false;
        }
        break;
      case Boolean:
        if(typeof data[field] !== "undefined") {

        } else {
          proper = false;
        }
      case Array:
        value = data[field];
        if (typeof value === 'undefined' || typeof value.length === 'undefined') {
          proper = false;
        }
        break;
    }

    if(proper === false || value === undefined || (value.length && value.length === 0)) {
      if(def) {
        value = def;
      }
    }

    if(identifier === true) {
      result.id = value;
    }

    result.val = value;

    return result;
  }

  processObject() {
    let result = {
      id: null,
      obj: {}
    };
    let data = this._data || undefined,
        schema = this._schema || undefined;

    if(data && schema) {
      for(let key in schema) {
        let f = VKObject.processField(key, schema[key], data);
        if(f.id !== false) {
          result.id = f.id;
        }

        result.obj[key] = f.val;
      } // endfor
      return result;
    } else {
      debugger;
      return false;
    }
  }

  fillObject(obj = this.processObject()) {
    if(obj && obj.obj) {
      for(let curr in obj.obj) {
        this[curr] = obj.obj[curr];
      }
      this._filled = true;
    }
  }
}


module.exports = VKObject;
