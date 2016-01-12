/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/RouterItf.ts" />

/// <reference path="../core/CMSConfig.ts" />
/// <reference path="../model/Media.ts" />

/**
 * MediasRouter class.
 *
 * @class MediasRouter
 * @extends RouterItf
 */
class MediasRouter extends RouterItf {

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

		this.router.param('medianame', function(req, res, next, medianame) {
			var success = function(media) {
				req.media = media;
				next();
			};

			var fail = function(err) {
				res.status(500).send({ 'error': 'Media with name "' + medianame + '" doesn\'t exist.' });
			};

			Media.findOneByName(medianame, success, fail);
		});

		//Get Media
		this.router.get('/:medianame', function(req, res) { self.getMedia(req, res); });

		//New Media
		this.router.post('/', function(req, res) {
			self.checkAuthorization(req, res, function(req2, res2) {
				self.newMedia(req2, res2);
			});
		});
	}

	/**
	 * Return Media.
	 *
	 * @method getMedia
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	getMedia(req : any, res : any) {
		//res.attachment(CMSConfig.getUploadDir() + req.media.path());

		//res.end();

		var img = fs.readFileSync(CMSConfig.getUploadDir() + req.media.path());
		res.set('Content-Type', 'image/jpeg');
		res.status(200).end(img, 'binary');
	}

	/**
	 * Manage New Media.
	 *
	 * @method newMedia
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	newMedia(req : any, res : any) {
		/* //For multiple uploaded files.
		if(req.files.length > 0) {
			var mediasDesc = [];

			req.files.forEach(function(file : any) {

				var fileName = file.name;

				var newMedia : Media = new Media(fileName, fileName);

				var successCreate = function(mediaObj) {
					mediasDesc.push(mediaObj.toJSONObject());

					if(mediasDesc.length == req.files.length) {
						res.json(mediasDesc);
					}
				};

				var failCreate = function(error) {
					mediasDesc.push({
						"file" : fileName,
						"error" : JSON.stringify(error)
					});

					if(mediasDesc.length == req.files.length) {
						res.json(mediasDesc);
					}
				};

				newMedia.create(successCreate, failCreate);
			});
		} else {
			res.status(500).send({ 'error': 'Missing some file information.' });
		}*/

		if(typeof(req.files.file) == "undefined" || typeof(req.files.file.name) == "undefined") {
			res.status(500).send({ 'error': 'Missing some file information.' });
		} else {
			var fileName = req.files.file.name;

			var newMedia : Media = new Media(fileName, fileName);

			var successCreate = function(mediaObj) {
					var respJson = {
						"id" : mediaObj.name()
					};

					res.json(respJson);
			};

			var failCreate = function(error) {
				res.status(500).send({ 'error': JSON.stringify(error) });
			};

			newMedia.create(successCreate, failCreate);
		}
	}
}