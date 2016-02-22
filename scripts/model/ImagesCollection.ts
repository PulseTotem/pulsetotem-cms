/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/ModelItf.ts" />

/// <reference path="../core/Helper.ts" />
/// <reference path="../exceptions/ModelException.ts" />

/// <reference path="./ImageObject.ts" />

var ImagesCollectionSchema : any = db["ImagesCollections"];

/**
 * Model : ImagesCollection
 *
 * @class ImagesCollection
 * @extends ModelItf
 */
class ImagesCollection extends ModelItf {

	/**
	 * Name property.
	 *
	 * @property _name
	 * @type string
	 */
	private _name : string;

	/**
	 * Description property.
	 *
	 * @property _description
	 * @type string
	 */
	private _description : string;

	/**
	 * Hashid property.
	 *
	 * @property _hashid
	 * @type string
	 */
	private _hashid : string;

	/**
	 * User property
	 *
	 * @property _user
	 * @type User
	 */
	private _user : User;

	/**
	 * Lazy loading for User property
	 *
	 * @property _user_loaded
	 * @type boolean
	 */
	private _user_loaded : boolean;

	/**
	 * Images property.
	 *
	 * @property _images
	 * @type Array<ImageObject>
	 */
	private _images : Array<ImageObject>;

	/**
	 * Lazy loading for _images property.
	 *
	 * @property _images_loaded
	 * @type boolean
	 */
	private _images_loaded : boolean;

	/**
	 * Constructor.
	 *
	 * @constructor
	 * @param {string} hashid - The ImagesCollection's hashid.
	 * @param {string} name - The ImagesCollection's name.
	 * @param {string} description - The ImagesCollection's description.
	 * @param {number} id - The ImagesCollection's id.
	 * @param {string} createdAt - The ImagesCollection's createdAt.
	 * @param {string} updatedAt - The ImagesCollection's updatedAt.
	 */
	constructor(hashid : string = "", name : string = "", description : string = "", id : number = null, createdAt : string = null, updatedAt : string = null) {
		super(id, createdAt, updatedAt);

		this.setHashid(hashid);
		this.setName(name);
		this.setDescription(description);

		this._user = null;
		this._user_loaded = false;

		this._images = null;
		this._images_loaded = false;
	}

	/**
	 * Set the ImagesCollection's hashid.
	 *
	 * @method setHashid
	 * @param {string} hashid - New hashid
	 */
	setHashid(hashid : string) {
		this._hashid = hashid;
	}

	/**
	 * Return the ImagesCollection's hashid.
	 *
	 * @method hashid
	 */
	hashid() {
		return this._hashid;
	}

	/**
	 * Set the ImagesCollection's name.
	 *
	 * @method setName
	 * @param {string} name - New name
	 */
	setName(name : string) {
		this._name = name;
	}

	/**
	 * Return the ImagesCollection's name.
	 *
	 * @method name
	 */
	name() {
		return this._name;
	}

	/**
	 * Set the ImagesCollection's description.
	 *
	 * @method setDescription
	 * @param {string} description - New description
	 */
	setDescription(description : string) {
		this._description = description;
	}

	/**
	 * Return the ImagesCollection's description.
	 *
	 * @method description
	 */
	description() {
		return this._description;
	}

	/**
	 * Return the ImagesCollection's User.
	 *
	 * @method user
	 */
	user() {
		return this._user;
	}

	/**
	 * Load the ImagesCollection's User.
	 *
	 * @method loadUser
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	loadUser(successCallback : Function, failCallback : Function) {
		if(! this._user_loaded) {
			var self = this;

			this.getSequelizeModel().getUser()
				.then(function(user) {
					if(user != null) {
						var icObject = User.fromJSONObject(user.dataValues);
						icObject.setSequelizeModel(user, function () {
							self._user_loaded = true;
							successCallback();
						}, function (error) {
							failCallback(error);
						}, false);
					} else {
						self._user_loaded = true;
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
	 * Return the ImagesCollection's Images.
	 *
	 * @method images
	 */
	images() {
		return this._images;
	}

