/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/RouterItf.ts" />
/// <reference path="../auth/CMSAuth.ts" />

/// <reference path="../model/Image.ts" />

/// <reference path="./ImagesRouter.ts" />

declare var require : any;

var fs : any = require("fs");

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

			Image.read(id, success, fail);
		});

		// Define '/' route.
		this.router.get('/', CMSAuth.can('manage user images collections'), function(req, res) { self.listAllImagesOfCollection(req, res); });
		this.router.post('/', CMSAuth.can('manage user images collections'), function(req, res) { self.newImage(req, res); });

		// Define '/:image_id' route.
		this.router.get('/:image_id', CMSAuth.can('manage user images'), function(req, res) { self.showImage(req, res); });
		this.router.get('/:image_id/raw', CMSAuth.can('manage user images'), function(req, res) { self.rawImage(req, res); });
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
		var images_JSON = req.imagesCollection.toJSON()["images"];

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
		if(typeof(req.body.name) == "undefined" || typeof(req.body.description) == "undefined" || typeof(req.files.file) == "undefined") {
			res.status(500).send({ 'error': 'Missing some information to create new Image.' });
		} else {
			var hashid = uuid.v1();

			var imageName = req.body.name;
			if(imageName == "") {
				imageName = hashid;
			}

			var newImage = new Image(hashid, imageName, req.body.description);

			var fail = function(error) {
				res.status(500).send({ 'error': JSON.stringify(error) });
			};

			var success = function(image : Image) {

				var successImagesCollectionLink = function() {

					var originImageFile = CMSConfig.getUploadDir() + req.files.file.name;
					var destImageFile = CMSConfig.getUploadDir() + "users/" + req.user.hashid() + "/images/" + req.imagesCollection.hashid() + "/" + hashid;

					fs.rename(originImageFile, destImageFile , function(err) {
						if(err) {
							res.status(500).send({ 'error': "Error during adding Image to ImagesCollection." });
						} else {
							res.json(image.toJSONObject());
						}
					});
				};

				req.imagesCollection.addImage(image, successImagesCollectionLink, fail);
			};

			newImage.create(success, fail);
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
		var imagePath = CMSConfig.getUploadDir() + "users/" + req.user.hashid() + "/images/" + req.image.collection().hashid() + "/" + req.image.hashid();

		var img = fs.readFileSync(imagePath);
		res.set('Content-Type', 'image/jpeg');
		res.status(200).end(img, 'binary');
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
				res.status(500).send({ 'error': JSON.stringify(error) });
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

		var originImageFile = CMSConfig.getUploadDir() + "users/" + req.user.hashid() + "/images/" + req.image.collection().hashid() + "/" + req.image.hashid();
		var tmpImageFile = CMSConfig.getUploadDir() + "deletetmp/users_" + req.user.hashid() + "_images_" + req.image.collection().hashid() + "_" + req.image.hashid();

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
						res.status(500).send({ 'error': JSON.stringify(error) });
					});
				};

				req.image.delete(success, fail);
			}
		});
	}
}