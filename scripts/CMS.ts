/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="./core/Server.ts" />
/// <reference path="./core/CMSConfig.ts" />
/// <reference path="./api/UsersRouter.ts" />

declare var require : any;

//////////////// BEGIN: MANAGE COLORS LIB FOR LOGGER ///////////////////

var colors : any;

try {
	colors = require('colors');
} catch(e) {
	var returnFunc = function (str) {
		return str;
	};

	String.prototype["green"] = returnFunc;
	String.prototype["blue"] = returnFunc;
	String.prototype["orange"] = returnFunc;
	String.prototype["red"] = returnFunc;
}

//////////////// END:   MANAGE COLORS LIB FOR LOGGER ///////////////////

/**
 * Represents CMS.
 *
 * @class CMS
 * @extends Server
 */
class CMS extends Server {

	/**
	 * Constructor.
	 *
	 * @param {number} listeningPort - Server's listening port..
	 * @param {Array<string>} arguments - Server's command line arguments.
	 * @param {string} uploadDir - Upload directory path.
	 */
	constructor(listeningPort : number, arguments : Array<string>, uploadDir : string) {
		super(listeningPort, arguments, uploadDir);
	}

	/**
	 * Method called when database is ready.
	 *
	 * @method databaseReady
	 */
	databaseReady() {
		this.buildAPI();

		this.run();
	}

	/**
	 * Method to build backend's API.
	 *
	 * @method buildAPI
	 */
	buildAPI() {
		this.app.use("/users", (new UsersRouter()).getRouter());
	}
}

/**
 * Server's CMS listening port.
 *
 * @property _CMSListeningPort
 * @type number
 * @private
 */
var _CMSListeningPort : number = process.env.PORT || 8000;

/**
 * Server's CMS command line arguments.
 *
 * @property _CMSArguments
 * @type Array<string>
 * @private
 */
var _CMSArguments : Array<string> = process.argv;

var serverInstance = new CMS(_CMSListeningPort, _CMSArguments, CMSConfig.getUploadDir());