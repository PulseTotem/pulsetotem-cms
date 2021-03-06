/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/RouterItf.ts" />
/// <reference path="../core/CMSConfig.ts" />
/// <reference path="../auth/CMSAuth.ts" />

/// <reference path="../core/Helper.ts" />

/// <reference path="../model/Video.ts" />
/// <reference path="../model/ImageObject.ts" />

/// <reference path="./ImagesRouter.ts" />

declare var require : any;
declare var Buffer : any;
var fs : any = require("fs");

var uuid : any = require('node-uuid');

/**
 * VideosRouter class.
 *
 * @class VideosRouter
 * @extends RouterItf
 */
class VideosRouter extends RouterItf {

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
		this.router.param("video_id", function (req, res, next, id) {
			var success = function(video) {
				req.video = video;
				next();
			};

			var fail = function(error) {
				next(error);
			};

			Video.findOneByHashid(id, success, fail);
		});

		// Define '/' route.
		this.router.get('/', CMSAuth.can('manage team videos collections'), function(req, res) {
			if(typeof(req.videosCollection) != "undefined") {
				self.listAllVideosOfCollection(req, res);
			} else {
				res.status(500).send({ 'error': 'Unauthorized.' });
			}
		});
		this.router.post('/', CMSAuth.can('manage team videos collections'), function(req, res) {
			if(typeof(req.videosCollection) != "undefined") {
				self.newVideo(req, res);
			} else {
				res.status(500).send({ 'error': 'Unauthorized.' });
			}
		});

