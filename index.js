var _ = require('lodash');
module.exports = function selectStore(config) {
  config = _.defaults(config, {
    persistent: process.env.WFM_USE_MEMORY_STORE !== "true"
  });
  if (config.persistent) {
    console.log('Using $fh.db Store');
    return require('./lib/fh-db-store');
  } else {
    console.log('Using In-memory Store');
    return require('./lib/array-store');
  }
};
