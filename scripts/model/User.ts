/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/ModelItf.ts" />

/// <reference path="../core/Helper.ts" />
/// <reference path="../exceptions/ModelException.ts" />

/// <reference path="./Team.ts" />
/// <reference path="./ImagesCollection.ts" />
/// <reference path="./NewsCollection.ts" />
/// <reference path="./VideosCollection.ts" />

var UserSchema : any = db["Users"];

/**
 * Model : User
 *
 * @class User
 * @extends ModelItf
 */
class User extends ModelItf {

	/**
	 * Username property.
	 *
	 * @property _username
	 * @type string
	 */
	private _username : string;

	/**
	 * Email property.
	 *
	 * @property _email
	 * @type string
	 */
	private _email : string;

	/**
	 * Authorization key property.
	 *
	 * @property _authkey
	 * @type string
	 */
	private _authkey : string;

	/**
	 * 'IsAdmin' status property.
	 *
	 * @property _isAdmin
	 * @type boolean
	 */
	private _isAdmin : boolean;

	/**
	 * Teams property.
	 *
	 * @property _teams
	 * @type Array<Team>
	 */
	private _teams : Array<Team>;

	/**
	 * Lazy loading for _teams property.
	 *
	 * @property _teams_loaded
	 * @type boolean
	 */
	private _teams_loaded : boolean;


	/**
	 * Constructor.
	 *
	 * @constructor
	 * @param {string} hashid - The User's hashid.
	 * @param {string} username - The User's username.
	 * @param {string} email - The User's email.
	 * @param {string} authkey - The User's authkey.
	 * @param {boolean} isAdmin - The User's 'isAdmin' status.
	 * @param {number} id - The User's id.
	 * @param {string} createdAt - The User's createdAt.
	 * @param {string} updatedAt - The User's updatedAt.
	 */
	constructor(hashid : string = "", username : string = "", email : string = "", authkey : string = "", isAdmin : boolean = false, id : number = null, createdAt : string = null, updatedAt : string = null) {
		super(id, createdAt, updatedAt);

		this.setHashid(hashid);
		this.setUsername(username);
		this.setEmail(email);
		this.setAuthKey(authkey);
		this.setIsAdmin(isAdmin);

		this._teams = null;
		this._teams_loaded = false;
	}

	/**
	 * Set the User's username.
	 *
	 * @method setUsername
	 * @param {string} username - New Username
	 */
	setUsername(username : string) {
		this._username = username;
	}

	/**
	 * Return the User's username.
	 *
	 * @method username
	 */
	username() {
		return this._username;
	}

	/**
	 * Set the User's email.
	 *
	 * @method setEmail
	 * @param {string} email - New Email
	 */
	setEmail(email : string) {
		this._email = email;
	}

	/**
	 * Return the User's email.
	 *
	 * @method email
	 */
	email() {
		return this._email;
	}

	/**
	 * Set the User's authorization Key.
	 *
	 * @method setAuthKey
	 * @param {string} authkey - New Authorization Key
	 */
	setAuthKey(authkey : string) {
		this._authkey = authkey;
	}

	/**
	 * Return the User's authorization Key.
	 *
	 * @method authKey
	 */
	authKey() {
		return this._authkey;
	}

	/**
	 * Set the User's isAdmin status.
	 *
	 * @method setIsAdmin
	 * @param {boolean} isAdmin - New isAdmin status
	 */
	setIsAdmin(isAdmin : boolean) {
		this._isAdmin = isAdmin;
	}

	/**
	 * Return the User's isAdmin status.
	 *
	 * @method isAdmin
	 */
	isAdmin() {
		return this._isAdmin;
	}

	/**
	 * Return the User's Teams.
	 *
	 * @method teams
	 */
	teams() {
		return this._teams;
	}

