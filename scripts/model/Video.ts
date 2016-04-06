/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/ModelItf.ts" />

/// <reference path="../core/Helper.ts" />
/// <reference path="../exceptions/ModelException.ts" />

/// <reference path="./VideosCollection.ts" />
/// <reference path="./ImageObject.ts" />

var VideoSchema : any = db["Videos"];

/**
 * Model : Video
 *
 * @class Video
 * @extends ModelItf
 */
class Video extends ModelItf {

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
	 * Mimetype property.
	 *
	 * @property _mimetype
	 * @type string
	 */
	private _mimetype : string;

	/**
	 * Extension property.
	 *
	 * @property _extension
	 * @type string
	 */
	private _extension : string;

	/**
	 * VideosCollection property
	 *
	 * @property _collection
	 * @type VideosCollection
	 */
	private _collection : VideosCollection;

	/**
	 * Lazy loading for VideosCollection property
	 *
	 * @property _collection_loaded
	 * @type boolean
	 */
	private _collection_loaded : boolean;

	/**
	 * Thumbnail property
	 *
	 * @property _thumbnail
	 * @type ImageObject
	 */
	private _thumbnail : ImageObject;

	/**
	 * Lazy loading for Thumbnail property
	 *
	 * @property _thumbnail_loaded
	 * @type boolean
	 */
	private _thumbnail_loaded : boolean;

	/**
	 * Constructor.
	 *
	 * @constructor
	 * @param {string} hashid - The Video's hashid.
	 * @param {string} name - The Video's name.
	 * @param {string} description - The Video's description.
	 * @param {string} mimetype - The ImageObject's mimetype.
	 * @param {string} extension - The ImageObject's extension.
	 * @param {number} id - The Video's id.
	 * @param {string} createdAt - The Video's createdAt.
	 * @param {string} updatedAt - The Video's updatedAt.
	 */
	constructor(hashid : string = "", name : string = "", description : string = "", mimetype : string = "", extension : string = "", id : number = null, createdAt : string = null, updatedAt : string = null) {
		super(id, createdAt, updatedAt);

		this.setHashid(hashid);
		this.setName(name);
		this.setDescription(description);
		this.setMimetype(mimetype);
		this.setExtension(extension);

		this._collection = null;
		this._collection_loaded = false;

		this._thumbnail = null;
		this._thumbnail_loaded = false;
	}

	/**
	 * Set the Video's name.
	 *
	 * @method setName
	 * @param {string} name - New name
	 */
	setName(name : string) {
		this._name = name;
	}

	/**
	 * Return the Video's name.
	 *
	 * @method name
	 */
	name() {
		return this._name;
	}

	/**
	 * Set the Video's description.
	 *
	 * @method setDescription
	 * @param {string} description - New description
	 */
	setDescription(description : string) {
		this._description = description;
	}

	/**
	 * Return the Video's description.
	 *
	 * @method description
	 */
	description() {
		return this._description;
	}

	/**
	 * Set the Video's mimetype.
	 *
	 * @method setMimetype
	 * @param {string} mimetype - New mimetype
	 */
	setMimetype(mimetype : string) {
		this._mimetype = mimetype;
	}

	/**
	 * Return the Video's mimetype.
	 *
	 * @method mimetype
	 */
	mimetype() {
		return this._mimetype;
	}

	/**
	 * Set the Video's extension.
	 *
	 * @method setExtension
	 * @param {string} extension - New extension
	 */
	setExtension(extension : string) {
		this._extension = extension;
	}

	/**
	 * Return the Video's extension.
	 *
	 * @method extension
	 */
	extension() {
		return this._extension;
	}

	/**
	 * Return the Video's VideosCollection.
	 *
	 * @method collection
	 */
	collection() {
		return this._collection;
	}

	/**
	 * Load the Video's VideosCollection.
	 *
	 * @method loadCollection
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	loadCollection(successCallback : Function, failCallback : Function) {
		if(! this._collection_loaded) {
			var self = this;

			this.getSequelizeModel().getVideosCollection()
				.then(function(videosCollection) {
					if(videosCollection != null) {
						var vcObject = VideosCollection.fromJSONObject(videosCollection.dataValues);
						vcObject.setSequelizeModel(videosCollection, function () {
							self._collection_loaded = true;
							self._collection = vcObject;
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

	/**
	 * Return the Video's Thumbnail.
	 *
	 * @method thumbnail
	 */
	thumbnail() {
		return this._thumbnail;
	}

