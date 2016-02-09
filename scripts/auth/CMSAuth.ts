/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/AuthManager.ts" />

/// <reference path="../core/AuthManager.ts" />

/**
 * CMSAuth class.
 *
 * @class CMSAuth
 * @extends AuthManager
 */
class CMSAuth extends AuthManager {

	/**
	 * Init CMS AuthManager.
	 *
	 * @method init
	 * @static
	 */
	static init(){
		CMSAuth.initRoles();
		CMSAuth.initActions();
	}

	/**
	 * Init Roles.
	 *
	 * @method initRoles
	 * @static
	 */
	static initRoles(){
		var self = this;

		this.addRole("Authenticated", function(req, res, done) {
			if(typeof(req.headers.authorization) == "undefined" || req.headers.authorization == "" || req.headers.authorization == null) {
				done(new Error('No authorization headers.'));
			} else {
				var auth = req.headers.authorization;

				var success = function(user) {
					req.authUser = user;
					done();
				};

				var fail = function(error) {
					done(new Error('Unauthorized.'));
				};

				User.findOneByAuthKey(auth, success, fail);
			}
		});

		this.addRole("Admin", function(req, res, done) {
			self.can("perform action needing authentication")(req, res, function(error) {
				if (typeof(error) == "undefined" || error == null) { // All is ok.
					if(req.authUser.isAdmin()) {
						done();
					} else {
						done(new Error("Authenticated User's access level is too low."));
					}
				} else { // An error occured.
					done(error);
				}
			});
		});

		this.addRole("Profil.Owner", function(req, res, done) {
			self.can("perform action needing authentication")(req, res, function(error) {
				if (typeof(error) == "undefined" || error == null) { // All is ok.
					if(!req.user) {
						done(new Error('User was not found.'));
					} else {
						if(req.authUser.getId() == req.user.getId()) {
							done();
						} else {
							done(new Error('Unauthorized.'));
						}
					}
				} else { // An error occured.
					done(error);
				}
			});
		});

		this.addRole("ImagesCollection.Owner", function(req, res, done) {
			self.can("manage user information")(req, res, function(error) {
				if (typeof(error) == "undefined" || error == null) { // All is ok.
					if(!req.imagesCollection) {
						done(new Error('ImagesCollection was not found.'));
					} else {
						if(req.user.getId() == req.imagesCollection.user().getId()) {
							done();
						} else {
							done(new Error('Unauthorized.'));
						}
					}
				} else { // An error occured.
					done(error);
				}
			});
		});

		this.addRole("Image.Owner", function(req, res, done) {
			self.can("manage user images collections")(req, res, function(error) {
				if (typeof(error) == "undefined" || error == null) { // All is ok.
					if(!req.image) {
						done(new Error('Image was not found.'));
					} else {
						if(req.user.getId() == req.imagesCollection.user().getId() == req.image.) {
							done();
						} else {
							done(new Error('Unauthorized.'));
						}
					}
				} else { // An error occured.
					done(error);
				}
			});
		});
	}

	/**
	 * Init Actions.
	 *
	 * @method initActions
	 * @static
	 */
	static initActions(){
		this.addAction("perform action needing authentication", "Authenticated");
		this.addAction("perform admin action", "Admin");
		this.addAction("manage user information", ["Admin", "Profil.Owner"]);
		this.addAction("manage user images collections", ["Admin", "ImagesCollection.Owner"]);
		this.addAction("manage user images", ["Admin", "Image.Owner"]);
	}
}