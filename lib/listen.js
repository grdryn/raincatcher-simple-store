const Topics = require('fh-wfm-mediator/lib/topics');
const _ = require('lodash');
module.exports = function decorate(Class) {
  Class.prototype.listen = function(topicPrefix, mediator) {
    var self = this;
    this.topics = new Topics(mediator);
    this.mediator = mediator;
    this.topics
      .prefix('wfm' + topicPrefix)
      .entity(this.datasetId)
      .on('create', function(object) {
        // needs a custom function because the created id is different
        // than the one in the request() topic
        var uid = object.id;
        self.create(object).then(function(object) {
          self.mediator.publish([self.topics.getTopic('create', 'done'), uid].join(':'), object);
        });
      })
      .on('read', this.read.bind(this))
      .on('update', this.update.bind(this))
      .on('delete', this.delete.bind(this))
      .on('list', this.list.bind(this))
      .on('deleteAll', this.deleteAll.bind(this))
      .on('reset', function() {
        // mediator.request spreads the arguments
        // last argument is the mediator channel itself
        var data = _.toArray(arguments);
        data.pop();
        return self.deleteAll().then(function() {
          return self.init(data);
        });
      });
  };

  Class.prototype.unsubscribe = function() {
    this.topics.unsubscribeAll();
  };
};