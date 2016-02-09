/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/RouterItf.ts" />
/// <reference path="../auth/CMSAuth.ts" />

/// <reference path="../model/User.ts" />

/// <reference path="./ImagesCollectionsRouter.ts" />

declare var require : any;

var fs : any = require("fs");
var mkdirp : any = require('mkdirp');
var rmdir : any = require('rmdir');

var uuid : any = require('node-uuid');

/**
 * UsersRouter class.
 *
 * @class UsersRouter
 * @extends RouterItf
 */
class UsersRouter extends RouterItf {

	/**
	 * Constructor.
	 */
	constructor() {
		super();
	}

	/**
	 * Method called during Router creation.
	 *
	 * @method buildRouter
	 */
	buildRouter() {
		var self = this;

		// Manage params
		this.router.param("user_id", function (req, res, next, id) {
			var success = function(user) {
				req.user = user;
				next();
			};

			var fail = function(error) {
				next(error);
			};

			User.read(id, success, fail);
		});

		// Define '/' route.
		this.router.get('/', CMSAuth.can('perform admin action'), function(req, res) { self.listAllUsers(req, res); });
		this.router.post('/', CMSAuth.can('perform admin action'), function(req, res) { self.newUser(req, res); });

		// Define '/:user_id' route.
		this.router.get('/:user_id', CMSAuth.can('manage user information'), function(req, res) { self.showUser(req, res); });
		this.router.put('/:user_id', CMSAuth.can('manage user information'), function(req, res) { self.updateUser(req, res); });
		this.router.put('/:user_id/status', CMSAuth.can('perform admin action'), function(req, res) { self.updateUserAdminStatus(req, res); });
		this.router.delete('/:user_id', CMSAuth.can('perform admin action'), function(req, res) { self.deleteUser(req, res); });

		// Define '/:user_id/images_collections' route.
		this.router.use('/:user_id/images_collections', (new ImagesCollectionsRouter()).getRouter());
	}

	/**
	 * List all users.
	 *
	 * @method listAllUsers
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	listAllUsers(req : any, res : any) {
		var success = function(users) {
			var usersJSON = [];

			users.forEach(function (user : User) {
				usersJSON.push(user.toJSONObject());
			});

			res.json(usersJSON);
		};

		var fail = function(error) {
			res.status(500).send({ 'error': JSON.stringify(error) });
		};

		User.all(success, fail);
	}

	/**
	 * Add a new User.
	 *
	 * @method newUser
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	newUser(req : any, res : any) {
		if(typeof(req.body.username) == "undefined" || req.body.username == "" || typeof(req.body.email) == "undefined" || req.body.email == "") {
			res.status(500).send({ 'error': 'Missing some information to create new User.' });
		} else {
			var hashid = uuid.v1();
			var authKey = uuid.v1();
			var newUser = new User(hashid, req.body.username, req.body.email, authKey);

			if(typeof(req.body.isAdmin) != "undefined") {
				if(req.body.isAdmin == true || req.body.isAdmin == false) {
					newUser.setIsAdmin(req.body.isAdmin);
				}
			}

			var success = function(user) {
				fs.stat(CMSConfig.getUploadDir() + "users/" + hashid + "/", function(err, stats) {
					if(err || !stats.isDirectory()) {
						mkdirp(CMSConfig.getUploadDir() + "users/" + hashid + "/", function(err2) {
							if(err2) {
								res.status(500).send({ 'error': JSON.stringify(err2) });
							} else {
								res.json(user.toJSONObject());
							}
						});
					} else {
						res.json(user.toJSONObject());
					}
				});
			};

			var fail = function(error) {
				res.status(500).send({ 'error': JSON.stringify(error) });
			};

			newUser.create(success, fail);
		}
	}

	/**
	 * Show User info.
	 *
	 * @method showUser
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	showUser(req : any, res : any) {
		res.json(req.user.toJSONObject());
	}

	/**
	 * Update User info (but not Admin Status).
	 *
	 * @method updateUser
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	updateUser(req : any, res : any) {
		if( typeof(req.body.username) == "undefined" && typeof(req.body.email) == "undefined") {
			res.status(500).send({ 'error': 'Missing some information to update User.' });
		} else {

			if(typeof(req.body.username) != "undefined" && req.body.username != "") {
				req.user.setUsername(req.body.username);
			}

			if(typeof(req.body.email) != "undefined" && req.body.email != "") {
				req.user.setEmail(req.body.email);
			}

			var success = function(user) {
				res.json(user.toJSONObject());
			};

			var fail = function(error) {
				res.status(500).send({ 'error': JSON.stringify(error) });
			};

			req.user.update(success, fail);
		}
	}

	/**
	 * Update User Admin Status.
	 *
	 * @method updateUserAdminStatus
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	updateUserAdminStatus(req : any, res : any) {
		if(typeof(req.body.isAdmin) == "undefined") {
			res.status(500).send({ 'error': 'Missing some information to update User Admin Status.' });
		} else {
			if(typeof(req.body.isAdmin) != "undefined") {
				if(req.body.isAdmin == true || req.body.isAdmin == false) {
					req.user.setIsAdmin(req.body.isAdmin);
				}
			}

			var success = function(user) {
				res.json(user.toJSONObject());
			};

			var fail = function(error) {
				res.status(500).send({ 'error': JSON.stringify(error) });
			};

			req.user.update(success, fail);
		}
	}

	/**
	 * Delete User.
	 *
	 * @method deleteUser
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	deleteUser(req : any, res : any) {

		var originUserFolder = CMSConfig.getUploadDir() + "users/" + req.user.hashid();
		var tmpUserFolder = CMSConfig.getUploadDir() + "deletetmp/users/" + req.user.hashid();

		fs.rename(originUserFolder, tmpUserFolder, function(err) {
			if(err) {
				res.status(500).send({ 'error': "Error during deleting User." });
			} else {
				var success = function(deleteUserId) {
					rmdir(tmpUserFolder, function ( err, dirs, files ){
						res.json(deleteUserId);
					});
				};

				var fail = function(error) {
					fs.rename(tmpUserFolder, originUserFolder , function(err) {
						res.status(500).send({ 'error': JSON.stringify(error) });
					});
				};

				req.user.delete(success, fail);
			}
		});
	}
}