	/**
	 * Load the Video's Thumbnail.
	 *
	 * @method loadThumbnail
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	loadThumbnail(successCallback : Function, failCallback : Function) {
		if(! this._thumbnail_loaded) {
			var self = this;

			this.getSequelizeModel().getImage()
				.then(function(image) {
					if(image != null) {
						var iObject = ImageObject.fromJSONObject(image.dataValues);
						iObject.setSequelizeModel(image, function () {
							self._thumbnail_loaded = true;
							self._thumbnail = iObject;
							successCallback();
						}, function (error) {
							failCallback(error);
						}, false);
					} else {
						self._thumbnail_loaded = true;
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
			if(self._collection_loaded && self._thumbnail_loaded) {
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
		this.loadThumbnail(success, fail);
	}

	/**
	 * Return a Video instance as a JSON Object
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
			"mimetype" : this.mimetype(),
			"extension" : this.extension()
		};

		if(complete) {
			if(this._collection_loaded) {
				newData["collection"] = (this.collection() !== null) ? this.collection().toJSONObject() : null;
			}

			if(this._thumbnail_loaded) {
				newData["thumbnail"] = (this.thumbnail() !== null) ? this.thumbnail().toJSONObject() : null;
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

			var newVideoJSON = this.toJSONObject(true);
			newVideoJSON["hashid"] = this.hashid();
			delete(newVideoJSON["id"]);
			delete(newVideoJSON["createdAt"]);
			delete(newVideoJSON["updatedAt"]);

			VideoSchema.create(newVideoJSON)
				.then(function (video) {
					var vObject = Video.fromJSONObject(video.dataValues);
					self._id = vObject.getId();

					self.setSequelizeModel(video, function() {
						successCallback(self);
					}, function(error) {
						failCallback(error);
					});
				})
				.catch(function (error) {
					failCallback(error);
				});
		} else {
			failCallback(new ModelException("Video already exists."));
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
		VideoSchema.findById(id)
			.then(function(video) {
				if(video != null) {
					var vObject = Video.fromJSONObject(video.dataValues);
					vObject.setSequelizeModel(video, function() {
						successCallback(vObject);
					}, function(error) {
						failCallback(error);
					});
				} else {
					failCallback(new ModelException("Video with given Id was not found."));
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

			var newVideoJSON = self.toJSONObject(true);
			newVideoJSON["hashid"] = this.hashid();
			delete(newVideoJSON["id"]);
			delete(newVideoJSON["createdAt"]);
			delete(newVideoJSON["updatedAt"]);

			self.getSequelizeModel().updateAttributes(newVideoJSON)
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
			failCallback(new ModelException("You need to create Video before to update it."));
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
			failCallback(new ModelException("You need to create Video before to delete it..."));
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
		VideoSchema.all()
			.then(function(videos) {
				var allVideos : Array<Video> = new Array<Video>();

				if(videos.length > 0) {
					videos.forEach(function (video:any) {
						var vObject = Video.fromJSONObject(video.dataValues);
						vObject.setSequelizeModel(video, function () {
							allVideos.push(vObject);
							if (allVideos.length == videos.length) {
								successCallback(allVideos);
							}
						}, function (error) {
							failCallback(error);
						});
					});
				} else {
					successCallback(allVideos);
				}
			})
			.catch(function(e) {
				failCallback(e);
			});
	}

	/**
	 * Set thumbnail for Video.
	 *
	 * @method setThumbnail
	 * @param {ImageObject} image - Image to set as thumbnail for video.
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	setThumbnail(image : ImageObject, successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {

			if(image.getId() != null) {
				self.getSequelizeModel().setImage(image.getSequelizeModel())
					.then(function () {
						self._thumbnail = image;
						self._thumbnail_loaded = true;
						successCallback(self);
					})
					.catch(function (error) {
						failCallback(error);
					});
			} else {
				failCallback(new ModelException("You need to create the Image before to set as thumbnail for Video."));
			}
		} else {
			failCallback(new ModelException("You need to create Video before to set an Image as thumbnail."));
		}
	}

	/**
	 * Unset thumbnail for Video.
	 *
	 * @method unsetThumbnail
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	unsetThumbnail(successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {
			self.getSequelizeModel().setImage(null)
				.then(function () {
					self._thumbnail = null;
					self._thumbnail_loaded = true;
					successCallback(self);
				})
				.catch(function (error) {
					failCallback(error);
				});
		} else {
			failCallback(new ModelException("You need to create Video before to unset an Image as thumbnail."));
		}
	}

	/**
	 * Find One Video by hashid.
	 *
	 * @method findOneByHashid
	 * @param {string} hashid - The Video's hashid
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	static findOneByHashid(hashid : string, successCallback : Function, failCallback : Function) {
		VideoSchema.findOne({ where: {"hashid": hashid} })
			.then(function(video) {
				if(video != null) {
					var vObject = Video.fromJSONObject(video.dataValues);
					vObject.setSequelizeModel(video, function() {
						successCallback(vObject);
					}, function(error) {
						failCallback(error);
					});
				} else {
					failCallback(new ModelException("Video with given Hashid was not found."));
				}
			})
			.catch(function(e) {
				failCallback(e);
			});
	}

	/**
	 * Return a Video instance from a JSON Object.
	 *
	 * @method fromJSONObject
	 * @static
	 * @param {JSONObject} jsonObject - The JSON Object
	 * @return {SDI} The model instance.
	 */
	static fromJSONObject(jsonObject : any) : Video {
		var video = new Video(jsonObject.hashid, jsonObject.name, jsonObject.description, jsonObject.mimetype, jsonObject.extension, jsonObject.id, jsonObject.createdAt, jsonObject.updatedAt);

		return video;
	}
}