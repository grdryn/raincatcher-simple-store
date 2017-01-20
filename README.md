# FeedHenry RainCatcher Simple Store

A CRUDL storage engine that supports both in-memory and $fh.db backends.

# Usage

The initial config requires an entity name and the initial seed data:

```javascript
const Store = require('fh-wfm-simple-store')({persistent: true});
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

# Peristent Storage using the `$fh.db` API
The persistent storage functionality is provided by the [`$fh.db` Cloud API](https://access.redhat.com/documentation/en/red-hat-mobile-application-platform-hosted/3/paged/cloud-api/chapter-2-fhdb). This API is provided by the RHMAP Platform to Cloud Applications.

You have the option to utilize an in-memory version of the store by passing a configuration of `{persistent: false}` when requiring this module, this store is intended for quick tests and will lose its contents on application restart.

The general configuration is done via the same environment variables that `$fh.db` regularly uses (see documentation link above).

During execution, you can detect if the storage engine being used utilizes a persistent backend via the `{store}.isPersistent` property.