/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/ModelItf.ts" />

/// <reference path="../core/Helper.ts" />
/// <reference path="../exceptions/ModelException.ts" />

/// <reference path="./ImagesCollection.ts" />


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

		this._imagesCollections = null;
		this._imagesCollections_loaded = false;
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
	 * Return the User's ImagesCollections.
	 *
	 * @method imagesCollections
	 */
	imagesCollections() {
		return this._imagesCollections;
	}

	/**
	 * Load the User's ImagesCollections.
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
							var uObject = ImagesCollection.fromJSONObject(imagesCollection.dataValues);
							uObject.setSequelizeModel(imagesCollection, function () {
								allImagesCollections.push(uObject);
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
			if(self._imagesCollections_loaded) {
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

		this.loadImagesCollections(success, fail);
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

			if (this._imagesCollections_loaded) {
				newData["imagesCollections"] = (this.imagesCollections() !== null) ? this.serializeArray(this.imagesCollections()) : null;
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
			self.getSequelizeModel().destroy()
				.then(function () {
					var destroyId = self.getId();
					self._id = null;

					successCallback({"id" : destroyId});
				})
				.catch(function (error) {
					failCallback(error);
				});
		} else {
			failCallback(new ModelException("You need to create User before to delete it..."));
		}
	}

	/**
	 * Add an ImagesCollection to User.
	 *
	 * @method addImagesCollection
	 * @param {ImagesCollection} imagesCollection - ImagesCollection to add to user.
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
				failCallback(new ModelException("You need to create the ImagesCollection before to add to User."));
			}
		} else {
			failCallback(new ModelException("You need to create User before to add an ImagesCollection."));
		}
	}

	/**
	 * Remove an ImagesCollection from User.
	 *
	 * @method removeImagesCollection
	 * @param {ImagesCollection} imagesCollection - ImagesCollection to add to user.
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	removeImagesCollection(imagesCollection : ImagesCollection, successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {

			if(imagesCollection.getId() != null) {

				if(self._imagesCollections == null) {
					failCallback(new ModelException("ImagesCollection doesn't belong to this User."));
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
						failCallback(new ModelException("ImagesCollection doesn't belong to this User."));
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
				failCallback(new ModelException("ImagesCollection doesn't exist. You can't remove an ImagesCollection that doesn't exist from a User."));
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

				users.forEach(function(user : any) {
					var uObject = User.fromJSONObject(user.dataValues);
					uObject.setSequelizeModel(user, function() {
						allUsers.push(uObject);
						if(allUsers.length == users.length) {
							successCallback(allUsers);
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