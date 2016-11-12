"use strict";

const VKObject = require("./VKObject");

const VKVideoSchema = {
  "id":             {type: Number, field: "id", unique: true, key: true},
  "ownerId":        {type: Number, field: "owner_id", default: 0},
  "title":          {type: String, field: "title"},
  "description":    {type: String, field: "description"},
  "duration":       {type: Number, field: "duration", default: 0},
  "views":          {type: Number, field: "views"},
  "comments":       {type: Number, field: "comments"},
  "privacy":        {type: Array,  field: "privacy"},
  "playerUrl":      {type: String, field: "player"},
  "accessKey":      {type: String, field: "access_key"},
  "photos":         {
    type: Object, items: {
      130: {type: String, field: "photo_130"},
      320: {type: String, field: "photo_320"},
      640: {type: String, field: "photo_640"},
      800: {type: String, field: "photo_800"}
    },
  },
  "files":          {type: Array, field: "files"},
  "createdAt":      {type: Date,    field: "date"},
  "addedAt":        {type: Date,    field: "adding_date"},
  "isProcessing":   {type: Boolean, field: "processing", default: false},
  "isBroadcasting": {type: Boolean, field: "live", default: false},
};

class VKVideo extends VKObject {
  constructor(obj) {
    super(obj, VKVideoSchema);
  }
}

module.exports = VKVideo;
