/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/ModelItf.ts" />

/// <reference path="../core/Helper.ts" />
/// <reference path="../exceptions/ModelException.ts" />

/// <reference path="./Team.ts" />
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
	 * 'Autogenerate' status property.
	 * Set 'false' if collection is not autogenerate, 'true' when it is autogenerate by CMS itself.
	 * (for example, when thumbnails for video are created or photo in news are added)
	 *
	 * @property _autogenerate
	 * @type boolean
	 */
	private _autogenerate : boolean;

	/**
	 * Team property
	 *
	 * @property _team
	 * @type Team
	 */
	private _team : Team;

	/**
	 * Lazy loading for Team property
	 *
	 * @property _team_loaded
	 * @type boolean
	 */
	private _team_loaded : boolean;

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
	 * Cover property
	 *
	 * @property _cover
	 * @type ImageObject
	 */
	private _cover : ImageObject;

	/**
	 * Lazy loading for Cover property
	 *
	 * @property _cover_loaded
	 * @type boolean
	 */
	private _cover_loaded : boolean;

	/**
	 * Constructor.
	 *
	 * @constructor
	 * @param {string} hashid - The ImagesCollection's hashid.
	 * @param {string} name - The ImagesCollection's name.
	 * @param {string} description - The ImagesCollection's description.
	 * @param {boolean} autogenerate - The ImagesCollection's autogenerate status.
	 * @param {number} id - The ImagesCollection's id.
	 * @param {string} createdAt - The ImagesCollection's createdAt.
	 * @param {string} updatedAt - The ImagesCollection's updatedAt.
	 */
	constructor(hashid : string = "", name : string = "", description : string = "", autogenerate : boolean = false, id : number = null, createdAt : string = null, updatedAt : string = null) {
		super(id, createdAt, updatedAt);

		this.setHashid(hashid);
		this.setName(name);
		this.setDescription(description);
		this.setAutogenerate(autogenerate);

		this._team = null;
		this._team_loaded = false;

		this._cover = null;
		this._cover_loaded = false;

		this._images = null;
		this._images_loaded = false;
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
	 * Set the ImagesCollection's autogenerate status.
	 *
	 * @method setAutogenerate
	 * @param {boolean} autogenerate - New autogenerate status
	 */
	setAutogenerate(autogenerate : boolean) {
		this._autogenerate = autogenerate;
	}

	/**
	 * Return the ImagesCollection's autogenerate status.
	 *
	 * @method autogenerate
	 */
	autogenerate() {
		return this._autogenerate;
	}

	/**
	 * Return the ImagesCollection's Team.
	 *
	 * @method team
	 */
	team() {
		return this._team;
	}

	/**
	 * Load the ImagesCollection's Team.
	 *
	 * @method loadTeam
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	loadTeam(successCallback : Function, failCallback : Function) {
		if(! this._team_loaded) {
			var self = this;

			this.getSequelizeModel().getTeam()
				.then(function(team) {
					if(team != null) {
						var tObject = Team.fromJSONObject(team.dataValues);
						tObject.setSequelizeModel(team, function () {
							self._team_loaded = true;
							self._team = tObject;
							successCallback();
						}, function (error) {
							failCallback(error);
						}, false);
					} else {
						self._team_loaded = true;
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
	 * Return the ImagesCollection's cover.
	 *
	 * @method cover
	 */
	cover() {
		return this._cover;
	}

	/**
	 * Load the ImagesCollection's cover.
	 *
	 * @method loadCover
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	loadCover(successCallback : Function, failCallback : Function) {
		if(! this._cover_loaded) {
			var self = this;

			this.getSequelizeModel().getImage()
				.then(function(img) {
					if(img != null) {
						var iObject = ImageObject.fromJSONObject(img.dataValues);
						iObject.setSequelizeModel(img, function () {
							self._cover_loaded = true;
							self._cover = iObject;
							successCallback();
						}, function (error) {
							failCallback(error);
						}, false);
					} else {
						self._cover_loaded = true;
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
			if(self._team_loaded && self._cover_loaded && self._images_loaded) {
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

		this.loadTeam(success, fail);
		this.loadCover(success, fail);
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
			"description": this.description(),
			"autogenerate": this.autogenerate()
		};

		if(complete) {
			if (this._team_loaded) {
				newData["team"] = (this.team() !== null) ? this.team().toJSONObject() : null;
			}

			if (this._cover_loaded) {
				newData["cover"] = (this.cover() !== null) ? this.cover().toJSONObject() : null;
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
						successCallback(self);
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

			var deleteCollection = function() {
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
			};

			var deleteImages = function() {

				if(self.images().length > 0) {
					var nbDelete = 0;

					var successDelete = function () {
						nbDelete = nbDelete + 1;
						if (nbDelete == self.images().length) {
							deleteCollection();
						}
					};

					self.images().forEach(function (image:ImageObject) {
						image.delete(successDelete, failCallback);
					});
				} else {
					deleteCollection();
				}
			};

			if(! self._images_loaded) {
				self.loadImages(deleteImages, failCallback);
			} else {
				deleteImages();
			}
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
						self._images_loaded = true;

						if(self._cover == null) {
							var successSetCover = function(img) {
								successCallback(self);
							};
							self.setCover(image, successSetCover, failCallback);
						} else {
							successCallback(self);
						}
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
								if(self._cover.getId() == image.getId()) {
									if(self.images().length > 0) {
										var successSetCover = function(img) {
											successCallback(self);
										};
										self.setCover(self.images()[0], successSetCover, failCallback);
									} else {
										var successUnsetCover = function(img) {
											successCallback(self);
										};
										self.unsetCover(successUnsetCover, failCallback);
									}
								} else {
									successCallback(self);
								}
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
	 * Set cover for ImagesCollection.
	 *
	 * @method setCover
	 * @param {ImageObject} image - Image to set as cover for collection.
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	setCover(image : ImageObject, successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {

			if(image.getId() != null) {
				self.getSequelizeModel().setImage(image.getSequelizeModel())
					.then(function () {
						self._cover = image;
						self._cover_loaded = true;
						successCallback(self);
					})
					.catch(function (error) {
						failCallback(error);
					});
			} else {
				failCallback(new ModelException("You need to create the ImageObject before to set as cover for ImageCollection."));
			}
		} else {
			failCallback(new ModelException("You need to create ImagesCollection before to set an ImageObject as cover."));
		}
	}

	/**
	 * Unset cover for ImagesCollection.
	 *
	 * @method unsetCover
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	unsetCover(successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {
			self.getSequelizeModel().setImage(null)
				.then(function () {
					self._cover = null;
					self._cover_loaded = true;
					successCallback(self);
				})
				.catch(function (error) {
					failCallback(error);
				});
		} else {
			failCallback(new ModelException("You need to create ImagesCollection before to unset an ImageObject as cover."));
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
		var imagesCollection = new ImagesCollection(jsonObject.hashid, jsonObject.name, jsonObject.description, jsonObject.autogenerate, jsonObject.id, jsonObject.createdAt, jsonObject.updatedAt);

		return imagesCollection;
	}
}