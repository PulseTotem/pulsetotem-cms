/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/ModelItf.ts" />

/// <reference path="../core/Helper.ts" />
/// <reference path="../exceptions/ModelException.ts" />

/// <reference path="./ImagesCollection.ts" />

var ImageSchema : any = db["Images"];

/**
 * Model : ImageObject
 *
 * @class ImageObject
 * @extends ModelItf
 */
class ImageObject extends ModelItf {

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
	 * ImagesCollection property
	 *
	 * @property _collection
	 * @type ImagesCollection
	 */
	private _collection : ImagesCollection;

	/**
	 * Lazy loading for ImagesCollection property
	 *
	 * @property _collection_loaded
	 * @type boolean
	 */
	private _collection_loaded : boolean;

	/**
	 * Constructor.
	 *
	 * @constructor
	 * @param {string} hashid - The ImageObject's hashid.
	 * @param {string} name - The ImageObject's name.
	 * @param {string} description - The ImageObject's description.
	 * @param {number} id - The ImageObject's id.
	 * @param {string} createdAt - The ImageObject's createdAt.
	 * @param {string} updatedAt - The ImageObject's updatedAt.
	 */
	constructor(hashid : string = "", name : string = "", description : string = "", id : number = null, createdAt : string = null, updatedAt : string = null) {
		super(id, createdAt, updatedAt);

		this.setHashid(hashid);
		this.setName(name);
		this.setDescription(description);

		this._collection = null;
		this._collection_loaded = false;
	}

	/**
	 * Set the ImageObject's hashid.
	 *
	 * @method setHashid
	 * @param {string} hashid - New hashid
	 */
	setHashid(hashid : string) {
		this._hashid = hashid;
	}

	/**
	 * Return the ImageObject's hashid.
	 *
	 * @method hashid
	 */
	hashid() {
		return this._hashid;
	}

	/**
	 * Set the ImageObject's name.
	 *
	 * @method setName
	 * @param {string} name - New name
	 */
	setName(name : string) {
		this._name = name;
	}

	/**
	 * Return the ImageObject's name.
	 *
	 * @method name
	 */
	name() {
		return this._name;
	}

	/**
	 * Set the ImageObject's description.
	 *
	 * @method setDescription
	 * @param {string} description - New description
	 */
	setDescription(description : string) {
		this._description = description;
	}

	/**
	 * Return the ImageObject's description.
	 *
	 * @method description
	 */
	description() {
		return this._description;
	}

	/**
	 * Return the ImageObject's ImagesCollection.
	 *
	 * @method collection
	 */
	collection() {
		return this._collection;
	}

	/**
	 * Load the ImageObject's ImagesCollection.
	 *
	 * @method loadCollection
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	loadCollection(successCallback : Function, failCallback : Function) {
		if(! this._collection_loaded) {
			var self = this;

			this.getSequelizeModel().getImagesCollection()
				.then(function(imagesCollection) {
					if(imagesCollection != null) {
						var icObject = ImagesCollection.fromJSONObject(imagesCollection.dataValues);
						icObject.setSequelizeModel(imagesCollection, function () {
							self._collection_loaded = true;
							self._collection = icObject;
							successCallback();
						}, function (error) {
							failCallback(error);
						}, false);
					} else {
						self._collection_loaded = true;
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
			if(self._collection_loaded) {
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

		this.loadCollection(success, fail);
	}

	/**
	 * Return a ImageObject instance as a JSON Object
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
			if(this._collection_loaded) {
				newData["collection"] = (this.collection() !== null) ? this.collection().toJSONObject() : null;
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

			var newImageJSON = this.toJSONObject(true);
			newImageJSON["hashid"] = this.hashid();
			delete(newImageJSON["id"]);
			delete(newImageJSON["createdAt"]);
			delete(newImageJSON["updatedAt"]);

			ImageSchema.create(newImageJSON)
				.then(function (image) {
					var uObject = ImageObject.fromJSONObject(image.dataValues);
					self._id = uObject.getId();

					self.setSequelizeModel(image, function() {
						successCallback(self);
					}, function(error) {
						failCallback(error);
					});
				})
				.catch(function (error) {
					failCallback(error);
				});
		} else {
			failCallback(new ModelException("ImageObject already exists."));
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
		ImageSchema.findById(id)
			.then(function(image) {
				if(image != null) {
					var uObject = ImageObject.fromJSONObject(image.dataValues);
					uObject.setSequelizeModel(image, function() {
						successCallback(uObject);
					}, function(error) {
						failCallback(error);
					});
				} else {
					failCallback(new ModelException("ImageObject with given Id was not found."));
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

			var newImageJSON = self.toJSONObject(true);
			newImageJSON["hashid"] = this.hashid();
			delete(newImageJSON["id"]);
			delete(newImageJSON["createdAt"]);
			delete(newImageJSON["updatedAt"]);

			self.getSequelizeModel().updateAttributes(newImageJSON)
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
			failCallback(new ModelException("You need to create ImageObject before to update it."));
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
			failCallback(new ModelException("You need to create ImageObject before to delete it..."));
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
		ImageSchema.all()
			.then(function(images) {
				var allImages : Array<ImageObject> = new Array<ImageObject>();

				if(images.length > 0) {
					images.forEach(function (image:any) {
						var uObject = ImageObject.fromJSONObject(image.dataValues);
						uObject.setSequelizeModel(image, function () {
							allImages.push(uObject);
							if (allImages.length == images.length) {
								successCallback(allImages);
							}
						}, function (error) {
							failCallback(error);
						});
					});
				} else {
					successCallback(allImages);
				}
			})
			.catch(function(e) {
				failCallback(e);
			});
	}

	/**
	 * Find One ImageObject by hashid.
	 *
	 * @method findOneByHashid
	 * @param {string} hashid - The ImageObject's hashid
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	static findOneByHashid(hashid : string, successCallback : Function, failCallback : Function) {
		ImageSchema.findOne({ where: {"hashid": hashid} })
			.then(function(image) {
				if(image != null) {
					var uObject = ImageObject.fromJSONObject(image.dataValues);
					uObject.setSequelizeModel(image, function() {
						successCallback(uObject);
					}, function(error) {
						failCallback(error);
					});
				} else {
					failCallback(new ModelException("ImageObject with given Hashid was not found."));
				}
			})
			.catch(function(e) {
				failCallback(e);
			});
	}

	/**
	 * Return a ImageObject instance from a JSON Object.
	 *
	 * @method fromJSONObject
	 * @static
	 * @param {JSONObject} jsonObject - The JSON Object
	 * @return {SDI} The model instance.
	 */
	static fromJSONObject(jsonObject : any) : ImageObject {
		var image = new ImageObject(jsonObject.hashid, jsonObject.name, jsonObject.description, jsonObject.id, jsonObject.createdAt, jsonObject.updatedAt);

		return image;
	}
}