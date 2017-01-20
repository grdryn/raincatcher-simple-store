var _ = require('lodash');
module.exports = function selectStore(config) {
  config = _.defaults(config, {
    persistent: true
  });
  if (config.persistent) {
    console.log('Using $fh.db Store');
    return require('./lib/fh-db-store');
  } else {
    console.log('Using In-memory Store');
    return require('./lib/array-store');
  }
};
