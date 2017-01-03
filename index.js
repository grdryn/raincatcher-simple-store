if (process.env.WFM_USE_MEMORY_STORE) {
  console.log('Using In-memory Store');
  module.exports = require('./lib/array-store');
} else {
  console.log('Using In-memory Store');
  module.exports = require('./lib/fh-db-store');
}