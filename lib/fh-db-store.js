var Promise = require('bluebird');
var db = Promise.promisify(require('fh-mbaas-api').db);
'use strict';

function Store(datasetId, data) {
  this.datasetId = datasetId;
  return db({
    act: 'create',
    type: datasetId,
    fields: data
  });
}

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
  });
};

Store.prototype.list = function(filter) {
  var opts = {
    act: 'read',
    type: this.datasetId
  };
  if (filter) {
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