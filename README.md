# FeedHenry RainCatcher Simple Store

A CRUDL storage engine that supports both in-memory and $fh.db backends.

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
The `$fh.db` backend utilizes the storage engine provided by the FeedHenry Cloud API, wrapped by the Simple Store API .

You have the option to utilize an in-memory version of the store by setting the `WFM_USE_MEMORY_STORE` variable to `true`, this store is intended for quick tests and will lose its contents on application restart.

The general configuration is done via the same environment variables that `$fh.db` regularly uses.

During execution, you can detect if the storage engine being used utilizes a persistent backend via the `{store}.isPersistent` property.

The documentation for `$fh.db` is available [here](https://access.redhat.com/documentation/en/red-hat-mobile-application-platform-hosted/3/paged/cloud-api/chapter-2-fhdb).