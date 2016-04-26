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

				if(typeof(req.user) == "undefined") {

					var successLoadUser = function() {
						req.user = req.newsCollection.user();
						retrievePicturesCollection();
					};

					req.newsCollection.user().loadAssociations(successLoadUser, fail);
				} else {
					retrievePicturesCollection();
				}
			};

			NewsCollection.findOneByHashid(id, success, fail);
		});

		// Define '/' route.
		this.router.get('/', CMSAuth.can('manage user information'), function(req, res) {
			if(typeof(req.user) != "undefined") {
				self.listAllNewsCollectionsOfUser(req, res);
			} else {
				res.status(500).send({ 'error': 'Unauthorized.' });
			}
		});
		this.router.post('/', CMSAuth.can('manage user information'), function(req, res) {
			if(typeof(req.user) != "undefined") {
				self.newNewsCollection(req, res);
			} else {
				res.status(500).send({ 'error': 'Unauthorized.' });
			}
		});

		// Define '/:newscollection_id' route.
		this.router.get('/:newscollection_id', CMSAuth.can('manage user news collections'), function(req, res) { self.showNewsCollection(req, res); });
		this.router.put('/:newscollection_id', CMSAuth.can('manage user news collections'), function(req, res) { self.updateNewsCollection(req, res); });
		this.router.delete('/:newscollection_id', CMSAuth.can('manage user news collections'), function(req, res) { self.deleteNewsCollection(req, res); });

		// Define '/:newscollection_id/news' route.
		this.router.use('/:newscollection_id/news', (new NewsRouter()).getRouter());
	}

	/**
	 * List list all news collections of user in req.
	 *
	 * @method listAllNewsCollectionsOfUser
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	listAllNewsCollectionsOfUser(req : any, res : any) {
		var fail = function(error) {
			res.status(500).send({ 'error': error });
		};

		var success = function() {

			var newsCollections_JSON = req.user.toJSONObject(true)["newsCollections"];

			res.json(newsCollections_JSON);

		};

		req.user.loadNewsCollections(success, fail);
	}

	/**
	 * Add a new News Collection to User.
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

				var successUserLink = function() {

					var successCreatePictureCollection = function(pictureCollection : ImagesCollection) {
						res.json(newCollection.toJSONObject());
					};

					ImagesCollectionsRouter.newImagesCollectionObject(req, hashid, newCollection.name() + " (News Pictures)", "", successCreatePictureCollection, fail);
				};

				req.user.addNewsCollection(newCollection, successUserLink, fail);
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
}