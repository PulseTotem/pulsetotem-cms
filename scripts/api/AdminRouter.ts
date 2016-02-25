/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/RouterItf.ts" />
/// <reference path="../auth/CMSAuth.ts" />

/// <reference path="./ImagesCollectionsRouter.ts" />

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

		// Define '/images_collections' route.
		this.router.use('/images_collections', CMSAuth.can('perform admin action'), (new ImagesCollectionsRouter()).getRouter());
	}
}