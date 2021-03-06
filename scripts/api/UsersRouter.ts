/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/RouterItf.ts" />
/// <reference path="../auth/CMSAuth.ts" />

/// <reference path="../model/User.ts" />

/// <reference path="./ImagesCollectionsRouter.ts" />
/// <reference path="./VideosCollectionsRouter.ts" />
/// <reference path="./NewsCollectionsRouter.ts" />

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

			User.findOneByHashid(id, success, fail);
		});

		this.router.param("team_id", function (req, res, next, id) {
			var success = function(team) {
				req.team = team;
				next();
			};

			var fail = function(error) {
				next(error);
			};

			Team.findOneByHashid(id, success, fail);
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

		// Define '/:user_id/news_collections' route.
		this.router.use('/:user_id/news_collections', (new NewsCollectionsRouter()).getRouter());

		// Define '/:user_id/videos_collections' route.
		this.router.use('/:user_id/videos_collections', (new VideosCollectionsRouter()).getRouter());

		// Define '/:user_id/teams/[:team_id]' routes.
		this.router.get('/:user_id/teams', CMSAuth.can('manage user information'), function(req, res) { self.listTeams(req, res); });
		this.router.put('/:user_id/teams/:team_id', CMSAuth.can('manage user information'), function(req, res) { self.addTeam(req, res); });
		this.router.delete('/:user_id/teams/:team_id', CMSAuth.can('manage user information'), function(req, res) { self.removeTeam(req, res); });
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
			res.status(500).send({ 'error': error });
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
								res.json(user.toJSONObject(true));
							}
						});
					} else {
						res.json(user.toJSONObject(true));
					}
				});
			};

			var fail = function(error) {
				res.status(500).send({ 'error': error });
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
				res.status(500).send({ 'error': error });
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
				res.status(500).send({ 'error': error });
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
						res.status(500).send({ 'error': error });
					});
				};

				req.user.delete(success, fail);
			}
		});
	}

	/**
	 * List all user's teams.
	 *
	 * @method listTeams
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	listTeams(req : any, res : any) {
		var fail = function(error) {
			res.status(500).send({ 'error': error });
		};

		var success = function() {
			var teamsJSON = [];

			req.user.teams().forEach(function (team:Team) {
				teamsJSON.push(team.toJSONObject());
			});

			res.json(teamsJSON);
		};

		req.user.loadTeams(success, fail);
	}

	/**
	 * Add a new Team to the User.
	 *
	 * @method addTeam
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	addTeam(req : any, res : any) {

		var fail = function(error) {
			res.status(500).send({ 'error': error });
		};

		var success = function() {
			res.json(req.user.toJSONObject(true));
		};

		var afterRemove = function() {
			req.user.addTeam(req.team, success, fail);
		};

		var successLoad = function() {
			req.user.removeTeam(req.team, afterRemove, afterRemove);
		};

		req.user.loadTeams(successLoad, fail);
	}

	/**
	 * Remove a Team from the User.
	 *
	 * @method removeTeam
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	removeTeam(req : any, res : any) {
		var fail = function(error) {
			res.status(500).send({ 'error': error });
		};

		var success = function() {
			res.json(req.user.toJSONObject(true));
		};

		var successLoad = function() {
			req.user.removeTeam(req.team, success, fail);
		};

		req.user.loadTeams(successLoad, fail);
	}
}