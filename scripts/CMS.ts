/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="./core/Server.ts" />
/// <reference path="./core/CMSConfig.ts" />
/// <reference path="./auth/CMSAuth.ts" />

/// <reference path="./api/TeamsRouter.ts" />
/// <reference path="./api/UsersRouter.ts" />
/// <reference path="./api/ImagesRouter.ts" />
/// <reference path="./api/NewsRouter.ts" />
/// <reference path="./api/VideosRouter.ts" />
/// <reference path="./api/AdminRouter.ts" />


declare var require : any;

var fs : any = require("fs");
var mkdirp : any = require('mkdirp');

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
		CMSAuth.init();

		this.checkOrCreateUploadsDir();

		this.buildAPI();

		this.run();
	}

	/**
	 * Method to check or create Uploads Dir architecture.
	 *
	 * @method checkOrCreateUploadsDir
	 */
	checkOrCreateUploadsDir() {
		fs.stat(CMSConfig.getUploadDir(), function(err, stats) {
			if(err) {
				mkdirp(CMSConfig.getUploadDir(), function(err2) {
					if(err2) {
						throw new Error(err2);
					}
				});
			} else {
				if(! stats.isDirectory()) {
					mkdirp(CMSConfig.getUploadDir(), function(err2) {
						if(err2) {
							throw new Error(err2);
						}
					});
				}
			}
		});

		fs.stat(CMSConfig.getUploadDir() + "deletetmp/", function(err, stats) {
			if(err) {
				mkdirp(CMSConfig.getUploadDir() + "deletetmp/", function(err2) {
					if(err2) {
						throw new Error(err2);
					}
				});
			} else {
				if(! stats.isDirectory()) {
					mkdirp(CMSConfig.getUploadDir() + "deletetmp/", function(err2) {
						if(err2) {
							throw new Error(err2);
						}
					});
				}
			}
		});

		fs.stat(CMSConfig.getUploadDir() + "teams/", function(err, stats) {
			if(err) {
				mkdirp(CMSConfig.getUploadDir() + "teams/", function(err2) {
					if(err2) {
						throw new Error(err2);
					}
				});
			} else {
				if(! stats.isDirectory()) {
					mkdirp(CMSConfig.getUploadDir() + "teams/", function(err2) {
						if(err2) {
							throw new Error(err2);
						}
					});
				}
			}
		});

		fs.stat(CMSConfig.getUploadDir() + "deletetmp/teams/", function(err, stats) {
			if(err) {
				mkdirp(CMSConfig.getUploadDir() + "deletetmp/teams/", function(err2) {
					if(err2) {
						throw new Error(err2);
					}
				});
			} else {
				if(! stats.isDirectory()) {
					mkdirp(CMSConfig.getUploadDir() + "deletetmp/teams/", function(err2) {
						if(err2) {
							throw new Error(err2);
						}
					});
				}
			}
		});

		fs.stat(CMSConfig.getUploadDir() + "users/", function(err, stats) {
			if(err) {
				mkdirp(CMSConfig.getUploadDir() + "users/", function(err2) {
					if(err2) {
						throw new Error(err2);
					}
				});
			} else {
				if(! stats.isDirectory()) {
					mkdirp(CMSConfig.getUploadDir() + "users/", function(err2) {
						if(err2) {
							throw new Error(err2);
						}
					});
				}
			}
		});

		fs.stat(CMSConfig.getUploadDir() + "deletetmp/users/", function(err, stats) {
			if(err) {
				mkdirp(CMSConfig.getUploadDir() + "deletetmp/users/", function(err2) {
					if(err2) {
						throw new Error(err2);
					}
				});
			} else {
				if(! stats.isDirectory()) {
					mkdirp(CMSConfig.getUploadDir() + "deletetmp/users/", function(err2) {
						if(err2) {
							throw new Error(err2);
						}
					});
				}
			}
		});
	}

	/**
	 * Method to build backend's API.
	 *
	 * @method buildAPI
	 */
	buildAPI() {
		this.app.use(CMSConfig.getBaseUrl() + "teams", (new TeamsRouter()).getRouter());
		this.app.use(CMSConfig.getBaseUrl() + "users", (new UsersRouter()).getRouter());
		this.app.use(CMSConfig.getBaseUrl() + "images", (new ImagesRouter()).getRouter());
		this.app.use(CMSConfig.getBaseUrl() + "news", (new NewsRouter()).getRouter());
		this.app.use(CMSConfig.getBaseUrl() + "videos", (new VideosRouter()).getRouter());

		this.app.use(CMSConfig.getBaseUrl() + "admin", (new AdminRouter()).getRouter());
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