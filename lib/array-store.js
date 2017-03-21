'use strict';

var _ = require('lodash');
var shortid = require('shortid');
var Promise = require('bluebird');

var ArrayStore = function(datasetId) {
  this.topic = {};
  this.subscription = {};
  this.datasetId = datasetId;
};

ArrayStore.prototype.init = function(data) {
  this.data = _.cloneDeep(data);
  return Promise.resolve(this.data);
};

ArrayStore.prototype.isPersistent = false;

ArrayStore.prototype.create = function(object) {
  object = object || {};
  if (!object.id) {
    object.id = shortid.generate();
  }
  this.data.push(object);
  return Promise.resolve(object);
};

ArrayStore.prototype.read = function(id) {
  var object = _.find(this.data, function(_object) {
    return String(_object.id) === String(id);
  });
  return Promise.resolve(_.clone(object));
};

ArrayStore.prototype.update = function(object) {
  var index = _.findIndex(this.data, function(_object) {
    return String(_object.id) === String(object.id);
  });
  if (index === -1) {
    return Promise.reject(new Error('object not found'));
  }
  delete object.id;
  this.data[index] = _.assign(this.data[index], object);
  return Promise.resolve(this.data[index]);
};

ArrayStore.prototype.delete = function(object) {
  var id = object instanceof Object ? object.id : object;
  var removals = _.remove(this.data, function(_object) {
    return String(_object.id) === String(id);
  });
  var removed = removals.length ? removals[0] : null;
  return Promise.resolve(removed);
};

ArrayStore.prototype.list = function(filter) {
  var filterResults;
  if (filter && filter.key && filter.value) {
    filterResults = this.data.filter(function(object) {
      return String(object[filter.key]) === String(filter.value);
    });
  } else {
    filterResults = this.data;
  }
  return Promise.resolve(_.cloneDeep(filterResults));
};

ArrayStore.prototype.deleteAll = function() {
  this.data = [];
  return Promise.resolve(true);
};

require('./listen')(ArrayStore);

module.exports = ArrayStore;
