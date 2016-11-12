"use strict";

const VKObject = require("./VKObject");

const VKVideoalbumSchema = {
  "id":       { type: Number,  field: "id", unique: true, key: true },
  "ownerId":  { type: Number,  field: "owner_id", default: 0 },
  "title":    { type: String,  field: "title" },
  "count":    { type: Number,  field: "count" },
  "isSystem": { type: Boolean, field: "is_system", default: false },
  "privacy":  { type: Array,   field: "privacy" },
  "photos":   { type: Object, items: {
    160: {type: String, field: "photo_160"},
    320: {type: String, field: "photo_320"} },
  },
  "updatedAt": { type: Date, field: "updated_time" }
};

class VKVideoalbum extends VKObject {
  constructor(obj) {
    super(obj, VKVideoalbumSchema);
  }
}

module.exports = VKVideoalbum;
