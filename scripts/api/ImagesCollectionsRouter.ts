/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/RouterItf.ts" />
/// <reference path="../auth/CMSAuth.ts" />

/// <reference path="../model/ImagesCollection.ts" />

/// <reference path="./ImagesRouter.ts" />

declare var require : any;

var fs : any = require("fs");
var mkdirp : any = require('mkdirp');
var rmdir : any = require('rmdir');

var uuid : any = require('node-uuid');

/**
 * ImagesCollectionsRouter class.
 *
 * @class ImagesCollectionsRouter
 * @extends RouterItf
 */
class ImagesCollectionsRouter extends RouterItf {

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
		this.router.param("imagescollection_id", function (req, res, next, id) {
			var fail = function(error) {
				next(error);
			};

			var success = function(imagesCollection) {
				req.imagesCollection = imagesCollection;

				if(typeof(req.user) == "undefined") {

					var successLoadUser = function() {
						req.user = req.imagesCollection.user();
						next();
					};

					req.imagesCollection.user().loadAssociations(successLoadUser, fail);
				} else {
					next();
				}
			};

			ImagesCollection.findOneByHashid(id, success, fail);
		});

		// Define '/' route.
		this.router.get('/', CMSAuth.can('manage user information'), function(req, res) {
			if(typeof(req.user) != "undefined") {
				self.listAllImagesCollectionsOfUser(req, res);
			} else {
				res.status(500).send({ 'error': 'Unauthorized.' });
			}
		});
		this.router.post('/', CMSAuth.can('manage user information'), function(req, res) {
			if(typeof(req.user) != "undefined") {
				self.newImagesCollection(req, res);
			} else {
				res.status(500).send({ 'error': 'Unauthorized.' });
			}
		});

		// Define '/:imagescollection_id' route.
		this.router.get('/:imagescollection_id', CMSAuth.can('manage user images collections'), function(req, res) { self.showImagesCollection(req, res); });
		this.router.put('/:imagescollection_id', CMSAuth.can('manage user images collections'), function(req, res) { self.updateImagesCollection(req, res); });
		this.router.delete('/:imagescollection_id', CMSAuth.can('manage user images collections'), function(req, res) { self.deleteImagesCollection(req, res); });