	/**
	 * Load the User's Teams.
	 *
	 * @method loadTeams
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	loadTeams(successCallback : Function, failCallback : Function) {
		if(! this._teams_loaded) {
			var self = this;

			this.getSequelizeModel().getTeams()
				.then(function(teams) {
					var allTeams : Array<Team> = new Array<Team>();

					if(teams.length > 0) {

						teams.forEach(function (team : any) {
							var tObject = Team.fromJSONObject(team.dataValues);
							tObject.setSequelizeModel(team, function () {
								allTeams.push(tObject);
								if (allTeams.length == teams.length) {
									self._teams_loaded = true;
									self._teams = allTeams;
									successCallback();
								}
							}, function (error) {
								failCallback(error);
							}, false);
						});

					} else {
						self._teams_loaded = true;
						self._teams = allTeams;
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
			if(self._teams_loaded) {
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

		this.loadTeams(success, fail);
	}

	/**
	 * Return a User instance as a JSON Object
	 *
	 * @method toJSONObject
	 * @param {boolean} complete - flag to obtain complete description of Model
	 * @returns {JSONObject} a JSON Object representing the instance
	 */
	toJSONObject(complete : boolean = false) : any {
		var data = super.toJSONObject();

		var newData = {
			"id" : this.hashid(),
			"username": this.username(),
			"email": this.email(),
			"isAdmin": this.isAdmin()
		};

		if(complete) {
			var completeData = {
				"authkey": this.authKey()
			};

			newData = Helper.mergeObjects(newData, completeData);

			if (this._teams_loaded) {
				newData["teams"] = (this.teams() !== null) ? this.serializeArray(this.teams()) : null;
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

			var newUserJSON = this.toJSONObject(true);
			newUserJSON["hashid"] = this.hashid();
			delete(newUserJSON["id"]);
			delete(newUserJSON["createdAt"]);
			delete(newUserJSON["updatedAt"]);

			UserSchema.create(newUserJSON)
				.then(function (user) {
					var uObject = User.fromJSONObject(user.dataValues);
					self._id = uObject.getId();

					self.setSequelizeModel(user, function() {
						successCallback(self);
					}, function(error) {
						failCallback(error);
					}, false);
				})
				.catch(function (error) {
					failCallback(error);
				});
		} else {
			failCallback(new ModelException("User already exists."));
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
		UserSchema.findById(id)
			.then(function(user) {
				if(user != null) {
					var uObject = User.fromJSONObject(user.dataValues);
					uObject.setSequelizeModel(user, function() {
						successCallback(uObject);
					}, function(error) {
						failCallback(error);
					}, false);
				} else {
					failCallback(new ModelException("User with given Id was not found."));
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

			var newUserJSON = self.toJSONObject(true);
			newUserJSON["hashid"] = this.hashid();
			delete(newUserJSON["id"]);
			delete(newUserJSON["createdAt"]);
			delete(newUserJSON["updatedAt"]);

			self.getSequelizeModel().updateAttributes(newUserJSON)
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
			failCallback(new ModelException("You need to create User before to update it."));
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
			var deleteFromDB = function() {
				self.getSequelizeModel().destroy()
					.then(function () {
						var destroyId = self.hashid();
						self._id = null;
						self._hashid = null;

						successCallback({"id": destroyId});
					})
					.catch(function (error) {
						failCallback(error);
					});
			};

			var successLoadAssociations = function() {
				if(self.teams().length > 0) {
					var nbTeams = 0;

					var successRemoveTeam = function() {
						nbTeams++;
						if(nbTeams == self.teams().length) {
							deleteFromDB();
						}
					};

					self.teams().forEach(function(team) {
						self.removeTeam(team, successRemoveTeam, failCallback);
					});

				} else {
					deleteFromDB();
				}
			};

			self.loadAssociations(successLoadAssociations, failCallback);
		} else {
			failCallback(new ModelException("You need to create the User before to delete it..."));
		}
	}

	/**
	 * Add a Team to User.
	 *
	 * @method addTeam
	 * @param {Team} team - Team to add to user.
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	addTeam(team : Team, successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {

			if(team.getId() != null) {
				self.getSequelizeModel().addTeam(team.getSequelizeModel())
					.then(function () {
						if(self._teams == null) {
							self._teams = new Array<Team>();
						}

						self._teams.push(team);
						successCallback(self);
					})
					.catch(function (error) {
						failCallback(error);
					});
			} else {
				failCallback(new ModelException("You need to create the Team before to add to User."));
			}
		} else {
			failCallback(new ModelException("You need to create User before to add a Team."));
		}
	}

	/**
	 * Remove a Team from User.
	 *
	 * @method removeTeam
	 * @param {Team} team - Team to add to user.
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	removeTeam(team : Team, successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {

			if(team.getId() != null) {

				if(self._teams == null) {
					failCallback(new ModelException("Team doesn't belong to this User."));
				} else {
					var teamToDelete = null;

					self._teams = self._teams.filter(function(obj) {
						var comp = obj.getId() != team.getId();
						if(!comp) {
							teamToDelete = obj;
						}

						return comp;
					});

					if(teamToDelete == null) {
						failCallback(new ModelException("Team doesn't belong to this User."));
					} else {
						self.getSequelizeModel().removeTeam(team.getSequelizeModel())
							.then(function () {
								successCallback(self);
							})
							.catch(function (error) {
								self._teams.push(teamToDelete);
								failCallback(error);
							});
					}
				}
			} else {
				failCallback(new ModelException("Team doesn't exist. You can't remove a Team that doesn't exist from a User."));
			}
		} else {
			failCallback(new ModelException("User doesn't exist. User must to exist before to remove something from it."));
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
		UserSchema.all()
			.then(function(users) {
				var allUsers : Array<User> = new Array<User>();

				if(users.length > 0) {
					users.forEach(function (user:any) {
						var uObject = User.fromJSONObject(user.dataValues);
						uObject.setSequelizeModel(user, function () {
							allUsers.push(uObject);
							if (allUsers.length == users.length) {
								successCallback(allUsers);
							}
						}, function (error) {
							failCallback(error);
						}, false);
					});
				} else {
					successCallback(allUsers);
				}
			})
			.catch(function(e) {
				failCallback(e);
			});
	}

	/**
	 * Find One User by hashid.
	 *
	 * @method findOneByHashid
	 * @param {string} hashid - The User's hashid
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	static findOneByHashid(hashid : string, successCallback : Function, failCallback : Function) {
		UserSchema.findOne({ where: {"hashid": hashid} })
			.then(function(user) {
				if(user != null) {
					var uObject = User.fromJSONObject(user.dataValues);
					uObject.setSequelizeModel(user, function() {
						successCallback(uObject);
					}, function(error) {
						failCallback(error);
					}, false);
				} else {
					failCallback(new ModelException("User with given Hashid was not found."));
				}
			})
			.catch(function(e) {
				failCallback(e);
			});
	}

	/**
	 * Find One User by username.
	 *
	 * @method findOneByUsername
	 * @param {string} username - The User's username
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	static findOneByUsername(username : string, successCallback : Function, failCallback : Function) {
		UserSchema.findOne({ where: {"username": username} })
			.then(function(user) {

				if(user != null) {
					var uObject = User.fromJSONObject(user.dataValues);
					uObject.setSequelizeModel(user, function() {
						successCallback(uObject);
					}, function(error) {
						failCallback(error);
					}, false);
				} else {
					failCallback(new ModelException("User with given Username was not found."));
				}
			})
			.catch(function(e) {
				failCallback(e);
			});
	}

	/**
	 * Find One User by email.
	 *
	 * @method findOneByEmail
	 * @param {string} email - The User's email
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	static findOneByEmail(email : string, successCallback : Function, failCallback : Function) {
		UserSchema.findOne({ where: {"email": email} })
			.then(function(user) {
				if(user != null) {
					var uObject = User.fromJSONObject(user.dataValues);
					uObject.setSequelizeModel(user, function() {
						successCallback(uObject);
					}, function(error) {
						failCallback(error);
					}, false);
				} else {
					failCallback(new ModelException("User with given Email was not found."));
				}
			})
			.catch(function(e) {
				failCallback(e);
			});
	}

	/**
	 * Find One User by Authorization Key.
	 *
	 * @method findOneByAuthKey
	 * @param {string} authKey - The User's Authorization Key
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	static findOneByAuthKey(authKey : string, successCallback : Function, failCallback : Function) {
		UserSchema.findOne({ where: {"authkey": authKey} })
			.then(function(user) {
				if(user != null) {
					var uObject = User.fromJSONObject(user.dataValues);
					uObject.setSequelizeModel(user, function() {
						successCallback(uObject);
					}, function(error) {
						failCallback(error);
					}, false);
				} else {
					failCallback(new ModelException("User with given Authorization Key was not found."));
				}
			})
			.catch(function(e) {
				failCallback(e);
			});
	}

	/**
	 * Return a User instance from a JSON Object.
	 *
	 * @method fromJSONObject
	 * @static
	 * @param {JSONObject} jsonObject - The JSON Object
	 * @return {SDI} The model instance.
	 */
	static fromJSONObject(jsonObject : any) : User {
		var user = new User(jsonObject.hashid, jsonObject.username, jsonObject.email, jsonObject.authkey, jsonObject.isAdmin, jsonObject.id, jsonObject.createdAt, jsonObject.updatedAt);

		return user;
	}
}