const DbStore = require('./fh-db-store');
// fh.db only accepts a URI with user,pw and database config
process.env.FH_MONGODB_CONN_URL = process.env.FH_MONGODB_CONN_URL ||
  'mongodb://user:pw@localhost/raincatcher';

// run a pre-test to see if we have mongodb connectivity
before(function() {
  var testStore = new DbStore('test');
  return testStore.list().catch(function(e) {
    console.error('unable to connect to mongodb, check lib/fh-db-store-spec.js');
    throw e;
  });
});

require('../test/store')(DbStore, 'DbStore');
