if (process.env.WFM_USE_MEMORY_STORE) {
  module.exports = require('./lib/array-store');
} else {
  module.exports = require('./lib/fh-db-store');
}