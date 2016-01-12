/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/ModelItf.ts" />

/// <reference path="../core/Helper.ts" />
/// <reference path="../core/CMSConfig.ts" />
/// <reference path="../exceptions/ModelException.ts" />

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
	 * Constructor.
	 *
	 * @constructor
	 * @param {string} username - The User's username.
	 * @param {string} email - The User's email.
	 * @param {string} authkey - The User's authkey.
	 * @param {boolean} isAdmin - The User's 'isAdmin' status.
	 * @param {string} createdAt - The User's createdAt.
	 * @param {string} updatedAt - The User's updatedAt.
	 */
	constructor(username : string = "", email : string = "", authkey : string = "", isAdmin : boolean = false, id : number = null, createdAt : string = null, updatedAt : string = null) {
		super(id, createdAt, updatedAt);

		this.setUsername(username);
		this.setEmail(email);
		this.setAuthKey(authkey);
		this.setIsAdmin(isAdmin);
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

	//////////////////// Methods managing model. ///////////////////////////

	/**
	 * Return a User instance as a JSON Object
	 *
	 * @method toJSONObject
	 * @returns {Object} a JSON Object representing the instance
	 */
	toJSONObject() : Object {
		var data = super.toJSONObject();

		var newData = {
			"username": this.username(),
			"email": this.email(),
			"authkey": this.authKey(),
			"isAdmin": this.isAdmin()
		};

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

			var newUserJSON = this.toJSONObject();
			delete(newUserJSON["id"]);
			delete(newUserJSON["createdAt"]);
			delete(newUserJSON["updatedAt"]);

			UserSchema.create(newUserJSON)
				.then(function (user) {
					var uObject = User.fromJSONObject(user.dataValues);
					self._id = uObject.getId();

					self.setSequelizeModel(user);
					
					successCallback(self);
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
					uObject.setSequelizeModel(user);
					successCallback(uObject);
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

			var newUserJSON = self.toJSONObject();
			delete(newUserJSON["id"]);
			delete(newUserJSON["createdAt"]);
			delete(newUserJSON["updatedAt"]);

			self.getSequelizeModel().updateAttributes(newUserJSON)
				.then(function () {

					self.getSequelizeModel().save()
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
					uObject.setSequelizeModel(user);
					allUsers.push(uObject);
				});

				successCallback(allUsers);
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
					uObject.setSequelizeModel(user);
					successCallback(uObject);
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
					uObject.setSequelizeModel(user);
					successCallback(uObject);
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
					uObject.setSequelizeModel(user);
					successCallback(uObject);
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
	 * @param {JSONObject} json - The JSON Object
	 * @return {SDI} The model instance.
	 */
	static fromJSONObject(jsonObject : any) : User {
		var user = new User(jsonObject.username, jsonObject.email, jsonObject.authkey, jsonObject.isAdmin, jsonObject.id, jsonObject.createdAt, jsonObject.updatedAt);

		return user;
	}
}