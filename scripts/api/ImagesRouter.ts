/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/RouterItf.ts" />
/// <reference path="../core/CMSConfig.ts" />
/// <reference path="../auth/CMSAuth.ts" />

/// <reference path="../model/ImageObject.ts" />

declare var require : any;
declare var Buffer : any;
var fs : any = require("fs");
var lwip : any = require('lwip');

var uuid : any = require('node-uuid');

/**
 * ImagesRouter class.
 *
 * @class ImagesRouter
 * @extends RouterItf
 */
class ImagesRouter extends RouterItf {

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
		this.router.param("image_id", function (req, res, next, id) {
			var success = function(image) {
				req.image = image;
				next();
			};

			var fail = function(error) {
				next(error);
			};

			ImageObject.findOneByHashid(id, success, fail);
		});

		// Define '/' route.
		this.router.get('/', CMSAuth.can('manage team images collections'), function(req, res) {
			if(typeof(req.imagesCollection) != "undefined") {
				self.listAllImagesOfCollection(req, res);
			} else {
				res.status(500).send({ 'error': 'Unauthorized.' });
			}
		});
		this.router.post('/', CMSAuth.can('manage team images collections'), function(req, res) {
			if(typeof(req.imagesCollection) != "undefined") {
				self.newImage(req, res);
			} else {
				res.status(500).send({ 'error': 'Unauthorized.' });
			}
		});

