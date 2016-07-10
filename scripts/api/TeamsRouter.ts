/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/RouterItf.ts" />
/// <reference path="../auth/CMSAuth.ts" />

/// <reference path="../model/Team.ts" />

/// <reference path="./ImagesCollectionsRouter.ts" />
/// <reference path="./VideosCollectionsRouter.ts" />
/// <reference path="./NewsCollectionsRouter.ts" />

declare var require : any;

var fs : any = require("fs");
var mkdirp : any = require('mkdirp');
var rmdir : any = require('rmdir');

var uuid : any = require('node-uuid');

/**
 * TeamsRouter class.
 *
 * @class TeamsRouter
 * @extends RouterItf
 */
class TeamsRouter extends RouterItf {

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
		this.router.get('/', CMSAuth.can('perform admin action'), function(req, res) { self.listAllTeams(req, res); });
		this.router.post('/', CMSAuth.can('perform admin action'), function(req, res) { self.newTeam(req, res); });

		// Define '/:team_id' route.
		this.router.get('/:team_id', CMSAuth.can('manage team information'), function(req, res) { self.showTeam(req, res); });
		this.router.put('/:team_id', CMSAuth.can('manage team information'), function(req, res) { self.updateTeam(req, res); });
		this.router.delete('/:team_id', CMSAuth.can('perform admin action'), function(req, res) { self.deleteTeam(req, res); });

		// Define '/:team_id/images_collections' route.
		this.router.use('/:team_id/images_collections', (new ImagesCollectionsRouter()).getRouter());

		// Define '/:team_id/news_collections' route.
		this.router.use('/:team_id/news_collections', (new NewsCollectionsRouter()).getRouter());

		// Define '/:team_id/videos_collections' route.
		this.router.use('/:team_id/videos_collections', (new VideosCollectionsRouter()).getRouter());
	}

	/**
	 * List all teams.
	 *
	 * @method listAllTeams
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	listAllTeams(req : any, res : any) {
		var success = function(teams) {
			var teamsJSON = [];

			teams.forEach(function (team : Team) {
				teamsJSON.push(team.toJSONObject());
			});

			res.json(teamsJSON);
		};

		var fail = function(error) {
			res.status(500).send({ 'error': error });
		};

		Team.all(success, fail);
	}

	/**
	 * Add a new Team.
	 *
	 * @method newTeam
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	newTeam(req : any, res : any) {
		if(typeof(req.body.name) == "undefined" || req.body.name == "") {
			res.status(500).send({ 'error': 'Missing some information to create new Team.' });
		} else {
			var hashid = uuid.v1();
			var newTeam = new Team(hashid, req.body.name);

			var success = function(team) {
				fs.stat(CMSConfig.getUploadDir() + "teams/" + hashid + "/", function(err, stats) {
					if(err || !stats.isDirectory()) {
						mkdirp(CMSConfig.getUploadDir() + "teams/" + hashid + "/", function(err2) {
							if(err2) {
								res.status(500).send({ 'error': JSON.stringify(err2) });
							} else {
								res.json(team.toJSONObject(true));
							}
						});
					} else {
						res.json(team.toJSONObject(true));
					}
				});
			};

			var fail = function(error) {
				res.status(500).send({ 'error': error });
			};

			newTeam.create(success, fail);
		}
	}

	/**
	 * Show Team info.
	 *
	 * @method showTeam
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	showTeam(req : any, res : any) {
		res.json(req.team.toJSONObject());
	}

	/**
	 * Update Team info (but not Admin Status).
	 *
	 * @method updateTeam
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	updateTeam(req : any, res : any) {
		if( typeof(req.body.name) == "undefined") {
			res.status(500).send({ 'error': 'Missing some information to update Team.' });
		} else {

			if(typeof(req.body.name) != "undefined" && req.body.name != "") {
				req.team.setName(req.body.name);
			}

			var success = function(team) {
				res.json(team.toJSONObject());
			};

			var fail = function(error) {
				res.status(500).send({ 'error': error });
			};

			req.team.update(success, fail);
		}
	}

	/**
	 * Delete Team.
	 *
	 * @method deleteTeam
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	deleteTeam(req : any, res : any) {
		var originTeamFolder = CMSConfig.getUploadDir() + "teams/" + req.team.hashid();
		var tmpTeamFolder = CMSConfig.getUploadDir() + "deletetmp/teams/" + req.team.hashid();

		fs.rename(originTeamFolder, tmpTeamFolder, function(err) {
			if(err) {
				res.status(500).send({ 'error': "Error during deleting Team." });
			} else {
				var success = function(deleteTeamId) {
					rmdir(tmpTeamFolder, function ( err, dirs, files ){
						res.json(deleteTeamId);
					});
				};

				var fail = function(error) {
					fs.rename(tmpTeamFolder, originTeamFolder , function(err) {
						res.status(500).send({ 'error': error });
					});
				};

				req.team.delete(success, fail);
			}
		});
	}
}