/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/RouterItf.ts" />
/// <reference path="../auth/CMSAuth.ts" />

/// <reference path="../model/NewsCollection.ts" />

/// <reference path="./NewsRouter.ts" />
/// <reference path="./ImagesCollectionsRouter.ts" />

declare var require : any;

var fs : any = require("fs");
var mkdirp : any = require('mkdirp');
var rmdir : any = require('rmdir');

var uuid : any = require('node-uuid');

/**
 * NewsCollectionsRouter class.
 *
 * @class NewsCollectionsRouter
 * @extends RouterItf
 */
class NewsCollectionsRouter extends RouterItf {

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
		this.router.param("newscollection_id", function (req, res, next, id) {
			var fail = function(error) {
				next(error);
			};

			var success = function(newsCollection) {
				req.newsCollection = newsCollection;

				var successPicturesCollection = function(picturesCollection) {
					req.newsPicturesCollection = picturesCollection;
					next();
				};

				var retrievePicturesCollection = function() {
					ImagesCollection.findOneByHashid(id, successPicturesCollection, fail);
				};

				if(typeof(req.team) == "undefined") {

					var successLoadTeam = function() {
						req.team = req.newsCollection.team();
						retrievePicturesCollection();
					};

					req.newsCollection.team().loadAssociations(successLoadTeam, fail);
				} else {
					retrievePicturesCollection();
				}
			};

			NewsCollection.findOneByHashid(id, success, fail);
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
		this.router.get('/', CMSAuth.can('manage team information'), function(req, res) {
			if(typeof(req.team) != "undefined") {
				self.listAllNewsCollectionsOfTeam(req, res);
			} else {
				res.status(500).send({ 'error': 'Unauthorized.' });
			}
		});
		this.router.post('/', CMSAuth.can('manage team information'), function(req, res) {
			if(typeof(req.team) != "undefined") {
				self.newNewsCollection(req, res);
			} else {
				res.status(500).send({ 'error': 'Unauthorized.' });
			}
		});

		// Define '/:newscollection_id' route.
		this.router.get('/:newscollection_id', CMSAuth.can('manage team news collections'), function(req, res) { self.showNewsCollection(req, res); });
		this.router.put('/:newscollection_id', CMSAuth.can('manage team news collections'), function(req, res) { self.updateNewsCollection(req, res); });
		this.router.delete('/:newscollection_id', CMSAuth.can('manage team news collections'), function(req, res) { self.deleteNewsCollection(req, res); });

		// Define '/:newscollection_id/news' route.
		this.router.use('/:newscollection_id/news', (new NewsRouter()).getRouter());

		// Define '/:newscollection_id/teams' route.
		this.router.post('/:newscollection_id/teams/:team_id', function(req, res) { self.moveCollectionToTeam(req, res); });
	}

	/**
	 * List list all news collections of team in req.
	 *
	 * @method listAllNewsCollectionsOfTeam
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	listAllNewsCollectionsOfTeam(req : any, res : any) {
		var fail = function(error) {
			res.status(500).send({ 'error': error });
		};

		var success = function() {

			var newsCollections_JSON = req.team.toJSONObject(true)["newsCollections"];

			res.json(newsCollections_JSON);

		};

		req.team.loadNewsCollections(success, fail);
	}

	/**
	 * Add a new News Collection to Team.
	 *
	 * @method newNewsCollection
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	newNewsCollection(req : any, res : any) {
		if(typeof(req.body.name) == "undefined" || req.body.name == "" || typeof(req.body.description) == "undefined") {
			res.status(500).send({ 'error': 'Missing some information to create new News Collection.' });
		} else {
			var hashid = uuid.v1();

			var newNewsCollection = new NewsCollection(hashid, req.body.name, req.body.description);

			var fail = function(error) {
				res.status(500).send({ 'error': error });
			};

			var success = function(newCollection : NewsCollection) {

				var successTeamLink = function() {

					var successCreatePictureCollection = function(pictureCollection : ImagesCollection) {
						res.json(newCollection.toJSONObject());
					};

					ImagesCollectionsRouter.newImagesCollectionObject(req, hashid, newCollection.name() + " (News Pictures)", "", true, successCreatePictureCollection, fail);
				};

				req.team.addNewsCollection(newCollection, successTeamLink, fail);
			};

			newNewsCollection.create(success, fail);
		}
	}

	/**
	 * Show NewsCollection info.
	 *
	 * @method showNewsCollection
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	showNewsCollection(req : any, res : any) {
		res.json(req.newsCollection.toJSONObject());
	}

	/**
	 * Update  NewsCollection info.
	 *
	 * @method updateNewsCollection
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	updateNewsCollection(req : any, res : any) {
		if( typeof(req.body.name) == "undefined" && typeof(req.body.description) == "undefined") {
			res.status(500).send({ 'error': 'Missing some information to update NewsCollection.' });
		} else {

			if(typeof(req.body.name) != "undefined" && req.body.name != "") {
				req.newsCollection.setName(req.body.name);
				req.newsPicturesCollection.setName(req.body.name + " (News Pictures)");
			}

			if(typeof(req.body.description) != "undefined") {
				req.newsCollection.setDescription(req.body.description);
			}

			var fail = function(error) {
				res.status(500).send({ 'error': error });
			};

			var success = function(newsCollection) {
				var successPicturesUpdate = function() {
					//Success even if Pictures collection update failed.
					res.json(newsCollection.toJSONObject());
				};
				req.newsPicturesCollection.update(successPicturesUpdate, successPicturesUpdate);
			};

			req.newsCollection.update(success, fail);
		}
	}

	/**
	 * Delete NewsCollection.
	 *
	 * @method deleteNewsCollection
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	deleteNewsCollection(req : any, res : any) {
		var fail = function(error) {
			res.status(500).send({ 'error': error });
		};

		var success = function(deleteNewsCollectionId) {
			var imgCollRouter : ImagesCollectionsRouter = new ImagesCollectionsRouter();
			req.imagesCollection = req.newsPicturesCollection;
			imgCollRouter.deleteImagesCollection(req, res, function() {
				res.json(deleteNewsCollectionId);
			}, fail);
		};

		req.newsCollection.delete(success, fail);
	}

	/**
	 * Move collection to Team
	 *
	 * @method moveCollectionToTeam
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	moveCollectionToTeam(req : any, res : any) {
		var fail = function(errString) {
			res.status(500).send({ 'error': errString });
		};

		var success = function() {
			res.json(req.newsCollection.toJSONObject());
		};

		var successRemove = function() {
			req.team.addNewsCollection(req.newsCollection, success, fail);
		};

		req.user.removeNewsCollection(req.newsCollection, successRemove, fail);
	}
}