/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../model/User.ts" />

var express : any = require("express");

/**
 * Router Interface
 *
 * @class RouterItf
 */
class RouterItf {

	/**
	 * Router property.
	 *
	 * @property router
	 * @type any
	 */
	router : any;

	/**
	 * Constructor.
	 */
	constructor() {
		this.router = express.Router();

		// middleware specific to this router
		/*this.router.use(function timeLog(req, res, next) {
			console.log('Time: ', Date.now());
			next();
		});*/

		this.buildRouter();
	}

	/**
	 * Return router.
	 *
	 * @method getRouter
	 */
	getRouter() {
		return this.router;
	}

	/**
	 * Method called during Router creation.
	 *
	 * @method buildRouter
	 */
	buildRouter() {
		Logger.warn("RouterItf - buildRouter : Method need to be implemented.");
	}

	/**
	 * Method called to check authorization in headers.
	 *
	 * @method checkAuthorization
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 * @param {Function} successCallback - The callback function when success.
	 */
	checkAuthorization(req : any, res : any, successCallback : Function) {
		if(req.method != 'OPTIONS') {
			if(typeof(req.headers.authorization) == "undefined" || req.headers.authorization == "" || req.headers.authorization == null) {
				res.status(401).send({ 'error': 'Unauthorized.' });
			} else {
				var auth = req.headers.authorization;

				var success = function(user) {
					req.user = user;
					successCallback(req, res);
				};

				var fail = function(error) {
					res.status(401).send({ 'error': 'Unauthorized.' });
				};

				User.findOneByAuthKey(auth, success, fail);
			}
		} else {
			successCallback(req, res);
		}
	}
}