		// Define '/:imagescollection_id/images' route.
		this.router.use('/:imagescollection_id/images', (new ImagesRouter()).getRouter());
	}

	/**
	 * List list all images collections of user in req.
	 *
	 * @method listAllImagesCollectionsOfUser
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	listAllImagesCollectionsOfUser(req : any, res : any) {
		var fail = function(error) {
			res.status(500).send({ 'error': error });
		};

		var success = function() {

			var imagesCollections_JSON = [];

			if(req.user.imagesCollections().length > 0) {
				req.user.imagesCollections().forEach(function (imgCollection:ImagesCollection) {

					var successLoadCover = function() {
						imagesCollections_JSON.push(imgCollection.toJSONObject(true));

						if(imagesCollections_JSON.length == req.user.imagesCollections().length) {
							res.json(imagesCollections_JSON);
						}
					};

					imgCollection.loadCover(successLoadCover, fail);
				});
			} else {
				imagesCollections_JSON = req.user.toJSONObject(true)["imagesCollections"];

				res.json(imagesCollections_JSON);
			}

		};

		req.user.loadImagesCollections(success, fail);
	}

	/**
	 * Add a new Images Collection to User.
	 *
	 * @method newImagesCollection
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	newImagesCollection(req : any, res : any) {
		if(typeof(req.body.name) == "undefined" || req.body.name == "" || typeof(req.body.description) == "undefined") {
			res.status(500).send({ 'error': 'Missing some information to create new Images Collection.' });
		} else {
			var fail = function(error) {
				res.status(500).send({ 'error': error });
			};

			var success = function(imageCollection : ImagesCollection) {
				res.json(imageCollection.toJSONObject());
			};

			var hashid = uuid.v1();
			ImagesCollectionsRouter.newImagesCollectionObject(req, hashid, req.body.name, req.body.description, success, fail);
		}
	}

	/**
	 * Create new Images Collection and add it to User.
	 *
	 * @method newImagesCollectionObject
	 * @static
	 * @param {Express.Request} req - Request object.
	 * @param {string} hashid - ImagesCollection's hashid.
	 * @param {string} name - ImagesCollection's name.
	 * @param {string} description - ImagesCollection's description.
	 * @param {Function} successCallback - Success callback function.
	 * @param {Function} failCallback - Fail callback function.
	 */
	static newImagesCollectionObject(req : any, hashid : string, name : string, description : string, successCallback : Function, failCallback : Function ) {
		var newImagesCollection = new ImagesCollection(hashid, name, description);

		var fail = function(error) {
			failCallback(error);
		};

		var success = function(imageCollection : ImagesCollection) {

			var successUserLink = function() {

				var createImagesCollectionFolder = function() {
					fs.stat(CMSConfig.getUploadDir() + "users/" + req.user.hashid() + "/images/" + hashid + "/", function (err, stats) {
						if (err || !stats.isDirectory()) {
							mkdirp(CMSConfig.getUploadDir() + "users/" + req.user.hashid() + "/images/" + hashid + "/", function (err2) {
								if (err2) {
									fail(err2);
								} else {
									successCallback(imageCollection);
								}
							});
						} else {
							successCallback(imageCollection);
						}
					});
				};

				fs.stat(CMSConfig.getUploadDir() + "users/" + req.user.hashid() + "/images/", function (errImagesFolder, stats) {
					if (errImagesFolder || !stats.isDirectory()) {
						mkdirp(CMSConfig.getUploadDir() + "users/" + req.user.hashid() + "/images/", function (errImagesFolderCreation) {
							if (errImagesFolderCreation) {
								fail(errImagesFolderCreation);
							} else {
								createImagesCollectionFolder();
							}
						});
					} else {
						createImagesCollectionFolder();
					}
				});
			};

			req.user.addImagesCollection(imageCollection, successUserLink, fail);
		};

		newImagesCollection.create(success, fail);
	}

	/**
	 * Show ImagesCollection info.
	 *
	 * @method showImagesCollection
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	showImagesCollection(req : any, res : any) {
		res.json(req.imagesCollection.toJSONObject());
	}

	/**
	 * Update  ImagesCollection info.
	 *
	 * @method updateImagesCollection
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	updateImagesCollection(req : any, res : any) {
		if( typeof(req.body.name) == "undefined" && typeof(req.body.description) == "undefined") {
			res.status(500).send({ 'error': 'Missing some information to update ImagesCollection.' });
		} else {

			if(typeof(req.body.name) != "undefined" && req.body.name != "") {
				req.imagesCollection.setName(req.body.name);
			}

			if(typeof(req.body.description) != "undefined") {
				req.imagesCollection.setDescription(req.body.description);
			}

			var success = function(imagesCollection) {
				res.json(imagesCollection.toJSONObject());
			};

			var fail = function(error) {
				res.status(500).send({ 'error': error });
			};

			req.imagesCollection.update(success, fail);
		}
	}

	/**
	 * Delete ImagesCollection.
	 *
	 * @method deleteImagesCollection
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 * @param {Function} successCallback - If setted, this function should be called instead sending res
	 * @param {Function} failCallback - If setted, this function should be called instead sending res
	 */
	deleteImagesCollection(req : any, res : any, successCallback : Function = null, failCallback : Function = null) {

		var originImagesCollectionFolder = CMSConfig.getUploadDir() + "users/" + req.user.hashid() + "/images/" + req.imagesCollection.hashid();
		var tmpImagesCollectionFolder = CMSConfig.getUploadDir() + "deletetmp/users_" + req.user.hashid() + "_" + req.imagesCollection.hashid();

		var failCB = function(errString) {
			if(failCallback != null) {
				failCallback(errString);
			} else {
				res.status(500).send({ 'error': errString });
			}
		};

		fs.rename(originImagesCollectionFolder, tmpImagesCollectionFolder, function(err) {
			if(err) {
				failCB("Error during deleting ImagesCollection.");
			} else {
				var success = function(deleteImagesCollectionId) {
					rmdir(tmpImagesCollectionFolder, function ( err, dirs, files ){
						if(successCallback != null) {
							successCallback(deleteImagesCollectionId);
						} else {
							res.json(deleteImagesCollectionId);
						}
					});
				};

				var fail = function(error) {
					fs.rename(tmpImagesCollectionFolder, originImagesCollectionFolder , function(err) {
						failCB(error);
					});
				};

				req.imagesCollection.delete(success, fail);
			}
		});
	}
}