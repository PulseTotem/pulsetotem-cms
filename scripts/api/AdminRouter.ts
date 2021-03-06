/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/RouterItf.ts" />
/// <reference path="../auth/CMSAuth.ts" />

/// <reference path="./ImagesCollectionsRouter.ts" />
/// <reference path="./NewsCollectionsRouter.ts" />
/// <reference path="./VideosCollectionsRouter.ts" />

declare var require : any;

var fs : any = require("fs");
var mkdirp : any = require('mkdirp');
var rmdir : any = require('rmdir');

var uuid : any = require('node-uuid');

/**
 * AdminRouter class.
 *
 * @class AdminRouter
 * @extends RouterItf
 */
class AdminRouter extends RouterItf {

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

		this.router.use(CMSAuth.can('perform admin action'));

		// Define '/images_collections' route.
		this.router.use('/images_collections', (new ImagesCollectionsRouter()).getRouter());

		// Define '/news_collections' route.
		this.router.use('/news_collections', (new NewsCollectionsRouter()).getRouter());

		// Define '/videos_collections' route.
		this.router.use('/videos_collections', (new VideosCollectionsRouter()).getRouter());
	}
}