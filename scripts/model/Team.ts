/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/ModelItf.ts" />

/// <reference path="../core/Helper.ts" />
/// <reference path="../exceptions/ModelException.ts" />

/// <reference path="./User.ts" />
/// <reference path="./ImagesCollection.ts" />
/// <reference path="./NewsCollection.ts" />
/// <reference path="./VideosCollection.ts" />


var TeamSchema : any = db["Teams"];

/**
 * Model : Team
 *
 * @class Team
 * @extends ModelItf
 */
class Team extends ModelItf {

	/**
	 * Name property.
	 *
	 * @property _name
	 * @type string
	 */
	private _name : string;

	/**
	 * Users property.
	 *
	 * @property _users
	 * @type Array<User>
	 */
	private _users : Array<User>;

	/**
	 * Lazy loading for _users property.
	 *
	 * @property _users_loaded
	 * @type boolean
	 */
	private _users_loaded : boolean;

	/**
	 * ImagesCollections property.
	 *
	 * @property _imagesCollections
	 * @type Array<ImagesCollection>
	 */
	private _imagesCollections : Array<ImagesCollection>;

	/**
	 * Lazy loading for _imagesCollections property.
	 *
	 * @property _imagesCollections_loaded
	 * @type boolean
	 */
	private _imagesCollections_loaded : boolean;

	/**
	 * NewsCollections property.
	 *
	 * @property _newsCollections
	 * @type Array<NewsCollection>
	 */
	private _newsCollections : Array<NewsCollection>;

	/**
	 * Lazy loading for _newsCollections property.
	 *
	 * @property _newsCollections_loaded
	 * @type boolean
	 */
	private _newsCollections_loaded : boolean;

	/**
	 * VideosCollections property.
	 *
	 * @property _videosCollections
	 * @type Array<VideosCollection>
	 */
	private _videosCollections : Array<VideosCollection>;

	/**
	 * Lazy loading for _videosCollections property.
	 *
	 * @property _videosCollections_loaded
	 * @type boolean
	 */
	private _videosCollections_loaded : boolean;


	/**
	 * Constructor.
	 *
	 * @constructor
	 * @param {string} hashid - The Team's hashid.
	 * @param {string} name - The Team's name.
	 * @param {number} id - The Team's id.
	 * @param {string} createdAt - The Team's createdAt.
	 * @param {string} updatedAt - The Team's updatedAt.
	 */
	constructor(hashid : string = "", name : string = "", id : number = null, createdAt : string = null, updatedAt : string = null) {
		super(id, createdAt, updatedAt);

		this.setHashid(hashid);
		this.setName(name);

		this._users = null;
		this._users_loaded = false;

		this._imagesCollections = null;
		this._imagesCollections_loaded = false;

		this._newsCollections = null;
		this._newsCollections_loaded = false;

		this._videosCollections = null;
		this._videosCollections_loaded = false;
	}

	/**
	 * Set the Team's name.
	 *
	 * @method setName
	 * @param {string} name - New Name
	 */
	setName(name : string) {
		this._name = name;
	}

	/**
	 * Return the Team's name.
	 *
	 * @method name
	 */
	name() {
		return this._name;
	}

	/**
	 * Return the Team's Users.
	 *
	 * @method users
	 */
	users() {
		return this._users;
	}

	/**
	 * Load the Team's Users.
	 *
	 * @method loadUsers
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	loadUsers(successCallback : Function, failCallback : Function) {
		if(! this._users_loaded) {
			var self = this;

			this.getSequelizeModel().getUsers()
				.then(function(users) {

					var allUsers : Array<User> = new Array<User>();

					if(users.length > 0) {

						users.forEach(function(user : any) {
							var uObject = User.fromJSONObject(user.dataValues);
							uObject.setSequelizeModel(user, function () {
								allUsers.push(uObject);
								if (allUsers.length == users.length) {
									self._users_loaded = true;
									self._users = allUsers;
									successCallback();
								}
							}, function (error) {
								failCallback(error);
							}, false);
						});

					} else {
						self._users_loaded = true;
						self._users = allUsers;
						successCallback();
					}
				})
				.catch(function(error) {
					failCallback(error);
				});
		} else {
			successCallback();
		}
	}

	/**
	 * Return the Team's ImagesCollections.
	 *
	 * @method imagesCollections
	 */
	imagesCollections() {
		return this._imagesCollections;
	}

