/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/AuthManager.ts" />

/// <reference path="../model/Team.ts" />
/// <reference path="../model/User.ts" />

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

		this.addRole("Team.In", function(req, res, done) {
			self.can("perform action needing authentication")(req, res, function(error) {
				if (typeof(error) == "undefined" || error == null) { // All is ok.
					if(!req.team) {
						done(new Error('Team was not found.'));
					} else {
						var isIn : boolean = false;

						req.authUser.teams().forEach(function(team : Team) {
							if(req.team.getId() == team.getId()) {
								isIn = true;
							}
						});

						if(isIn) {
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
			self.can("manage team information")(req, res, function(error) {
				if (typeof(error) == "undefined" || error == null) { // All is ok.
					if(!req.imagesCollection) {
						done(new Error('ImagesCollection was not found.'));
					} else {
						done();
					}
				} else { // An error occured.
					done(error);
				}
			});
		});

		this.addRole("Image.Owner", function(req, res, done) {
			self.can("manage user information")(req, res, function(error) {
				if (typeof(error) == "undefined" || error == null) { // All is ok.
					if(!req.image) {
						done(new Error('Image was not found.'));
					} else {

						var successLoadUser = function() {
							if(req.user.getId() == req.image.collection().user().getId()) {

								if(!req.imagesCollection) {
									done();
								} else {
									if(req.imagesCollection.getId() == req.image.collection().getId()) {
										done();
									} else {
										done(new Error('Image doesn\'t belong to this ImagesCollection.'));
									}
								}
							} else {
								done(new Error('Unauthorized.'));
							}
						};

						var fail = function() {
							done(new Error('Unauthorized.'));
						};

						req.image.collection().loadUser(successLoadUser, fail);
					}
				} else { // An error occured.
					done(error);
				}
			});
		});

		this.addRole("NewsCollection.Owner", function(req, res, done) {
			self.can("manage team information")(req, res, function(error) {
				if (typeof(error) == "undefined" || error == null) { // All is ok.
					if(!req.newsCollection) {
						done(new Error('NewsCollection was not found.'));
					} else {
						done();
					}
				} else { // An error occured.
					done(error);
				}
			});
		});

		this.addRole("News.Owner", function(req, res, done) {
			self.can("manage user information")(req, res, function(error) {
				if (typeof(error) == "undefined" || error == null) { // All is ok.
					if(!req.news) {
						done(new Error('News was not found.'));
					} else {

						var successLoadUser = function() {
							if(req.user.getId() == req.news.collection().user().getId()) {

								if(!req.newsCollection) {
									done();
								} else {
									if(req.newsCollection.getId() == req.news.collection().getId()) {
										done();
									} else {
										done(new Error('News doesn\'t belong to this NewsCollection.'));
									}
								}
							} else {
								done(new Error('Unauthorized.'));
							}
						};

						var fail = function() {
							done(new Error('Unauthorized.'));
						};

						req.news.collection().loadUser(successLoadUser, fail);
					}
				} else { // An error occured.
					done(error);
				}
			});
		});

		this.addRole("VideosCollection.Owner", function(req, res, done) {
			self.can("manage team information")(req, res, function(error) {
				if (typeof(error) == "undefined" || error == null) { // All is ok.
					if(!req.videosCollection) {
						done(new Error('VideosCollection was not found.'));
					} else {
						done();
					}
				} else { // An error occured.
					done(error);
				}
			});
		});

		this.addRole("Video.Owner", function(req, res, done) {
			self.can("manage user information")(req, res, function(error) {
				if (typeof(error) == "undefined" || error == null) { // All is ok.
					if(!req.video) {
						done(new Error('Video was not found.'));
					} else {

						var successLoadUser = function() {
							if(req.user.getId() == req.video.collection().user().getId()) {

								if(!req.videosCollection) {
									done();
								} else {
									if(req.videosCollection.getId() == req.video.collection().getId()) {
										done();
									} else {
										done(new Error('Video doesn\'t belong to this VideosCollection.'));
									}
								}
							} else {
								done(new Error('Unauthorized.'));
							}
						};

						var fail = function() {
							done(new Error('Unauthorized.'));
						};

						req.video.collection().loadUser(successLoadUser, fail);
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
		this.addAction("manage team information", ["Admin", "Team.In"]);
		this.addAction("manage user information", ["Admin", "Profil.Owner"]);
		this.addAction("manage team images collections", ["Admin", "ImagesCollection.Owner"]);
		this.addAction("manage user images", ["Admin", "Image.Owner"]);
		this.addAction("manage team news collections", ["Admin", "NewsCollection.Owner"]);
		this.addAction("manage user news", ["Admin", "News.Owner"]);
		this.addAction("manage team videos collections", ["Admin", "VideosCollection.Owner"]);
		this.addAction("manage user videos", ["Admin", "Videos.Owner"]);
	}
}