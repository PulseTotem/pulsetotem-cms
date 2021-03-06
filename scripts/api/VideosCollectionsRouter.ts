/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/RouterItf.ts" />
/// <reference path="../auth/CMSAuth.ts" />

/// <reference path="../model/VideosCollection.ts" />

/// <reference path="./VideosRouter.ts" />
/// <reference path="./ImagesCollectionsRouter.ts" />

declare var require : any;

var fs : any = require("fs");
var mkdirp : any = require('mkdirp');
var rmdir : any = require('rmdir');

var uuid : any = require('node-uuid');

/**
 * VideosCollectionsRouter class.
 *
 * @class VideosCollectionsRouter
 * @extends RouterItf
 */
class VideosCollectionsRouter extends RouterItf {

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
		this.router.param("videoscollection_id", function (req, res, next, id) {
			var fail = function(error) {
				next(error);
			};

			var success = function(videosCollection) {
				req.videosCollection = videosCollection;

				var successThumbnailsCollection = function(thumbnailsCollection) {
					req.videosThumbnailsCollection = thumbnailsCollection;
					next();
				};

				var retrieveThumbnailsCollection = function() {
					ImagesCollection.findOneByHashid(id, successThumbnailsCollection, fail);
				};

				if(typeof(req.team) == "undefined") {

					var successLoadTeam = function() {
						req.team = req.videosCollection.team();
						retrieveThumbnailsCollection();
					};

					req.videosCollection.team().loadAssociations(successLoadTeam, fail);
				} else {
					retrieveThumbnailsCollection();
				}
			};

			VideosCollection.findOneByHashid(id, success, fail);
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
				self.listAllVideosCollectionsOfTeam(req, res);
			} else {
				res.status(500).send({ 'error': 'Unauthorized.' });
			}
		});
		this.router.post('/', CMSAuth.can('manage team information'), function(req, res) {
			if(typeof(req.team) != "undefined") {
				self.newVideosCollection(req, res);
			} else {
				res.status(500).send({ 'error': 'Unauthorized.' });
			}
		});

		// Define '/:videoscollection_id' route.
		this.router.get('/:videoscollection_id', CMSAuth.can('manage team videos collections'), function(req, res) { self.showVideosCollection(req, res); });
		this.router.put('/:videoscollection_id', CMSAuth.can('manage team videos collections'), function(req, res) { self.updateVideosCollection(req, res); });
		this.router.delete('/:videoscollection_id', CMSAuth.can('manage team videos collections'), function(req, res) { self.deleteVideosCollection(req, res); });

		// Define '/:videoscollection_id/videos' route.
		this.router.use('/:videoscollection_id/videos', (new VideosRouter()).getRouter());

		// Define '/:videoscollection_id/teams' route.
		this.router.post('/:videoscollection_id/teams/:team_id', function(req, res) { self.moveCollectionToTeam(req, res); });
	}

	/**
	 * List list all videos collections of team in req.
	 *
	 * @method listAllVideosCollectionsOfTeam
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	listAllVideosCollectionsOfTeam(req : any, res : any) {
		var fail = function(error) {
			res.status(500).send({ 'error': error });
		};

		var success = function() {

			var videosCollections_JSON = [];

			if(req.team.videosCollections().length > 0) {
				req.team.videosCollections().forEach(function (vidCollection:VideosCollection) {

					var successLoadCover = function() {

						if(vidCollection.cover() != null) {

							var successLoadThumbnail = function () {
								var vidCollectionJSON = vidCollection.toJSONObject(true);
								vidCollectionJSON["cover"] = vidCollection.cover().toJSONObject(true);
								videosCollections_JSON.push(vidCollectionJSON);

								if (videosCollections_JSON.length == req.team.videosCollections().length) {
									res.json(videosCollections_JSON);
								}
							};

							vidCollection.cover().loadThumbnail(successLoadThumbnail, fail);
						} else {
							var vidCollectionJSON = vidCollection.toJSONObject(true);
							videosCollections_JSON.push(vidCollectionJSON);

							if (videosCollections_JSON.length == req.team.videosCollections().length) {
								res.json(videosCollections_JSON);
							}
						}
					};

					vidCollection.loadCover(successLoadCover, fail);
				});
			} else {
				videosCollections_JSON = req.team.toJSONObject(true)["videosCollections"];

				res.json(videosCollections_JSON);
			}

		};

		req.team.loadVideosCollections(success, fail);
	}

	/**
	 * Add a new Videos Collection to Team.
	 *
	 * @method newVideosCollection
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	newVideosCollection(req : any, res : any) {
		if(typeof(req.body.name) == "undefined" || req.body.name == "" || typeof(req.body.description) == "undefined") {
			res.status(500).send({ 'error': 'Missing some information to create new Videos Collection.' });
		} else {
			var hashid = uuid.v1();

			var newVideosCollection = new VideosCollection(hashid, req.body.name, req.body.description);

			var fail = function(error) {
				res.status(500).send({ 'error': error });
			};

			var success = function(videoCollection : VideosCollection) {

				var successTeamLink = function() {

					var createThumbnailCollection = function() {

						var successCreateThumbnailCollection = function(thumbnailCollection : ImagesCollection) {
							res.json(videoCollection.toJSONObject());
						};

						ImagesCollectionsRouter.newImagesCollectionObject(req, hashid, videoCollection.name() + " (Videos Thumbnails)", "", true, successCreateThumbnailCollection, fail);
					};

					var createVideosCollectionFolder = function() {
						fs.stat(CMSConfig.getUploadDir() + "teams/" + req.team.hashid() + "/videos/" + hashid + "/", function (err, stats) {
							if (err || !stats.isDirectory()) {
								mkdirp(CMSConfig.getUploadDir() + "teams/" + req.team.hashid() + "/videos/" + hashid + "/", function (err2) {
									if (err2) {
										fail(err2);
									} else {
										createThumbnailCollection();
									}
								});
							} else {
								createThumbnailCollection();
							}
						});
					};

					fs.stat(CMSConfig.getUploadDir() + "teams/" + req.team.hashid() + "/videos/", function (errVideosFolder, stats) {
						if (errVideosFolder || !stats.isDirectory()) {
							mkdirp(CMSConfig.getUploadDir() + "teams/" + req.team.hashid() + "/videos/", function (errVideosFolderCreation) {
								if (errVideosFolderCreation) {
									fail(errVideosFolderCreation);
								} else {
									createVideosCollectionFolder();
								}
							});
						} else {
							createVideosCollectionFolder();
						}
					});
				};

				req.team.addVideosCollection(videoCollection, successTeamLink, fail);
			};

			newVideosCollection.create(success, fail);
		}
	}

	/**
	 * Show VideosCollection info.
	 *
	 * @method showVideosCollection
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	showVideosCollection(req : any, res : any) {
		res.json(req.videosCollection.toJSONObject());
	}

	/**
	 * Update VideosCollection info.
	 *
	 * @method updateVideosCollection
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	updateVideosCollection(req : any, res : any) {
		if( typeof(req.body.name) == "undefined" && typeof(req.body.description) == "undefined") {
			res.status(500).send({ 'error': 'Missing some information to update VideosCollection.' });
		} else {

			if(typeof(req.body.name) != "undefined" && req.body.name != "") {
				req.videosCollection.setName(req.body.name);
				req.videosThumbnailsCollection.setName(req.body.name + " (Videos Thumbnails)");
			}

			if(typeof(req.body.description) != "undefined") {
				req.videosCollection.setDescription(req.body.description);
			}

			var fail = function(error) {
				res.status(500).send({ 'error': error });
			};

			var success = function(videosCollection) {
				var successThumbnailsUpdate = function() {
					//Success even if Thumbnails collection update failed.
					res.json(videosCollection.toJSONObject());
				};
				req.videosThumbnailsCollection.update(successThumbnailsUpdate, successThumbnailsUpdate);
			};

			req.videosCollection.update(success, fail);
		}
	}

	/**
	 * Delete VideosCollection.
	 *
	 * @method deleteVideosCollection
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	deleteVideosCollection(req : any, res : any) {
		var originVideosCollectionFolder = CMSConfig.getUploadDir() + "teams/" + req.team.hashid() + "/videos/" + req.videosCollection.hashid();
		var tmpVideosCollectionFolder = CMSConfig.getUploadDir() + "deletetmp/teams_" + req.team.hashid() + "_" + req.videosCollection.hashid();

		var failCB = function(errString) {
			res.status(500).send({ 'error': errString });
		};

		fs.rename(originVideosCollectionFolder, tmpVideosCollectionFolder, function(err) {
			if(err) {
				failCB("Error during deleting VideosCollection.");
			} else {
				var success = function(deleteVideosCollectionId) {
					rmdir(tmpVideosCollectionFolder, function ( err, dirs, files ){

						var imgCollRouter : ImagesCollectionsRouter = new ImagesCollectionsRouter();
						req.imagesCollection = req.videosThumbnailsCollection;
						imgCollRouter.deleteImagesCollection(req, res, function() {
							res.json(deleteVideosCollectionId);
						}, failCB);
					});
				};

				var fail = function(error) {
					fs.rename(tmpVideosCollectionFolder, originVideosCollectionFolder , function(err) {
						failCB(error);
					});
				};

				req.videosCollection.delete(success, fail);
			}
		});
	}

	/**
	 * Move collection to Team
	 *
	 * @method moveCollectionToTeam
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	moveCollectionToTeam(req : any, res : any) {
		var originVideosCollectionFolder = CMSConfig.getUploadDir() + "users/" + req.user.hashid() + "/videos/" + req.videosCollection.hashid();
		var teamVideosCollectionFolder = CMSConfig.getUploadDir() + "teams/" + req.team.hashid() + "/videos/" + req.videosCollection.hashid();

		var fail = function(errString) {
			res.status(500).send({ 'error': errString });
		};

		var moveCollection = function() {
			fs.rename(originVideosCollectionFolder, teamVideosCollectionFolder, function(err) {
				if(err) {
					fail("Error during moving VideosCollection.");
				} else {
					var success = function() {
						res.json(req.videosCollection.toJSONObject());
					};

					var successRemove = function() {
						req.team.addVideosCollection(req.videosCollection, success, fail);
					};

					req.user.removeVideosCollection(req.videosCollection, successRemove, fail);
				}
			});
		};

		fs.stat(CMSConfig.getUploadDir() + "teams/" + req.team.hashid() + "/videos/", function (errVideosFolder, stats) {
			if (errVideosFolder || !stats.isDirectory()) {
				mkdirp(CMSConfig.getUploadDir() + "teams/" + req.team.hashid() + "/videos/", function (errVideosFolderCreation) {
					if (errVideosFolderCreation) {
						fail(errVideosFolderCreation);
					} else {
						moveCollection();
					}
				});
			} else {
				moveCollection();
			}
		});
	}
}