	/**
	 * Load the Team's ImagesCollections.
	 *
	 * @method loadImagesCollections
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	loadImagesCollections(successCallback : Function, failCallback : Function) {
		if(! this._imagesCollections_loaded) {
			var self = this;

			this.getSequelizeModel().getImagesCollections()
				.then(function(imagesCollections) {

					var allImagesCollections : Array<ImagesCollection> = new Array<ImagesCollection>();

					if(imagesCollections.length > 0) {

						imagesCollections.forEach(function (imagesCollection : any) {
							var icObject = ImagesCollection.fromJSONObject(imagesCollection.dataValues);
							icObject.setSequelizeModel(imagesCollection, function () {
								allImagesCollections.push(icObject);
								if (allImagesCollections.length == imagesCollections.length) {
									self._imagesCollections_loaded = true;
									self._imagesCollections = allImagesCollections;
									successCallback();
								}
							}, function (error) {
								failCallback(error);
							}, false);
						});

					} else {
						self._imagesCollections_loaded = true;
						self._imagesCollections = allImagesCollections;
						successCallback();
					}
				})
				.catch(function(error) {
					failCallback(error);
				});
		} else {
			successCallback();
		}
	}

	/**
	 * Return the Team's NewsCollections.
	 *
	 * @method newsCollections
	 */
	newsCollections() {
		return this._newsCollections;
	}

	/**
	 * Load the Team's NewsCollections.
	 *
	 * @method loadNewsCollections
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	loadNewsCollections(successCallback : Function, failCallback : Function) {
		if(! this._newsCollections_loaded) {
			var self = this;

			this.getSequelizeModel().getNewsCollections()
				.then(function(newsCollections) {

					var allNewsCollections : Array<NewsCollection> = new Array<NewsCollection>();

					if(newsCollections.length > 0) {

						newsCollections.forEach(function(newsCollection : any) {
							var ncObject = NewsCollection.fromJSONObject(newsCollection.dataValues);
							ncObject.setSequelizeModel(newsCollection, function () {
								allNewsCollections.push(ncObject);
								if (allNewsCollections.length == newsCollections.length) {
									self._newsCollections_loaded = true;
									self._newsCollections = allNewsCollections;
									successCallback();
								}
							}, function (error) {
								failCallback(error);
							}, false);
						});

					} else {
						self._newsCollections_loaded = true;
						self._newsCollections = allNewsCollections;
						successCallback();
					}
				})
				.catch(function(error) {
					failCallback(error);
				});
		} else {
			successCallback();
		}
	}

	/**
	 * Return the Team's VideosCollections.
	 *
	 * @method videosCollections
	 */
	videosCollections() {
		return this._videosCollections;
	}

