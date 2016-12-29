# FeedHenry RainCatcher Simple Store

A CRUD storage engine that supports both in-memory and $fh.db backends.

# Usage

The initial config requires an entity name and the initial seed data:

```javascript
const Store = require('fh-wfm-simple-store');
const store = new Store('user');
store.init({ ... }).then(function() {
  // store is available for use
});
```

You can additionally utilize the `listen` method to have the story listen to conventially-named mediator topics.

```javascript
const store = new Store('user');
store.init({}).then(function() {
  store.listen('', mediator);
  mediator.request('wfm:user:list').then(console.log);
  // the above pattern is also available through the `topics` property:
  store.topics.request('list').then(console.log);
})
```

# DB Api
The `$fh.db` backend utilizes the storage engine provided by the FeedHenry Cloud API, wrapped by the Simple Store API and is activated when the `WFM_USE_MEMORY_STORE` enviroment variable is set to `false`. The general configuration is done via environment variables.

During execution, you can detect if the storage engine being used utilizes a persistent backend via the `{store}.isPersistent` property.

The documentation for `$fh.db` is available [here](https://access.redhat.com/documentation/en/red-hat-mobile-application-platform-hosted/3/paged/cloud-api/chapter-2-fhdb).