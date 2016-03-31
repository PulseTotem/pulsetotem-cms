/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="./Logger.ts" />
/// <reference path="./LoggerLevel.ts" />

declare var require : any;
declare var process : any;

var http : any = require("http");
var express : any = require("express");
var bodyParser : any = require("body-parser");
var multer : any = require('multer');

var db : any = require('./database/models/index.js');
var moment : any = require('moment');

/**
 * Represents a Server managing Namespaces.
 *
 * @class Server
 */
class Server {

	/**
	 * Server's listening port.
	 *
	 * @property listeningPort
	 * @type number
	 */
	listeningPort : number;

	/**
	 * Server's app.
	 *
	 * @property app
	 * @type any
	 */
	app : any;

	/**
	 * Server's http server.
	 *
	 * @property httpServer
	 * @type any
	 */
	httpServer : any;

	/**
	 * Constructor.
	 *
	 * @param {number} listeningPort - Listening port.
	 * @param {Array<string>} arguments - Command line arguments.
	 * @param {string} uploadDir - Upload directory path.
	 */
	constructor(listeningPort : number, arguments : Array<string>, uploadDir : string = "uploads/") {
		this.listeningPort = listeningPort;

		this._argumentsProcess(arguments);

		this._buildServer(uploadDir);

		this._buildDatabase();
	}

	/**
	 * Build database.
	 *
	 * @method _buildDatabase
	 * @private
	 */
	private _buildDatabase() {
		var self = this;

		// Link to database and listen
		db.sequelize
			.sync()
			.then(function() {
				self.databaseReady();
			});
	}

	/**
	 * Method called when database is ready.
	 *
	 * @method databaseReady
	 */
	databaseReady() {

	}

	/**
	 * Build server.
	 *
	 * @method _buildServer
	 * @param {string} uploadDir - Upload directory path.
	 * @private
	 */
	private _buildServer(uploadDir : string) {
		this.app = express();
		this.app.use(bodyParser.json({limit: '50mb'})); // for parsing application/json
		this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // for parsing application/x-www-form-urlencoded
		this.app.use(multer({ dest: uploadDir })); // for parsing multipart/form-data

		this.app.use(function(req, res, next) {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
			res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
			next();
		});


		this.httpServer = http.createServer(this.app);

		this.app.get('/', function(req, res){
			res.send('<h1>Are you lost ? * &lt;--- You are here !</h1>');
		});
	}

	/**
	 * Process command line arguments.
	 *
	 * @method _argumentsProcess
	 * @private
	 * @param {Array<string>} arguments - Command line arguments.
	 */
	private _argumentsProcess(arguments : Array<string>) {
		var logLevel = LoggerLevel.Error;

		if(process.argv.length > 2) {
			var param = process.argv[2];
			var keyVal = param.split("=");
			if(keyVal.length > 1) {
				if (keyVal[0] == "loglevel") {
					switch(keyVal[1]) {
						case "error" :
							logLevel = LoggerLevel.Error;
							break;
						case "warning" :
							logLevel = LoggerLevel.Warning;
							break;
						case "info" :
							logLevel = LoggerLevel.Info;
							break;
						case "debug" :
							logLevel = LoggerLevel.Debug;
							break;
						default :
							logLevel = LoggerLevel.Error;
					}
				}
			}
		}

		Logger.setLevel(logLevel);

		this.onArgumentsProcess(arguments);
	}

	/**
	 * Runs the Server.
	 *
	 * @method run
	 */
	run() {
		var self = this;

		//Define errorHandler function.
		this.app.use(function(err, req, res, next) {
			if (res.headersSent) {
				return next(err);
			}
			Logger.debug("Server - Error : ");
			Logger.debug(err);
			res.status(500).send({ 'error': err.message });
		});

		this.httpServer.listen(this.listeningPort, function() {
			self.onListen();
		});
	}

	/**
	 * Method called after arguments process.
	 *
	 * @method onArgumentsProcess
	 * @param {Array<string>} arguments - Command line arguments.
	 */
	onArgumentsProcess(arguments : Array<string>) {
		//Nothing to do.
	}

	/**
	 * Method called on server listen action.
	 *
	 * @method onListen
	 */
	onListen() {
		Logger.info("Server listening on *:" + this.listeningPort);
	}
}