	/**
	 * Load the Team's VideosCollections.
	 *
	 * @method loadVideosCollections
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	loadVideosCollections(successCallback : Function, failCallback : Function) {
		if(! this._videosCollections_loaded) {
			var self = this;

			this.getSequelizeModel().getVideosCollections()
				.then(function(videosCollections) {

					var allVideosCollections : Array<VideosCollection> = new Array<VideosCollection>();

					if(videosCollections.length > 0) {

						videosCollections.forEach(function (videosCollection : any) {
							var vcObject = VideosCollection.fromJSONObject(videosCollection.dataValues);
							vcObject.setSequelizeModel(videosCollection, function () {
								allVideosCollections.push(vcObject);
								if (allVideosCollections.length == videosCollections.length) {
									self._videosCollections_loaded = true;
									self._videosCollections = allVideosCollections;
									successCallback();
								}
							}, function (error) {
								failCallback(error);
							}, false);
						});

					} else {
						self._videosCollections_loaded = true;
						self._videosCollections = allVideosCollections;
						successCallback();
					}
				})
				.catch(function(error) {
					failCallback(error);
				});
		} else {
			successCallback();
		}
	}

	//////////////////// Methods managing model. ///////////////////////////

	/**
	 * Load model associations.
	 *
	 * @method loadAssociations
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	loadAssociations(successCallback : Function, failCallback : Function) {
		var self = this;

		var success : Function = function(models) {
			if(self._users_loaded) {
			//if(self._imagesCollections_loaded && self._newsCollections_loaded && self._videosCollections_loaded) {
				if (successCallback != null) {
					successCallback();
				} // else //Nothing to do ?
			}
		};

		var fail : Function = function(error) {
			if(failCallback != null) {
				failCallback(error);
			} else {
				Logger.error(JSON.stringify(error));
			}
		};

		this.loadUsers(success, fail);

		/*this.loadImagesCollections(success, fail);
		this.loadNewsCollections(success, fail);
		this.loadVideosCollections(success, fail);*/
	}

	/**
	 * Return a Team instance as a JSON Object
	 *
	 * @method toJSONObject
	 * @param {boolean} complete - flag to obtain complete description of Model
	 * @returns {JSONObject} a JSON Object representing the instance
	 */
	toJSONObject(complete : boolean = false) : any {
		var data = super.toJSONObject();

		var newData = {
			"id" : this.hashid(),
			"name": this.name()
		};

		if(complete) {
			if (this._users_loaded) {
				newData["users"] = (this.users() !== null) ? this.serializeArray(this.users()) : null;
			}

			if (this._imagesCollections_loaded) {
				newData["imagesCollections"] = (this.imagesCollections() !== null) ? this.serializeArray(this.imagesCollections()) : null;
			}

			if (this._newsCollections_loaded) {
				newData["newsCollections"] = (this.newsCollections() !== null) ? this.serializeArray(this.newsCollections()) : null;
			}

			if (this._videosCollections_loaded) {
				newData["videosCollections"] = (this.videosCollections() !== null) ? this.serializeArray(this.videosCollections()) : null;
			}
		}

		return Helper.mergeObjects(data, newData);
	}

	/**
	 * Create model in database.
	 *
	 * @method create
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	create(successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() == null) {

			var newTeamJSON = this.toJSONObject(true);
			newTeamJSON["hashid"] = this.hashid();
			delete(newTeamJSON["id"]);
			delete(newTeamJSON["createdAt"]);
			delete(newTeamJSON["updatedAt"]);

			TeamSchema.create(newTeamJSON)
				.then(function (team) {
					var tObject = Team.fromJSONObject(team.dataValues);
					self._id = tObject.getId();

					self.setSequelizeModel(team, function() {
						successCallback(self);
					}, function(error) {
						failCallback(error);
					}, false);
				})
				.catch(function (error) {
					failCallback(error);
				});
		} else {
			failCallback(new ModelException("Team already exists."));
		}
	}

	/**
	 * Retrieve model description from database and create model instance.
	 *
	 * @method read
	 * @static
	 * @param {number} id - The model instance's id.
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	static read(id : number, successCallback : Function, failCallback : Function) {
		// search for known ids
		TeamSchema.findById(id)
			.then(function(team) {
				if(team != null) {
					var tObject = Team.fromJSONObject(team.dataValues);
					tObject.setSequelizeModel(team, function() {
						successCallback(tObject);
					}, function(error) {
						failCallback(error);
					}, false);
				} else {
					failCallback(new ModelException("Team with given Id was not found."));
				}
			})
			.catch(function(error) {
				failCallback(error);
			});
	}

	/**
	 * Update in database the model with current id.
	 *
	 * @method update
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	update(successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {

			var newTeamJSON = self.toJSONObject(true);
			newTeamJSON["hashid"] = this.hashid();
			delete(newTeamJSON["id"]);
			delete(newTeamJSON["createdAt"]);
			delete(newTeamJSON["updatedAt"]);

			self.getSequelizeModel().updateAttributes(newTeamJSON)
				.then(function (sequelizeInstance) {
					if(sequelizeInstance.getDataValue("updatedAt") == "now()") {
						self.setUpdatedAt(moment().format());
					} else {
						self.setUpdatedAt(sequelizeInstance.getDataValue("updatedAt"));
					}
					successCallback(self);
				})
				.catch(function (error) {
					failCallback(error);
				});
		} else {
			failCallback(new ModelException("You need to create Team before to update it."));
		}
	}

	/**
	 * Delete in database the model with current id.
	 *
	 * @method delete
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	delete(successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {
			self.getSequelizeModel().destroy()
				.then(function () {
					var destroyId = self.hashid();
					self._id = null;
					self._hashid = null;

					successCallback({"id" : destroyId});
				})
				.catch(function (error) {
					failCallback(error);
				});
		} else {
			failCallback(new ModelException("You need to create Team before to delete it..."));
		}
	}

	/**
	 * Add a User to Team.
	 *
	 * @method addUser
	 * @param {User} user - User to add to team.
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	addUser(user : User, successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {

			if(user.getId() != null) {
				self.getSequelizeModel().addUser(user.getSequelizeModel())
					.then(function () {
						if(self._users == null) {
							self._users = new Array<User>();
						}

						self._users.push(user);
						successCallback(self);
					})
					.catch(function (error) {
						failCallback(error);
					});
			} else {
				failCallback(new ModelException("You need to create the User before to add to Team."));
			}
		} else {
			failCallback(new ModelException("You need to create Team before to add a User."));
		}
	}

	/**
	 * Remove a User from Team.
	 *
	 * @method removeUser
	 * @param {User} user - User to add to team.
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	removeUser(user : User, successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {

			if(user.getId() != null) {

				if(self._users == null) {
					failCallback(new ModelException("User doesn't belong to this Team."));
				} else {
					var userToDelete = null;

					self._users = self._users.filter(function(obj) {
						var comp = obj.getId() != user.getId();
						if(!comp) {
							userToDelete = obj;
						}

						return comp;
					});

					if(userToDelete == null) {
						failCallback(new ModelException("User doesn't belong to this Team."));
					} else {
						self.getSequelizeModel().removeUser(user.getSequelizeModel())
							.then(function () {
								successCallback(self);
							})
							.catch(function (error) {
								self._users.push(userToDelete);
								failCallback(error);
							});
					}
				}
			} else {
				failCallback(new ModelException("User doesn't exist. You can't remove a User that doesn't exist from a Team."));
			}
		} else {
			failCallback(new ModelException("Team doesn't exist. Team must to exist before to remove something from it."));
		}
	}

	/**
	 * Add an ImagesCollection to Team.
	 *
	 * @method addImagesCollection
	 * @param {ImagesCollection} imagesCollection - ImagesCollection to add to team.
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	addImagesCollection(imagesCollection : ImagesCollection, successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {

			if(imagesCollection.getId() != null) {
				self.getSequelizeModel().addImagesCollection(imagesCollection.getSequelizeModel())
					.then(function () {
						if(self._imagesCollections == null) {
							self._imagesCollections = new Array<ImagesCollection>();
						}

						self._imagesCollections.push(imagesCollection);
						successCallback(self);
					})
					.catch(function (error) {
						failCallback(error);
					});
			} else {
				failCallback(new ModelException("You need to create the ImagesCollection before to add to Team."));
			}
		} else {
			failCallback(new ModelException("You need to create Team before to add an ImagesCollection."));
		}
	}

	/**
	 * Remove an ImagesCollection from Team.
	 *
	 * @method removeImagesCollection
	 * @param {ImagesCollection} imagesCollection - ImagesCollection to add to team.
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	removeImagesCollection(imagesCollection : ImagesCollection, successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {

			if(imagesCollection.getId() != null) {

				if(self._imagesCollections == null) {
					failCallback(new ModelException("ImagesCollection doesn't belong to this Team."));
				} else {
					var imagesCollectionToDelete = null;

					self._imagesCollections = self._imagesCollections.filter(function(obj) {
						var comp = obj.getId() != imagesCollection.getId();
						if(!comp) {
							imagesCollectionToDelete = obj;
						}

						return comp;
					});

					if(imagesCollectionToDelete == null) {
						failCallback(new ModelException("ImagesCollection doesn't belong to this Team."));
					} else {
						self.getSequelizeModel().removeImagesCollection(imagesCollection.getSequelizeModel())
							.then(function () {
								successCallback(self);
							})
							.catch(function (error) {
								self._imagesCollections.push(imagesCollectionToDelete);
								failCallback(error);
							});
					}
				}
			} else {
				failCallback(new ModelException("ImagesCollection doesn't exist. You can't remove an ImagesCollection that doesn't exist from a Team."));
			}
		} else {
			failCallback(new ModelException("Team doesn't exist. Team must to exist before to remove something from it."));
		}
	}

	/**
	 * Add an NewsCollection to Team.
	 *
	 * @method addNewsCollection
	 * @param {NewsCollection} newsCollection - NewsCollection to add to team.
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	addNewsCollection(newsCollection : NewsCollection, successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {

			if(newsCollection.getId() != null) {
				self.getSequelizeModel().addNewsCollection(newsCollection.getSequelizeModel())
					.then(function () {
						if(self._newsCollections == null) {
							self._newsCollections = new Array<NewsCollection>();
						}

						self._newsCollections.push(newsCollection);
						successCallback(self);
					})
					.catch(function (error) {
						failCallback(error);
					});
			} else {
				failCallback(new ModelException("You need to create the NewsCollection before to add to Team."));
			}
		} else {
			failCallback(new ModelException("You need to create Team before to add an NewsCollection."));
		}
	}

	/**
	 * Remove an NewsCollection from Team.
	 *
	 * @method removeNewsCollection
	 * @param {NewsCollection} newsCollection - NewsCollection to add to team.
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	removeNewsCollection(newsCollection : NewsCollection, successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {

			if(newsCollection.getId() != null) {

				if(self._newsCollections == null) {
					failCallback(new ModelException("NewsCollection doesn't belong to this Team."));
				} else {
					var newsCollectionToDelete = null;

					self._newsCollections = self._newsCollections.filter(function(obj) {
						var comp = obj.getId() != newsCollection.getId();
						if(!comp) {
							newsCollectionToDelete = obj;
						}

						return comp;
					});

					if(newsCollectionToDelete == null) {
						failCallback(new ModelException("NewsCollection doesn't belong to this Team."));
					} else {
						self.getSequelizeModel().removeNewsCollection(newsCollection.getSequelizeModel())
							.then(function () {
								successCallback(self);
							})
							.catch(function (error) {
								self._newsCollections.push(newsCollectionToDelete);
								failCallback(error);
							});
					}
				}
			} else {
				failCallback(new ModelException("NewsCollection doesn't exist. You can't remove an NewsCollection that doesn't exist from a Team."));
			}
		} else {
			failCallback(new ModelException("Team doesn't exist. Team must to exist before to remove something from it."));
		}
	}

	/**
	 * Add an VideosCollection to Team.
	 *
	 * @method addVideosCollection
	 * @param {VideosCollection} videosCollection - VideosCollection to add to team.
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	addVideosCollection(videosCollection : VideosCollection, successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {

			if(videosCollection.getId() != null) {
				self.getSequelizeModel().addVideosCollection(videosCollection.getSequelizeModel())
					.then(function () {
						if(self._videosCollections == null) {
							self._videosCollections = new Array<VideosCollection>();
						}

						self._videosCollections.push(videosCollection);
						successCallback(self);
					})
					.catch(function (error) {
						failCallback(error);
					});
			} else {
				failCallback(new ModelException("You need to create the VideosCollection before to add to Team."));
			}
		} else {
			failCallback(new ModelException("You need to create Team before to add an VideosCollection."));
		}
	}

	/**
	 * Remove an VideosCollection from Team.
	 *
	 * @method removeVideosCollection
	 * @param {VideosCollection} videosCollection - VideosCollection to add to team.
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	removeVideosCollection(videosCollection : VideosCollection, successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {

			if(videosCollection.getId() != null) {

				if(self._videosCollections == null) {
					failCallback(new ModelException("VideosCollection doesn't belong to this Team."));
				} else {
					var videosCollectionToDelete = null;

					self._videosCollections = self._videosCollections.filter(function(obj) {
						var comp = obj.getId() != videosCollection.getId();
						if(!comp) {
							videosCollectionToDelete = obj;
						}

						return comp;
					});

					if(videosCollectionToDelete == null) {
						failCallback(new ModelException("VideosCollection doesn't belong to this Team."));
					} else {
						self.getSequelizeModel().removeVideosCollection(videosCollection.getSequelizeModel())
							.then(function () {
								successCallback(self);
							})
							.catch(function (error) {
								self._videosCollections.push(videosCollectionToDelete);
								failCallback(error);
							});
					}
				}
			} else {
				failCallback(new ModelException("VideosCollection doesn't exist. You can't remove an VideosCollection that doesn't exist from a Team."));
			}
		} else {
			failCallback(new ModelException("Team doesn't exist. Team must to exist before to remove something from it."));
		}
	}

	/**
	 * Retrieve all models from database and create corresponding model instances.
	 *
	 * @method all
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	static all(successCallback : Function, failCallback : Function) {
		TeamSchema.all()
			.then(function(teams) {
				var allTeams : Array<Team> = new Array<Team>();

				teams.forEach(function(team : any) {
					var tObject = Team.fromJSONObject(team.dataValues);
					tObject.setSequelizeModel(team, function() {
						allTeams.push(tObject);
						if(allTeams.length == teams.length) {
							successCallback(allTeams);
						}
					}, function(error) {
						failCallback(error);
					}, false);

				});
			})
			.catch(function(e) {
				failCallback(e);
			});
	}

	/**
	 * Find One Team by hashid.
	 *
	 * @method findOneByHashid
	 * @param {string} hashid - The Team's hashid
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	static findOneByHashid(hashid : string, successCallback : Function, failCallback : Function) {
		TeamSchema.findOne({ where: {"hashid": hashid} })
			.then(function(team) {
				if(team != null) {
					var tObject = Team.fromJSONObject(team.dataValues);
					tObject.setSequelizeModel(team, function() {
						successCallback(tObject);
					}, function(error) {
						failCallback(error);
					}, false);
				} else {
					failCallback(new ModelException("Team with given Hashid was not found."));
				}
			})
			.catch(function(e) {
				failCallback(e);
			});
	}

	/**
	 * Find One Team by name.
	 *
	 * @method findOneByName
	 * @param {string} name - The Team's name
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	static findOneByName(name : string, successCallback : Function, failCallback : Function) {
		TeamSchema.findOne({ where: {"name": name} })
			.then(function(team) {

				if(team != null) {
					var tObject = Team.fromJSONObject(team.dataValues);
					tObject.setSequelizeModel(team, function() {
						successCallback(tObject);
					}, function(error) {
						failCallback(error);
					}, false);
				} else {
					failCallback(new ModelException("Team with given Name was not found."));
				}
			})
			.catch(function(e) {
				failCallback(e);
			});
	}

	/**
	 * Return a Team instance from a JSON Object.
	 *
	 * @method fromJSONObject
	 * @static
	 * @param {JSONObject} jsonObject - The JSON Object
	 * @return {SDI} The model instance.
	 */
	static fromJSONObject(jsonObject : any) : Team {
		var team = new Team(jsonObject.hashid, jsonObject.name, jsonObject.id, jsonObject.createdAt, jsonObject.updatedAt);

		return team;
	}
}