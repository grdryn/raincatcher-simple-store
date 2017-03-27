const Promise = require('bluebird');
const _ = require('lodash');
const shortid = require('shortid');
const db = Promise.promisify(require('fh-mbaas-api').db);
'use strict';

const extractListFields = function(res) {
  return _.map(res.list, 'fields');
};

function Store(datasetId) {
  this.datasetId = datasetId;
}

Store.prototype.init = function(data) {
  var dataset = this.datasetId;
  return db({
    act: 'create',
    type: dataset,
    fields: data
  }).then(function() {
    return db({
      act: 'index',
      type: dataset,
      index: {
        id: 'ASC'
      }
    });
  }).then(function() {
    return true;
  });
};

Store.prototype.isPersistent = true;

Store.prototype.create = function(object) {
  object = object || {};
  if (!object.id) {
    object.id = shortid.generate();
  }
  return db({
    act: 'create',
    type: this.datasetId,
    // clone since db() modifies object adding mongo's ObjectId
    fields: _.clone(object)
  }).then(_.property('fields'));
};

Store.prototype.findById = function(id) {
  // use 'list' since 'read' can only filter by guid === mongo's ObjectId
  return db({
    act: 'list',
    type: this.datasetId,
    eq: { id: id },
    limit: 1
  }).then(_.property('list')).then(_.head);
};

Store.prototype.read = function(id) {
  return this.findById(id).then(_.property('fields'));
};

Store.prototype.update = function(object) {
  var dataset = this.datasetId;
  return this.findById(object.id)
  .then(function(orig) {
    var guid = orig.guid;
    var fields = _.assign(orig.fields, object);
    return db({
      act: 'update',
      type: dataset,
      guid: guid,
      fields: fields
    });
  }).then(_.property('fields'));
};

Store.prototype.delete = function(object) {
  var id = object instanceof Object ? object.id : object;
  var dataset = this.datasetId;
  return this.findById(id)
  .then(function(orig) {
    if (!orig) {
      return null;
    }
    return db({
      act: 'delete',
      type: dataset,
      guid: orig.guid
    });
  }).then(function(res) {
    if (!res) {
      return null;
    }
    return res.fields;
  });
};

Store.prototype.list = function(filter) {
  var opts = {
    act: 'list',
    type: this.datasetId
  };
  if (filter && filter.key && filter.value) {
    opts.eq = {};
    opts.eq[String(filter.key)] = String(filter.value);
  }
  if (filter && filter.in) {
    opts.in = filter.in;
  }
  if (filter && filter.index) {
    opts.index = filter.index;
  }
  return db(opts).then(extractListFields);
};

Store.prototype.deleteAll = function() {
  return db({
    act: 'deleteall',
    type: this.datasetId
  });
};

require('./listen')(Store);

module.exports = Store;