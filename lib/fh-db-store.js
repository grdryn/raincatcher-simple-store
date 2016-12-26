const Promise = require('bluebird');
const _ = require('lodash');
const db = Promise.promisify(require('fh-mbaas-api').db);
'use strict';

function Store(datasetId) {
  this.topic = {};
  this.subscription = {};
  this.datasetId = datasetId;
}

Store.prototype.init = function(data) {
  return db({
    act: 'create',
    type: this.datasetId,
    fields: data
  });
};

Store.prototype.isPersistent = true;

Store.prototype.create = function(object) {
  return db({
    act: 'create',
    type: this.datasetId,
    fields: object
  });
};

Store.prototype.read = function(id) {
  return db({
    act: 'read',
    type: this.datasetId,
    guid: id
  });
};

Store.prototype.update = function(object) {
  return db({
    act: 'update',
    type: this.datasetId,
    guid: object.id,
    fields: object
  });
};

Store.prototype.delete = function(object) {
  var id = object instanceof Object ? object.id : object;
  return db({
    act: 'delete',
    type: this.datasetId,
    guid: id
  }).then(function(res) {
    if (_.isEmpty(res)) {
      // not found
      return null;
    }
  });
};

Store.prototype.list = function(filter) {
  var opts = {
    act: 'read',
    type: this.datasetId
  };
  if (filter && filter.key && filter.value) {
    opts.eq = {};
    opts.eq[String(filter.key)] = String(filter.value);
  }
  return db(opts);
};

Store.prototype.deleteAll = function() {
  return db({
    act: 'deleteall',
    type: this.datasetId
  });
};

module.exports = Store;