	/**
	 * Load the ImagesCollection's Images.
	 *
	 * @method loadImages
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	loadImages(successCallback : Function, failCallback : Function) {
		if(! this._images_loaded) {
			var self = this;

			this.getSequelizeModel().getImages()
				.then(function(images) {

					var allImages : Array<ImageObject> = new Array<ImageObject>();

					if(images.length > 0) {

						images.forEach(function (image:any) {
							var uObject = ImageObject.fromJSONObject(image.dataValues);
							uObject.setSequelizeModel(image, function () {
								allImages.push(uObject);
								if (allImages.length == images.length) {
									self._images_loaded = true;
									self._images = allImages;
									successCallback();
								}
							}, function (error) {
								failCallback(error);
							}, false);
						});

					} else {
						self._images_loaded = true;
						self._images = allImages;
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
			if(self._user_loaded && self._images_loaded) {
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

		this.loadUser(success, fail);
		this.loadImages(success, fail);
	}

	/**
	 * Return a ImagesCollection instance as a JSON Object
	 *
	 * @method toJSONObject
	 * @param {boolean} complete - flag to obtain complete description of Model
	 * @returns {JSONObject} a JSON Object representing the instance
	 */
	toJSONObject(complete : boolean = false) : any {
		var data = super.toJSONObject();

		var newData = {
			"id" : this.hashid(),
			"name": this.name(),
			"description": this.description()
		};

		if(complete) {
			if (this._user_loaded) {
				newData["user"] = (this.user() !== null) ? this.user().toJSONObject() : null;
			}

			if (this._images_loaded) {
				newData["images"] = (this.images() !== null) ? this.serializeArray(this.images()) : null;
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

			var newImagesCollectionJSON = this.toJSONObject(true);
			newImagesCollectionJSON["hashid"] = this.hashid();
			delete(newImagesCollectionJSON["id"]);
			delete(newImagesCollectionJSON["createdAt"]);
			delete(newImagesCollectionJSON["updatedAt"]);

			ImagesCollectionSchema.create(newImagesCollectionJSON)
				.then(function (imagesCollection) {
					var uObject = ImagesCollection.fromJSONObject(imagesCollection.dataValues);
					self._id = uObject.getId();

					self.setSequelizeModel(imagesCollection, function() {
						successCallback(uObject);
					}, function(error) {
						failCallback(error);
					});
				})
				.catch(function (error) {
					failCallback(error);
				});
		} else {
			failCallback(new ModelException("ImagesCollection already exists."));
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
		ImagesCollectionSchema.findById(id)
			.then(function(imagesCollection) {
				if(imagesCollection != null) {
					var uObject = ImagesCollection.fromJSONObject(imagesCollection.dataValues);
					uObject.setSequelizeModel(imagesCollection, function() {
						successCallback(uObject);
					}, function(error) {
						failCallback(error);
					});
				} else {
					failCallback(new ModelException("ImagesCollection with given Id was not found."));
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

			var newImagesCollectionJSON = self.toJSONObject(true);
			newImagesCollectionJSON["hashid"] = this.hashid();
			delete(newImagesCollectionJSON["id"]);
			delete(newImagesCollectionJSON["createdAt"]);
			delete(newImagesCollectionJSON["updatedAt"]);

			self.getSequelizeModel().updateAttributes(newImagesCollectionJSON)
				.then(function(sequelizeInstance) {
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
			failCallback(new ModelException("You need to create ImagesCollection before to update it."));
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
			failCallback(new ModelException("You need to create ImagesCollection before to delete it..."));
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
		ImagesCollectionSchema.all()
			.then(function(imagesCollections) {
				var allImagesCollections : Array<ImagesCollection> = new Array<ImagesCollection>();

				if(imagesCollections.length > 0) {

					imagesCollections.forEach(function (imagesCollection:any) {
						var uObject = ImagesCollection.fromJSONObject(imagesCollection.dataValues);
						uObject.setSequelizeModel(imagesCollection, function () {
							allImagesCollections.push(uObject);
							if (allImagesCollections.length == imagesCollections.length) {
								successCallback(allImagesCollections);
							}
						}, function (error) {
							failCallback(error);
						});
					});
				} else {
					successCallback(allImagesCollections);
				}
			})
			.catch(function(e) {
				failCallback(e);
			});
	}

	/**
	 * Add an Image to ImagesCollection.
	 *
	 * @method addImage
	 * @param {ImageObject} image - Image to add to collection.
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	addImage(image : ImageObject, successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {

			if(image.getId() != null) {
				self.getSequelizeModel().addImage(image.getSequelizeModel())
					.then(function () {

						if(self._images == null) {
							self._images = new Array<ImageObject>();
						}

						self._images.push(image);
						successCallback(self);
					})
					.catch(function (error) {
						failCallback(error);
					});
			} else {
				failCallback(new ModelException("You need to create the ImageObject before to add to ImageCollection."));
			}
		} else {
			failCallback(new ModelException("You need to create ImagesCollection before to add an ImageObject."));
		}
	}

	/**
	 * Remove an ImageObject from ImagesCollection.
	 *
	 * @method removeImage
	 * @param {ImageObject} image - Image to add to collection.
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	removeImage(image : ImageObject, successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {

			if(image.getId() != null) {

				if(self._images == null) {
					failCallback(new ModelException("ImageObject doesn't belong to this ImageCollection."));
				} else {
					var imageToDelete = null;

					self._images = self._images.filter(function(obj) {
						var comp = obj.getId() != image.getId();
						if(!comp) {
							imageToDelete = obj;
						}

						return comp;
					});

					if(imageToDelete == null) {
						failCallback(new ModelException("ImageObject doesn't belong to this ImageCollection."));
					} else {
						self.getSequelizeModel().removeImage(image.getSequelizeModel())
							.then(function () {
								successCallback(self);
							})
							.catch(function (error) {
								self._images.push(imageToDelete);
								failCallback(error);
							});
					}
				}
			} else {
				failCallback(new ModelException("ImageObject doesn't exist. You can't remove an ImageObject that doesn't exist from an ImageCollection."));
			}
		} else {
			failCallback(new ModelException("ImagesCollection doesn't exist. ImageCollection must to exist before to remove something from it."));
		}
	}

	/**
	 * Find One ImagesCollection by hashid.
	 *
	 * @method findOneByHashid
	 * @param {string} hashid - The ImagesCollection's hashid
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	static findOneByHashid(hashid : string, successCallback : Function, failCallback : Function) {
		ImagesCollectionSchema.findOne({ where: {"hashid": hashid} })
			.then(function(imagesCollection) {
				if(imagesCollection != null) {
					var uObject = ImagesCollection.fromJSONObject(imagesCollection.dataValues);
					uObject.setSequelizeModel(imagesCollection, function() {
						successCallback(uObject);
					}, function(error) {
						failCallback(error);
					});
				} else {
					failCallback(new ModelException("ImagesCollection with given Hashid was not found."));
				}
			})
			.catch(function(e) {
				failCallback(e);
			});
	}

	/**
	 * Return a ImagesCollection instance from a JSON Object.
	 *
	 * @method fromJSONObject
	 * @static
	 * @param {JSONObject} jsonObject - The JSON Object
	 * @return {SDI} The model instance.
	 */
	static fromJSONObject(jsonObject : any) : ImagesCollection {
		var imagesCollection = new ImagesCollection(jsonObject.hashid, jsonObject.name, jsonObject.description, jsonObject.id, jsonObject.createdAt, jsonObject.updatedAt);

		return imagesCollection;
	}
}