		// Define '/:image_id' route.
		this.router.get('/:image_id', CMSAuth.can('manage team images'), function(req, res) {
			if(typeof(req.imagesCollection) != "undefined") {
				self.showImage(req, res);
			} else {
				res.status(500).send({ 'error': 'Unauthorized.' });
			}
		});
		this.router.get('/:image_id/raw', function(req, res) { self.rawImage(req, res); });
		this.router.put('/:image_id', CMSAuth.can('manage team images'), function(req, res) {
			if(typeof(req.imagesCollection) != "undefined") {
				self.updateImage(req, res);
			} else {
				res.status(500).send({ 'error': 'Unauthorized.' });
			}
		});
		this.router.delete('/:image_id', CMSAuth.can('manage team images'), function(req, res) {
			if(typeof(req.imagesCollection) != "undefined") {
				self.deleteImage(req, res);
			} else {
				res.status(500).send({ 'error': 'Unauthorized.' });
			}
		});
	}

	/**
	 * List list all images of collection in req.
	 *
	 * @method listAllImagesOfCollection
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	listAllImagesOfCollection(req : any, res : any) {
		var images_JSON = req.imagesCollection.toJSONObject(true)["images"];

		res.json(images_JSON);
	}

	/**
	 * Add a new Image to Collection.
	 *
	 * @method newImage
	 * @param {Express.Request} req - Request object. The request object should contain either a files attribute
	 * from a file upload or a fileb64 representing an image file in base64.
	 * The structure if it is a fileb64 is the following: {'name': filename, 'file': base64file, 'description': description}
	 *
	 * @param {Express.Response} res - Response object.
	 * @param {Function} successCallback - If setted, this function should be called instead sending res
	 * @param {Function} failCallback - If setted, this function should be called instead sending res
	 */
	newImage(req : any, res : any, successCallback : Function = null, failCallback : Function = null) {
		var failCB = function(errString) {
			if(failCallback != null) {
				failCallback(errString);
			} else {
				res.status(500).send({ 'error': errString });
			}
		};

		if(Helper.isEmpty(req.files) && Helper.isEmpty(req.body.file)) {
			Logger.error("Try to upload an image without any datas");
			failCB('Missing some information to create new Image.');
		} else if (!Helper.isEmpty(req.files)) {

			Logger.debug("Upload image using files property");

			var addImageToCollection = function(imgId, imgName, imgDescription, imgFile, successCB, failFCB) {
				var newImage = new ImageObject(imgId, imgName, imgDescription, imgFile.mimetype, imgFile.extension);

				var successCreate = function(image:ImageObject) {
					var successImagesCollectionLink = function () {

						var originImageFile = CMSConfig.getUploadDir() + imgFile.name;
						var extension = '';
						if(imgFile.extension != '') {
							extension = '.' + imgFile.extension;
						}
						var destImageFile = CMSConfig.getUploadDir() + "teams/" + req.team.hashid() + "/images/" + req.imagesCollection.hashid() + "/" + imgId + extension;

						fs.rename(originImageFile, destImageFile, function (err) {
							if (err) {
								failFCB(new Error("Error during adding Image to ImagesCollection."));
							} else {
								successCB(image);
							}
						});
					};

					req.imagesCollection.addImage(image, successImagesCollectionLink, failFCB);
				};

				newImage.create(successCreate, failFCB);
			};

			if(typeof(req.files.file) == "undefined") {

				var filesKeys = Object.keys(req.files);

				if(filesKeys.length > 0) {
					var imagesDesc = [];
					var nbFails = 0;

					filesKeys.forEach(function(filesKey : any) {
						var file : any = req.files[filesKey];

						var fail = function (error) {
							nbFails = nbFails + 1;
							imagesDesc.push({
								"file" : file.originalname,
								"error" : error
							});

							if(imagesDesc.length == filesKeys.length) {
								if(nbFails == filesKeys.length) {
									failCB(JSON.stringify(imagesDesc));
								} else {
									if(successCallback != null) {
										successCallback(imagesDesc);
									} else {
										res.json(imagesDesc);
									}
								}
							}
						};

						var success = function(image:ImageObject) {
							imagesDesc.push(image.toJSONObject());

							if(imagesDesc.length == filesKeys.length) {
								if(successCallback != null) {
									successCallback(imagesDesc);
								} else {
									res.json(imagesDesc);
								}
							}
						};

						var hashid = uuid.v1();

						addImageToCollection(hashid, file.originalname, "", file, success, fail);
					});
				} else {
					failCB('Files is defined but missed information to create image.');
				}
			} else {
				var hashid = uuid.v1();

				var imageName = req.body.name || "";
				if (imageName == "") {
					imageName = req.files.file.originalname;
				}
				var imageDescription = req.body.description || "";

				var fail = function (error) {
					failCB(error);
				};

				var success = function(image:ImageObject) {
					if(successCallback != null) {
						successCallback(image.toJSONObject());
					} else {
						res.json(image.toJSONObject());
					}
				};

				addImageToCollection(hashid, imageName, imageDescription, req.files.file, success, fail);
			}
		} else if (!Helper.isEmpty(req.body.file)) {

			Logger.debug("Upload image using body.file property");
			var hashid = uuid.v1();
			var imageName = req.body.name;
			var file = req.body.file;
			var description = req.body.description;
			var extension = Helper.guessImageExtensionFromB64(file);

			var fail = function (error) {
				Logger.error(error);
				failCB(error);
			};

			if (extension == null) {
				fail('Unable to detect image extension from b64 datas.');
			} else {
				var type = Helper.guessMimetypeFromExtension(extension);

				var newImage = new ImageObject(hashid, imageName, description, type, extension);

				var success = function(image:ImageObject) {
					if(successCallback != null) {
						successCallback(image.toJSONObject());
					} else {
						res.json(image.toJSONObject());
					}
				};

				var successCreation = function (image : ImageObject) {
					var successImagesCollectionLink = function () {
						var fileExtension = '.' + extension;
						var destImageFile = CMSConfig.getUploadDir() + "teams/" + req.team.hashid() + "/images/" + req.imagesCollection.hashid() + "/" + hashid + fileExtension;
						var base64DrawContent = file.replace(/^data:image\/(jpeg|png|gif);base64,/, "");
						var drawContentImg = new Buffer(base64DrawContent, 'base64');

						lwip.open(drawContentImg, extension, function (drawContentErr, lwipImage) {
							if (drawContentErr) {
								fail("Fail opening original file : " + JSON.stringify(drawContentErr));
							} else {
								lwipImage.writeFile(destImageFile, extension, function (errWriteFile) {
									if (errWriteFile) {
										fail("Fail writing file : "+JSON.stringify(errWriteFile));
									} else {
										success(image);
									}
								});
							}
						});
					};

					req.imagesCollection.addImage(image, successImagesCollectionLink, fail);
				};

				newImage.create(successCreation, fail);
			}
		}
	}

	/**
	 * Show Image info.
	 *
	 * @method showImage
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	showImage(req : any, res : any) {
		res.json(req.image.toJSONObject());
	}

	/**
	 * Show Image raw.
	 *
	 * @method rawImage
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	rawImage(req : any, res : any) {
		var fail = function(error) {
			res.status(500).send({ 'error': error });
		};

		var success = function() {

			var extension = '';
			if(req.image.extension() != null && req.image.extension() != '') {
				extension = '.' + req.image.extension();
			}

			var imageBasePath = CMSConfig.getUploadDir() + "teams/" + req.image.collection().team().hashid() + "/images/" + req.image.collection().hashid() + "/" + req.image.hashid();

			var renderImg = function(img, isLwipImg) {
				var bufferType = 'jpg';
				if (req.image.mimetype() != null && req.image.mimetype() != "") {
					res.set('Content-Type', req.image.mimetype());
					switch (req.image.mimetype()) {
						case 'image/gif' :
							bufferType = 'gif';
							break;
						case 'image/png' :
							bufferType = 'png';
							break;
					}
				} else {
					res.set('Content-Type', 'image/jpeg');
				}

				if(isLwipImg) {
					img.toBuffer(bufferType, function (err, imgBuffer) {
						if (err) {
							fail("Fail during rendering file");
							return;
						}
						res.status(200).end(imgBuffer);
					});
				} else {
					res.status(200).end(img, 'binary');
				}
			};

			if(extension != '') {
				var imagePath;

				if ( 	(req.image.mimetype() != null && req.image.mimetype() != "" && req.image.mimetype() == 'image/gif') ||
					(extension == ".gif")		) { //Manage gif alone due to an issue with lwip gif rendering (issue : https://github.com/EyalAr/lwip/issues/153)
					imagePath = imageBasePath + extension;
					var img = fs.readFileSync(imagePath);
					renderImg(img, false);
				} else {

					if (typeof(req.query.size) != "undefined") {
						switch (req.query.size) {
							case 'original' :
								imagePath = imageBasePath + extension;
								break;
							case 'large' :
								imagePath = imageBasePath + '_large' + extension;
								break;
							case 'medium' :
								imagePath = imageBasePath + '_medium' + extension;
								break;
							case 'small' :
								imagePath = imageBasePath + '_small' + extension;
								break;
							case 'thumb' :
								imagePath = imageBasePath + '_thumb' + extension;
								break;
							case 'square' :
								imagePath = imageBasePath + '_square' + extension;
								break;
							default:
								imagePath = imageBasePath + extension;
						}
					} else {
						imagePath = imageBasePath + extension;
					}

					lwip.open(imagePath, function (err, img) {
						if (err) {
							if (imagePath == imageBasePath + extension) {
								fail("Fail during reading file");
								return;
							} else {
								lwip.open(imageBasePath + extension, function (errOriginal, imgOriginal) {
									if (errOriginal) {
										fail("Fail during reading file");
										return;
									}
									var originalWidth = imgOriginal.width();
									var originalHeight = imgOriginal.height();

									var newWidth = 0;
									var newHeight = -1;

									switch (req.query.size) {
										case 'large' :
											newWidth = 1024;
											break;
										case 'medium' :
											newWidth = 640;
											break;
										case 'small' :
											newWidth = 320;
											break;
										case 'thumb' :
											newWidth = 100;
											break;
										case 'square' :
											newWidth = 75;
											newHeight = 75;
											break;
									}

									if (newHeight == -1) {
										var ratio = originalWidth / newWidth;
										newHeight = originalHeight / ratio;
									}

									imgOriginal.resize(newWidth, newHeight, "linear", function (errResize, imgResized) {
										if (errResize) {
											fail("Fail during resizing file");
											return;
										}

										imgResized.writeFile(imagePath, function (errWrite) {
											if (errWrite) {
												fail("Fail during writing file");
												return;
											}
											renderImg(imgResized, true);
										});
									});
								});
							}
						} else {
							renderImg(img, true);
						}
					});
				}
			} else {
				var img = fs.readFileSync(imageBasePath);
				renderImg(img, false);
			}
		};

		req.image.collection().loadTeam(success, fail);
	}

	/**
	 * Update Image info.
	 *
	 * @method updateImage
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	updateImage(req : any, res : any) {
		if( typeof(req.body.name) == "undefined" && typeof(req.body.description) == "undefined") {
			res.status(500).send({ 'error': 'Missing some information to update Image.' });
		} else {

			if(typeof(req.body.name) != "undefined" && req.body.name != "") {
				req.image.setName(req.body.name);
			}

			if(typeof(req.body.description) != "undefined" && req.body.description != "") {
				req.image.setDescription(req.body.description);
			}

			var success = function(image) {
				res.json(image.toJSONObject());
			};

			var fail = function(error) {
				res.status(500).send({ 'error': error });
			};

			req.image.update(success, fail);
		}
	}

	/**
	 * Delete Image.
	 *
	 * @method deleteImage
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 * @param {Function} successCallback - If setted, this function should be called instead sending res
	 * @param {Function} failCallback - If setted, this function should be called instead sending res
	 */
	deleteImage(req : any, res : any, successCallback : Function = null, failCallback : Function = null) {
		var failCB = function(errString) {
			if(failCallback != null) {
				failCallback(errString);
			} else {
				res.status(500).send({ 'error': errString });
			}
		};

		var successRemoveImage = function() {
			var extension = '';
			if(req.image.extension() != null && req.image.extension() != '') {
				extension = '.' + req.image.extension();
			}

			var originImageFile = CMSConfig.getUploadDir() + "teams/" + req.team.hashid() + "/images/" + req.imagesCollection.hashid() + "/" + req.image.hashid() + extension;
			var tmpImageFile = CMSConfig.getUploadDir() + "deletetmp/teams_" + req.team.hashid() + "_images_" + req.imagesCollection.hashid() + "_" + req.image.hashid() + extension;

			fs.rename(originImageFile, tmpImageFile, function(err) {
				if(err) {
					failCB("Error during deleting Image.");
				} else {
					var success = function(deleteImageId) {
						fs.unlink(tmpImageFile, function(err2) {
							if(successCallback != null) {
								successCallback(deleteImageId);
							} else {
								res.json(deleteImageId);
							}
						});
					};

					var fail = function(error) {
						fs.rename(tmpImageFile, originImageFile , function(err) {
							failCB(error);
						});
					};

					req.image.delete(success, fail);
				}
			});
		};

		req.imagesCollection.removeImage(req.image, successRemoveImage, failCB);
	}
}