		// Define '/:video_id' route.
		this.router.get('/:video_id', CMSAuth.can('manage team videos'), function(req, res) {
			if(typeof(req.videosCollection) != "undefined") {
				self.showVideo(req, res);
			} else {
				res.status(500).send({ 'error': 'Unauthorized.' });
			}
		});
		this.router.get('/:video_id/raw', function(req, res) { self.rawVideo(req, res); });
		this.router.put('/:video_id', CMSAuth.can('manage team videos'), function(req, res) {
			if(typeof(req.videosCollection) != "undefined") {
				self.updateVideo(req, res);
			} else {
				res.status(500).send({ 'error': 'Unauthorized.' });
			}
		});
		this.router.delete('/:video_id', CMSAuth.can('manage team videos'), function(req, res) {
			if(typeof(req.videosCollection) != "undefined") {
				self.deleteVideo(req, res);
			} else {
				res.status(500).send({ 'error': 'Unauthorized.' });
			}
		});
	}

	/**
	 * List list all videos of collection in req.
	 *
	 * @method listAllVideosOfCollection
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	listAllVideosOfCollection(req : any, res : any) {
		var videos_JSON = [];

		if(req.videosCollection.videos().length > 0) {
			var fail = function(error) {
				res.status(500).send({ 'error': error });
			};

			req.videosCollection.videos().forEach(function (video : Video) {
				var successLoadThumbnail = function() {
					videos_JSON.push(video.toJSONObject(true));

					if(videos_JSON.length == req.videosCollection.videos().length) {
						res.json(videos_JSON);
					}
				};

				video.loadThumbnail(successLoadThumbnail, fail);
			});
		} else {
			res.json(videos_JSON);
		}
	}

	/**
	 * Add a new Video to Collection.
	 *
	 * @method newVideo
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	newVideo(req : any, res : any) {
		if(Helper.isEmpty(req.files)) {
			res.status(500).send({ 'error': 'Missing some information to create new Video.' });
		} else {
			var addVideoToCollection = function(vidId, vidName, vidDescription, vidFile, successCB, failCB) {
				var newVideo = new Video(vidId, vidName, vidDescription, vidFile.mimetype, vidFile.extension);

				var successCreate = function(video : Video) {
					var successVideosCollectionLink = function () {
						var originVideoFile = CMSConfig.getUploadDir() + vidFile.name;
						var extension = '';
						if(vidFile.extension != '') {
							extension = '.' + vidFile.extension;
						}
						var destVideoFile = CMSConfig.getUploadDir() + "teams/" + req.team.hashid() + "/videos/" + req.videosCollection.hashid() + "/" + vidId + extension;

						fs.rename(originVideoFile, destVideoFile, function (err) {
							if (err) {
								failCB(new Error("Error during adding Video to VideosCollection."));
							} else {
								var destThumbnailFile = CMSConfig.getUploadDir() + "teams/" + req.team.hashid() + "/images/" + req.videosThumbnailsCollection.hashid() + "/" + vidId + '.png';

								Helper.makeSnapshot(destVideoFile, destThumbnailFile, '00:00:01', '200', '125', function(error){
									if(error != null) {
										Logger.debug(error);
										failCB(error);
									} else {
										var newThumbnailImage = new ImageObject(vidId, vidName + " Thumbnail", "", Helper.guessMimetypeFromExtension("png"), "png");

										var successCreateThumbnail = function (thumbnailImg:ImageObject) {
											var successThumbnailsCollectionLink = function () {

												var successThumbnailVideoLink = function () {
													successCB(video);
												};

												video.setThumbnail(thumbnailImg, successThumbnailVideoLink, failCB)
											};

											req.videosThumbnailsCollection.addImage(thumbnailImg, successThumbnailsCollectionLink, failCB);
										};

										newThumbnailImage.create(successCreateThumbnail, failCB);
									}
								});
							}
						});
					};

					req.videosCollection.addVideo(video, successVideosCollectionLink, failCB);
				};

				newVideo.create(successCreate, failCB);
			};

			if(typeof(req.files.file) == "undefined") {

				var filesKeys = Object.keys(req.files);

				if(filesKeys.length > 0) {
					var videosDesc = [];
					var nbFails = 0;

					filesKeys.forEach(function(filesKey : any) {
						var file : any = req.files[filesKey];

						var fail = function (error) {
							nbFails = nbFails + 1;
							videosDesc.push({
								"file" : file.originalname,
								"error" : error
							});

							if(videosDesc.length == filesKeys.length) {
								if(nbFails == filesKeys.length) {
									res.status(500).json(videosDesc);
								} else {
									res.json(videosDesc);
								}
							}
						};

						var success = function(video:Video) {
							videosDesc.push(video.toJSONObject());

							if(videosDesc.length == filesKeys.length) {
								res.json(videosDesc);
							}
						};

						var hashid = uuid.v1();

						addVideoToCollection(hashid, file.originalname, "", file, success, fail);
					});
				} else {
					res.status(500).send({ 'error': 'Files is defined but missed information to create video.' });
				}
			} else {
				var hashid = uuid.v1();

				var videoName = req.body.name || "";
				if (videoName == "") {
					videoName = req.files.file.originalname;
				}
				var videoDescription = req.body.description || "";

				var fail = function (error) {
					res.status(500).send({'error': error});
				};

				var success = function(video:Video) {
					res.json(video.toJSONObject());
				};

				addVideoToCollection(hashid, videoName, videoDescription, req.files.file, success, fail);
			}
		}
	}

	/**
	 * Show Video info.
	 *
	 * @method showVideo
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	showVideo(req : any, res : any) {
		res.json(req.video.toJSONObject());
	}

	/**
	 * Show Video raw.
	 *
	 * @method rawVideo
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	rawVideo(req : any, res : any) {
		var fail = function(error) {
			res.status(500).send({ 'error': error });
		};

		var success = function() {

			var extension = '';
			if(req.video.extension() != null && req.video.extension() != '') {
				extension = '.' + req.video.extension();
			}

			var videoBasePath = CMSConfig.getUploadDir() + "teams/" + req.video.collection().team().hashid() + "/videos/" + req.video.collection().hashid() + "/" + req.video.hashid();

			var renderVideo = function(vidPath) {
				var contentType = 'video/mp4';
				if (req.video.mimetype() != null && req.video.mimetype() != "") {
					contentType = req.video.mimetype();
				}

				var range = req.headers.range;
				var positions = range ? range.replace(/bytes=/, "").split("-") : ["0"];
				var start = parseInt(positions[0], 10);

				fs.stat(vidPath, function(err, stats) {
					var total = stats.size;
					var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
					var chunksize = (end - start) + 1;

					res.writeHead(206, {
						"Content-Range": "bytes " + start + "-" + end + "/" + total,
						"Accept-Ranges": "bytes",
						"Content-Length": chunksize,
						"Content-Type": contentType
					});

					var stream = fs.createReadStream(vidPath, {start: start, end: end})
						.on("open", function () {
							stream.pipe(res);
						}).on("error", function (err) {
							res.end(err);
						});
				});
			};

			if(extension != '') {
				var videoPath = videoBasePath + extension;

				//var vid = fs.readFileSync(videoPath);
				renderVideo(videoPath);
			} else {
				//var vid = fs.readFileSync(videoBasePath);
				renderVideo(videoBasePath);
			}
		};

		req.video.collection().loadTeam(success, fail);
	}

	/**
	 * Update Video info.
	 *
	 * @method updateVideo
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	updateVideo(req : any, res : any) {
		if( typeof(req.body.name) == "undefined" && typeof(req.body.description) == "undefined") {
			res.status(500).send({ 'error': 'Missing some information to update Video.' });
		} else {

			if(typeof(req.body.name) != "undefined" && req.body.name != "") {
				req.video.setName(req.body.name);
				req.video.thumbnail().setName(req.body.name + " Thumbnail")
			}

			if(typeof(req.body.description) != "undefined" && req.body.description != "") {
				req.video.setDescription(req.body.description);
			}

			var success = function(video) {

				var successThumbnailUpdated = function() {
					//Success even if thumbnail update failed.
					res.json(video.toJSONObject());
				};

				req.video.thumbnail().update(successThumbnailUpdated, successThumbnailUpdated);
			};

			var fail = function(error) {
				res.status(500).send({ 'error': error });
			};

			req.video.update(success, fail);
		}
	}

	/**
	 * Delete Video.
	 *
	 * @method deleteVideo
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	deleteVideo(req : any, res : any) {

		var failCB = function(error) {
			res.status(500).send({ 'error': error });
		};

		var successRemoveVideo = function() {
			var extension = '';
			if(req.video.extension() != null && req.video.extension() != '') {
				extension = '.' + req.video.extension();
			}

			var originVideoFile = CMSConfig.getUploadDir() + "teams/" + req.team.hashid() + "/videos/" + req.videosCollection.hashid() + "/" + req.video.hashid() + extension;
			var tmpVideoFile = CMSConfig.getUploadDir() + "deletetmp/teams_" + req.team.hashid() + "_videos_" + req.videosCollection.hashid() + "_" + req.video.hashid() + extension;

			fs.rename(originVideoFile, tmpVideoFile, function(err) {
				if(err) {
					failCB("Error during deleting Video.");
				} else {
					var success = function(deleteVideoId) {
						fs.unlink(tmpVideoFile, function(err2) {
							var imgRouter : ImagesRouter = new ImagesRouter();
							req.imagesCollection = req.videosThumbnailsCollection;
							req.image = req.video.thumbnail();
							imgRouter.deleteImage(req, res, function() {
								res.json(deleteVideoId);
							}, failCB);
						});
					};

					var fail = function(error) {
						fs.rename(tmpVideoFile, originVideoFile , function(err) {
							failCB(error);
						});
					};

					req.video.delete(success, fail);
				}
			});
		};

		req.videosCollection.removeVideo(req.video, successRemoveVideo, failCB);
	}
}