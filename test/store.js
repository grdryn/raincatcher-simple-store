/**
 * Test suite for stores, meant to be required from a store-specific *-spec.js file
 */
const fixtures = require('./fixtures');
const assert = require('assert');
const daisyId = 'rJeXyfdrH';
const newItem = {
  "username" : "jdoe",
  "name" : "John Doe",
  "position" : "Truck Inspector",
  "phone" : "(265) 754 8176",
  "email" : "jdoe@wfm.com",
  "avatar" : "https://s3.amazonaws.com/uifaces/faces/twitter/madysondesigns/128.jpg",
  "password" : "Password1"
};

module.exports = function(Store, describeDescription) {
  describe(describeDescription, function() {
    beforeEach(function() {
      this.store = new Store('user');
      return this.store.init(fixtures);
    });

    describe('#list', function() {
      it('should return all items', function() {
        return this.store.list().then(function(res) {
          assert.equal(res.length, fixtures.length);
        });
      });
    });

    describe('#read', function() {
      it('should find an item by id', function() {
        return this.store.read(daisyId).then(function(daisy) {
          assert(daisy.username === 'daisy');
        });
      });
      it('should resolve with nothing when not found', function() {
        return this.store.read('invalid_id').then(function(user) {
          assert(!user);
        });
      });
    });

    describe('#create', function() {
      it('should add a new item', function() {
        var oldCount;
        var store = this.store;
        return store.list().then(function(orig) {
          oldCount = orig.length;
          return store.create(newItem);
        }).then(function() {
          return store.list();
        }).then(function(newList) {
          assert.equal(newList.length, oldCount + 1,
            'total count should have increased by 1');
        });
      });
      it('should generate an id', function() {
        return this.store.create(newItem).then(function(user) {
          assert(user.id);
        });
      });
    });

    describe('#update', function() {
      it('should update fields', function() {
        return this.store.update({id: daisyId, position: 'test'}).then(function(newDaisy) {
          assert.equal(newDaisy.username, 'daisy');
          assert.equal(newDaisy.position, 'test');
        });
      });
      it('should error when not found', function() {
        return this.store.update({id: 'invalid_id', position:'test'}).then(function(user) {
          assert(!user);
        }).catch(function(err) {
          assert(err);
        });
      });
    });

    describe('#delete', function() {
      it('should remove a item', function() {
        return this.store.delete(daisyId).then(function(user) {
          assert.equal(user.username, 'daisy');
        });
      });
      it('should return null when item not found', function() {
        return this.store.delete('invalid_id').then(function(user) {
          assert.equal(user, null);
        });
      });
    });

    afterEach(function() {
      return this.store.deleteAll();
    });
  });
};