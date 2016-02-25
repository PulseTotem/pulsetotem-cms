/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/RouterItf.ts" />
/// <reference path="../core/CMSConfig.ts" />
/// <reference path="../auth/CMSAuth.ts" />

/// <reference path="../model/ImageObject.ts" />

declare var require : any;

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
		this.router.get('/', CMSAuth.can('manage user images collections'), function(req, res) { self.listAllImagesOfCollection(req, res); });
		this.router.post('/', CMSAuth.can('manage user images collections'), function(req, res) { self.newImage(req, res); });

		// Define '/:image_id' route.
		this.router.get('/:image_id', CMSAuth.can('manage user images'), function(req, res) { self.showImage(req, res); });
		this.router.get('/:image_id/raw', function(req, res) { self.rawImage(req, res); });
		this.router.put('/:image_id', CMSAuth.can('manage user images'), function(req, res) { self.updateImage(req, res); });
		this.router.delete('/:image_id', CMSAuth.can('manage user images'), function(req, res) { self.deleteImage(req, res); });
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
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	newImage(req : any, res : any) {
		if(typeof(req.files) == "undefined") {
			res.status(500).send({ 'error': 'Missing some information to create new Image.' });
		} else {

			var addImageToCollection = function(imgId, imgName, imgDescription, imgFile, successCB, failCB) {
				var newImage = new ImageObject(imgId, imgName, imgDescription, imgFile.mimetype, imgFile.extension);

				var successCreate = function(image:ImageObject) {
					var successImagesCollectionLink = function () {

						var originImageFile = CMSConfig.getUploadDir() + imgFile.name;
						var extension = '';
						if(imgFile.extension != '') {
							extension = '.' + imgFile.extension;
						}
						var destImageFile = CMSConfig.getUploadDir() + "users/" + req.user.hashid() + "/images/" + req.imagesCollection.hashid() + "/" + imgId + extension;

						fs.rename(originImageFile, destImageFile, function (err) {
							if (err) {
								failCB(new Error("Error during adding Image to ImagesCollection."));
							} else {
								successCB(image);
							}
						});
					};

					req.imagesCollection.addImage(image, successImagesCollectionLink, failCB);
				};

				newImage.create(successCreate, failCB);
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
									res.status(500).json(imagesDesc);
								} else {
									res.json(imagesDesc);
								}
							}
						};

						var success = function(image:ImageObject) {
							imagesDesc.push(image.toJSONObject());

							if(imagesDesc.length == filesKeys.length) {
								res.json(imagesDesc);
							}
						};

						var hashid = uuid.v1();

						addImageToCollection(hashid, file.originalname, "", file, success, fail);
					});
				} else {
					res.status(500).send({ 'error': 'Missing some information to create new Image.' });
				}
			} else {
				var hashid = uuid.v1();

				var imageName = req.body.name || "";
				if (imageName == "") {
					imageName = req.files.file.originalname;
				}
				var imageDescription = req.body.description || "";

				var fail = function (error) {
					res.status(500).send({'error': error});
				};

				var success = function(image:ImageObject) {
					res.json(image.toJSONObject());
				};

				addImageToCollection(hashid, imageName, imageDescription, req.files.file, success, fail);
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
			var imagePath = CMSConfig.getUploadDir() + "users/" + req.image.collection().user().hashid() + "/images/" + req.image.collection().hashid() + "/" + req.image.hashid() + extension;

			if(extension != '') {

				lwip.open(imagePath, function (err, img) {
					if (err) {
						fail("Fail during reading file");
						return;
					}

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

					img.toBuffer(bufferType, function (err, imgBuffer) {
						if (err) {
							fail("Fail during rendering file");
							return;
						}
						res.status(200).end(imgBuffer);
					});
				});
			} else {
				var img = fs.readFileSync(imagePath);
				if (req.image.mimetype() != null && req.image.mimetype() != "") {
					res.set('Content-Type', req.image.mimetype());
				} else {
					res.set('Content-Type', 'image/jpeg');
				}
				res.status(200).end(img, 'binary');
			}
		};

		req.image.collection().loadUser(success, fail);
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
	 */
	deleteImage(req : any, res : any) {

		var fail = function(error) {
			res.status(500).send({ 'error': error });
		};

		var successRemoveImage = function() {
			var extension = '';
			if(req.image.extension() != null && req.image.extension() != '') {
				extension = '.' + req.image.extension();
			}

			var originImageFile = CMSConfig.getUploadDir() + "users/" + req.user.hashid() + "/images/" + req.image.collection().hashid() + "/" + req.image.hashid() + extension;
			var tmpImageFile = CMSConfig.getUploadDir() + "deletetmp/users_" + req.user.hashid() + "_images_" + req.image.collection().hashid() + "_" + req.image.hashid() + extension;

			fs.rename(originImageFile, tmpImageFile, function(err) {
				if(err) {
					res.status(500).send({ 'error': "Error during deleting Image." });
				} else {
					var success = function(deleteImageId) {
						fs.unlink(tmpImageFile, function(err2) {
							res.json(deleteImageId);
						});
					};

					var fail = function(error) {
						fs.rename(tmpImageFile, originImageFile , function(err) {
							res.status(500).send({ 'error': error });
						});
					};

					req.image.delete(success, fail);
				}
			});
		};

		req.imagesCollection.removeImage(req.image, successRemoveImage, fail);
	}
}