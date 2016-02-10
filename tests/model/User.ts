/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../BaseTest.ts" />

/// <reference path="../../scripts/model/User.ts" />
/// <reference path="../../scripts/exceptions/ModelException.ts" />

describe('User', function() {
	describe('#constructor(hashid, username, email, authkey , isAdmin)', function() {
		it('should store the given hashid', function() {
			var hashid = uuid.v1();
			var user = new User(hashid);

			assert.equal(user.hashid(), hashid, "The hashid is not correctly stored.");
		});

		it('should store the given username', function() {
			var hashid = uuid.v1();
			var username = "usernameTest";
			var user = new User(hashid, username);

			assert.equal(user.username(), username, "The username is not correctly stored.");
		});

		it('should store the given email', function() {
			var hashid = uuid.v1();
			var username = "usernameTest";
			var email = uuid.v1() + "@pulsetotem.fr";
			var user = new User(hashid, username, email);

			assert.equal(user.email(), email, "The email is not correctly stored.");
		});

		it('should store the given authkey', function() {
			var hashid = uuid.v1();
			var username = "usernameTest";
			var email = uuid.v1() + "@pulsetotem.fr";
			var authkey = "authkey!!!";
			var user = new User(hashid, username, email, authkey);

			assert.equal(user.authKey(), authkey, "The authkey is not correctly stored.");
		});

		it('should store the given adminStatus', function() {
			var hashid = uuid.v1();
			var username = "usernameTest";
			var email = uuid.v1() + "@pulsetotem.fr";
			var authkey = "authkey!!!";
			var user = new User(hashid, username, email, authkey, false);
			var adminUser = new User(hashid, username, email, authkey, true);

			assert.equal(user.isAdmin(), false, "The isAdmin is not correctly stored.");
			assert.equal(adminUser.isAdmin(), true, "The isAdmin is not correctly stored.");
		});
	});

	describe('#create(successCallback, failCallback)', function() {
		it('should fail if the object already has an id', function(done) {
			var user = new User("", "", "", "", false, 42);

			var success = function() {
				done(new Error("Test failed."));
			};

			var fail = function(err) {
				assert.throws(function() {
						if(err) {
							throw err;
						}
					},
					ModelException, "The ModelException has not been thrown.");
				done();
			};

			user.create(success, fail);

		});

		it('should use Sequelize to create the object and store the id', function(done) {

			var userModel = db["Users"];
			var spyCreate = sinon.spy(userModel, "create");

			var hashid = uuid.v1();
			var username = "usernameTest";
			var email = uuid.v1() + "@pulsetotem.fr";
			var authkey = uuid.v1();
			var user = new User(hashid, username, email, authkey);

			var userJSON = {
				"hashid" : hashid,
				"username": username,
				"email": email,
				"authkey": authkey,
				"isAdmin": false
			};

			var success = function() {

				assert.notEqual(user.getId(), null, "User Id is null.");
				assert(spyCreate.calledOnce, "Sequelize create method is not called or more than once.");
				assert(spyCreate.calledWith(userJSON), "Sequelize create method is not called with right params.");

				done();
			};

			var fail = function(err) {
				done(err);
			};

			user.create(success, fail);
		});
	});

	describe('#read(id, successCallback, failCallback)', function() {
		it('should use Sequelize to read the object and return it', function(done) {

			var userModel = db["Users"];
			var spyFindById = sinon.spy(userModel, "findById");

			var hashid = uuid.v1();
			var username = "usernameTest";
			var email = uuid.v1() + "@pulsetotem.fr";
			var authkey = uuid.v1();
			var user = new User(hashid, username, email, authkey);

			var fail = function(err) {
				done(err);
			};

			var success = function() {

				var successRead = function(readObject) {
					assert.equal(readObject.getId(), user.getId(), "Read Object is not the right one.");
					assert(spyFindById.calledOnce, "Sequelize read method is not called or more than once.");
					assert(spyFindById.calledWith(user.getId()), "Sequelize read method is not called with right params.");

					done();
				};

				User.read(user.getId(), successRead, fail);
			};

			user.create(success, fail);
		});
	});
});