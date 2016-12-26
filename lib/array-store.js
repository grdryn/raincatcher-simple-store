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
  this.data = data;
  return Promise.resolve(data);
};

ArrayStore.prototype.isPersistent = false;

ArrayStore.prototype.create = function(object) {
  object.id = shortid.generate();
  this.data.push(object);
  return Promise.resolve(object);
};

ArrayStore.prototype.read = function(id) {
  var object = _.find(this.data, function(_object) {
    return String(_object.id) === String(id);
  });
  return Promise.resolve(object);
};

ArrayStore.prototype.update = function(object) {
  var index = _.findIndex(this.data, function(_object) {
    return String(_object.id) === String(object.id);
  });
  if (!index) {
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
  return Promise.resolve(filterResults);
};

ArrayStore.prototype.deleteAll = function() {
  this.data = [];
  return Promise.resolve(true);
};


ArrayStore.prototype.listen = function(topicPrefix, mediator) {
  var self = this;
  self.mediator = mediator;

  self.topic.create = "wfm:" + topicPrefix + self.datasetId + ':create';
  console.log('Subscribing to mediator topic:', self.topic.create);
  self.subscription.create = mediator.subscribe(self.topic.create, function(object, ts) {
    self.create(object, ts).then(function(object) {
      mediator.publish('done:' + self.topic.create + ':' + ts, object);
    });
  });

  self.topic.load = "wfm:" + topicPrefix + self.datasetId + ':read';
  console.log('Subscribing to mediator topic:', self.topic.load);
  self.subscription.load = mediator.subscribe(self.topic.load, function(id) {
    self.read(id).then(function(object) {
      mediator.publish('done:' + self.topic.load + ':' + id, object);
    });
  });

  self.topic.save = "wfm:" + topicPrefix + self.datasetId + ':update';
  console.log('Subscribing to mediator topic:', self.topic.save);
  self.subscription.save = mediator.subscribe(self.topic.save, function(object) {
    self.update(object).then(function(object) {
      mediator.publish('done:' + self.topic.save + ':' + object.id, object);
    });
  });

  self.topic.delete = "wfm:" + topicPrefix + self.datasetId + ':delete';
  console.log('Subscribing to mediator topic:', self.topic.delete);
  self.subscription.delete = mediator.subscribe(self.topic.delete, function(object) {
    self.delete(object).then(function(object) {
      mediator.publish('done:' + self.topic.delete + ':' + object.id, object);
    });
  });

  self.topic.list = "wfm:" + topicPrefix + self.datasetId + ':list';
  console.log('Subscribing to mediator topic:', self.topic.list);
  self.subscription.list = mediator.subscribe(self.topic.list, function(queryParams) {
    var filter = queryParams && queryParams.filter || {};
    self.list(filter).then(function(list) {
      mediator.publish('done:' + self.topic.list, list);
    });
  });
};

ArrayStore.prototype.unsubscribe = function() {
  this.mediator.remove(this.topic.list, this.subscription.list.id);
  this.mediator.remove(this.topic.load, this.subscription.load.id);
  this.mediator.remove(this.topic.save, this.subscription.save.id);
  this.mediator.remove(this.topic.create, this.subscription.create.id);
  this.mediator.remove(this.topic.delete, this.subscription.delete.id);
};

module.exports = ArrayStore;
