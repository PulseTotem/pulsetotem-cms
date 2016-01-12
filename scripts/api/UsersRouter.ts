/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/RouterItf.ts" />

/// <reference path="../core/CMSConfig.ts" />
/// <reference path="../model/User.ts" />

var uuid : any = require('node-uuid');

/**
 * UsersRouter class.
 *
 * @class UsersRouter
 * @extends RouterItf
 */
class UsersRouter extends RouterItf {

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

		this.router.post('/', function(req, res) {
			self.checkAuthorization(req, res, function(req2, res2) {
				self.newUser(req2, res2);
			});
		});
	}

	/**
	 * Add a new User.
	 *
	 * @method newUser
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	newUser(req : any, res : any) {
		if(typeof(req.user) == "undefined") {
			res.status(401).send({ 'error': 'Unauthorized.' });
		} else {
			//TODO: Check if user is an Admin then add the user

			if(typeof(req.body.username) == "undefined" || req.body.username == "" || typeof(req.body.email) == "undefined" || req.body.email == "") {
				res.status(500).send({ 'error': 'Missing some information to create new User.' });
			} else {
				var authKey = uuid.v1();
				var newUser = new User(req.body.username, req.body.email, authKey);

				var successCreate = function(user) {
					res.json(user.toJSONObject());
				};

				var failCreate = function(error) {
					res.status(500).send({ 'error': JSON.stringify(error) });
				};

				newUser.create(successCreate, failCreate);
			}
		}
	}
}