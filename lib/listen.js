module.exports = function decorate(Class) {
  Class.prototype.listen = function(topicPrefix, mediator) {
    var self = this;
    self.mediator = mediator;

    self.topic.create = "wfm:" + topicPrefix + self.datasetId + ':create';
    console.log('Subscribing to mediator topic:', self.topic.create);
    self.subscription.create = mediator.subscribe(self.topic.create, function(object) {
      var uid = object.id;
      self.create(object).then(function(object) {
        mediator.publish('done:' + self.topic.create + ':' + uid, object);
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

  Class.prototype.unsubscribe = function() {
    this.mediator.remove(this.topic.list, this.subscription.list.id);
    this.mediator.remove(this.topic.load, this.subscription.load.id);
    this.mediator.remove(this.topic.save, this.subscription.save.id);
    this.mediator.remove(this.topic.create, this.subscription.create.id);
    this.mediator.remove(this.topic.delete, this.subscription.delete.id);
  };
};