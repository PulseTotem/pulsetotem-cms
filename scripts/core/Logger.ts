/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="./LoggerLevel.ts" />

var fs : any = require('fs');
var winston : any = require('winston');
var winston_amqp : any = require('winston-amqp');
var path : any = require('path');
var amqp : any = require('amqp');

/**
 * Represents a logger with a coloration option.
 *
 * @class Logger
 */
class Logger {
	/**
	 * From.
	 *
	 * @property from
	 * @type string
	 * @static
	 * @default true
	 */
	static from : string = null;

	/**
	 * Version.
	 *
	 * @property version
	 * @type string
	 * @static
	 * @default true
	 */
	static version : string = null;

	/**
	 * Status of color mode.
	 *
	 * @property color
	 * @type boolean
	 * @static
	 * @default true
	 */
	static color : boolean = true;

	/**
	 * Level status of the logger.
	 *
	 * @property level
	 * @type LoggerLevel
	 * @static
	 * @default Error
	 */
	static level : LoggerLevel = LoggerLevel.Error;

	/**
	 * Winston Logger.
	 *
	 * @property logger
	 * @type any (Winston Logger)
	 * @static
	 * @default null
	 */
	static logger : any = null;

	/**
	 * Return an instance of Winston Logger.
	 *
	 * @method getLogger
	 * @static
	 */
	static getLogger() {
		if(Logger.logger == null) {
			Logger.buildLogger();
		}

		return Logger.logger;
	}

	/**
	 * Build Winston Logger instance.
	 *
	 * @method buildLogger
	 * @static
	 */
	static buildLogger() {
		Logger.logger = new winston.Logger({
			exitOnError: false
		});

		Logger.manageConsoleTransport();
		Logger.manageAMQPTransport();
	}

	/**
	 * Manage Console transport for Winston Logger instance.
	 *
	 * @method manageConsoleTransport
	 * @static
	 */
	static manageConsoleTransport() {
		var options : any = {
			handleExceptions: true,
			prettyPrint: true,
			timestamp : true
		};

		options["colorize"] = Logger.color;

		switch(Logger.level) {
			case LoggerLevel.Error :
				options["level"] = 'error';
				break;
			case LoggerLevel.Warning :
				options["level"] = 'warn';
				break;
			case LoggerLevel.Info :
				options["level"] = 'info';
				break;
			case LoggerLevel.Verbose :
				options["level"] = 'verbose';
				break;
			case LoggerLevel.Debug :
				options["level"] = 'debug';
				break;
			default :
				options["level"] = 'info';
		}

		if(Logger.logger.transports.length > 0) {
			if(typeof(Logger.logger.transports["console"]) != "undefined") {
				Logger.logger.remove(winston.transports.Console);
			}
		}

		Logger.logger.add(winston.transports.Console, options);
	}

	/**
	 * Manage AMQP transport for Winston Logger instance.
	 *
	 * @method manageAMQPTransport
	 * @static
	 */
	static manageAMQPTransport() {
		if(Logger.logger.transports.length > 0) {
			if(typeof(Logger.logger.transports["amqp"]) != "undefined") {
				Logger.logger.remove('amqp');
			}
		}

		var connectionSuccess : boolean = false;

		var connection : any = amqp.createConnection({
			host: 'localhost',
			port: 5672,
			vhost: '/',
			login: 'guest',
			password: 'guest'
		}, {
			reconnect: false
		});

		connection.on('error', function(err){
			connection.end();

			if(!connectionSuccess) {
				console.log("Logger AMQP Transport can't be added.")
			}
		});

		connection.on('ready', function () {
			connectionSuccess = true;
			connection.end();

			var options : any = {
				level: 'debug'
			};

			Logger.logger.add(winston_amqp.AMQP, options);
		});
	}

	/**
	 * Change the color status.
	 *
	 * @method useColor
	 * @static
	 * @param {boolean} status - The new status.
	 */
	static useColor(status : boolean) {
		Logger.color = status;
		Logger.buildLogger();
	}

	/**
	 * Change the level of the logger.
	 *
	 * @method setLevel
	 * @static
	 * @param level
	 */
	static setLevel(level : LoggerLevel) {
		Logger.level = level;
		Logger.buildLogger();
	}

	/**
	 * Retrieve information about running service.
	 *
	 * @method retrieveFromVersionInformation
	 * @static
	 */
	static retrieveFromVersionInformation() {
		try {
			var stats = fs.statSync(__dirname + '/package.json');
			var packageJson : any = require(__dirname + '/package.json');
			Logger.from = packageJson.name;
			Logger.version = packageJson.version;
		}
		catch(err) {
			Logger.from = "Unknown service";
			Logger.version = "Unknown version";
		}
	}

	/**
	 * Complete metadata in params with some info like method, line etc... where log was done.
	 *
	 * @method completeMetadata
	 * @static
	 * @param {any} metadata - Metadata to complete
	 * @param {boolean} withStack - Boolean to choose to add stack or not.
	 */
	static completeMetadata(metadata : any = {}, withStack : boolean = false) {
		if(Logger.from == null || Logger.version == null) {
			Logger.retrieveFromVersionInformation();
		}

		// https://github.com/baryon/tracer/blob/master/lib/console.js
		var stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i;
		var stackReg2 = /at\s+()(.*):(\d*):(\d*)/i;

		var err : any = new Error();
		var stack = err.stack;
		var stacksplit = stack.split('\n');
		var stacklist = stacksplit.slice(3);

		var data : any = {
			"from" : Logger.from,
			"version" : Logger.version
		};

		var s = stacklist[0];

		var sp = stackReg.exec(s) || stackReg2.exec(s);

		if (sp && sp.length === 5) {
			data.method = sp[1];
			data.path = sp[2];
			data.line = sp[3];
			data.pos = sp[4];

			if(withStack) {
				data.stack = stacklist.join('\n');
			}
		}

		metadata.logDetails = data;

		return metadata;
	}

	/**
	 * Log message as Debug Level.
	 *
	 * @method debug
	 * @static
	 * @param {string} msg - The message to log.
	 * @param {any} metadata - Metadata added to message
	 */
	static debug(msg : any, metadata : any = {}) {
		Logger.getLogger().debug(msg, Logger.completeMetadata(metadata));
	}

	/**
	 * Log message as Verbose Level.
	 *
	 * @method verbose
	 * @static
	 * @param {string} msg - The message to log.
	 * @param {any} metadata - Metadata added to message
	 */
	static verbose(msg : any, metadata : any = {}) {
		Logger.getLogger().verbose(msg, Logger.completeMetadata(metadata));
	}

	/**
	 * Log message as Info Level.
	 *
	 * @method info
	 * @static
	 * @param {string} msg - The message to log.
	 * @param {any} metadata - Metadata added to message
	 */
	static info(msg : any, metadata : any = {}) {
		Logger.getLogger().info(msg, Logger.completeMetadata(metadata));
	}

	/**
	 * Log message as Warn Level.
	 *
	 * @method warn
	 * @static
	 * @param {string} msg - The message to log.
	 * @param {any} metadata - Metadata added to message
	 */
	static warn(msg : any, metadata : any = {}) {
		Logger.getLogger().warn(msg, Logger.completeMetadata(metadata));
	}

	/**
	 * Log message as Error Level.
	 *
	 * @method error
	 * @static
	 * @param {string} msg - The message to log.
	 * @param {any} metadata - Metadata added to message
	 */
	static error(msg : any, metadata : any = {}) {
		Logger.getLogger().error(msg, Logger.completeMetadata(metadata, true));
	}

}