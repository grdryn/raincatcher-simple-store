'use strict';

var _ = require('lodash');
var q = require('q');
var shortid = require('shortid');

var ArrayStore = function(datasetId, data) {
  this.data = data;
  this.topic = {};
  this.subscription = {};
  this.datasetId = datasetId;
};

ArrayStore.prototype.create = function(object) {
  var self = this;
  var deferred = q.defer();
  setTimeout(function() {
    object.id = shortid.generate();
    self.data.push(object);
    console.log('Created object:', object);
    deferred.resolve(object);
  }, 0);
  return deferred.promise;
};

ArrayStore.prototype.read = function(id) {
  var self = this;
  var deferred = q.defer();
  setTimeout(function() {
    var object = _.find(self.data, function(_object) {
      return String(_object.id) === String(id);
    });
    deferred.resolve(object);
  }, 0);
  return deferred.promise;
};

ArrayStore.prototype.update = function(object) {
  var self = this;
  var deferred = q.defer();
  setTimeout(function() {
    var index = _.findIndex(self.data, function(_object) {
      return String(_object.id) === String(object.id);
    });
    self.data[index] = object;
    console.log('Saved object:', object);
    deferred.resolve(object);
  }, 0);
  return deferred.promise;
};

ArrayStore.prototype.delete = function(object) {
  var self = this;
  var deferred = q.defer();
  var id = object instanceof Object ? object.id : object;
  setTimeout(function() {
    var removals = _.remove(self.data, function(_object) {
      return String(_object.id) === String(id);
    });
    var removed = removals.length ? removals[0] : null;
    deferred.resolve(removed);
  }, 0);
  return deferred.promise;
};

ArrayStore.prototype.list = function(filter) {
  var self = this;
  var deferred = q.defer();
  setTimeout(function() {
    var filterResults;
    if (filter) {
      filterResults = self.data.filter(function(object) {
        return String(object[filter.key]) === String(filter.value);
      });
    } else {
      filterResults = self.data;
    }
    deferred.resolve(filterResults);
  }, 0);
  return deferred.promise;
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
