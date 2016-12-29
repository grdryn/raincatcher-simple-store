const Topics = require('fh-wfm-mediator/lib/topics');
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
      .on('list', this.list.bind(this));
  };

  Class.prototype.unsubscribe = function() {
    this.topics.unsubscribeAll();
  };
};