/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/ModelItf.ts" />

/// <reference path="../core/Helper.ts" />
/// <reference path="../exceptions/ModelException.ts" />

/// <reference path="./Video.ts" />

var VideosCollectionSchema : any = db["VideosCollections"];

/**
 * Model : VideosCollection
 *
 * @class VideosCollection
 * @extends ModelItf
 */
class VideosCollection extends ModelItf {

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
	 * Videos property.
	 *
	 * @property _videos
	 * @type Array<Video>
	 */
	private _videos : Array<Video>;

	/**
	 * Lazy loading for _videos property.
	 *
	 * @property _videos_loaded
	 * @type boolean
	 */
	private _videos_loaded : boolean;

	/**
	 * Cover property
	 *
	 * @property _cover
	 * @type Video
	 */
	private _cover : Video;

	/**
	 * Lazy loading for User property
	 *
	 * @property _cover_loaded
	 * @type boolean
	 */
	private _cover_loaded : boolean;

	/**
	 * Constructor.
	 *
	 * @constructor
	 * @param {string} hashid - The VideosCollection's hashid.
	 * @param {string} name - The VideosCollection's name.
	 * @param {string} description - The VideosCollection's description.
	 * @param {number} id - The VideosCollection's id.
	 * @param {string} createdAt - The VideosCollection's createdAt.
	 * @param {string} updatedAt - The VideosCollection's updatedAt.
	 */
	constructor(hashid : string = "", name : string = "", description : string = "", id : number = null, createdAt : string = null, updatedAt : string = null) {
		super(id, createdAt, updatedAt);

		this.setHashid(hashid);
		this.setName(name);
		this.setDescription(description);

		this._user = null;
		this._user_loaded = false;

		this._cover = null;
		this._cover_loaded = false;

		this._videos = null;
		this._videos_loaded = false;
	}

	/**
	 * Set the VideosCollection's name.
	 *
	 * @method setName
	 * @param {string} name - New name
	 */
	setName(name : string) {
		this._name = name;
	}

	/**
	 * Return the VideosCollection's name.
	 *
	 * @method name
	 */
	name() {
		return this._name;
	}

	/**
	 * Set the VideosCollection's description.
	 *
	 * @method setDescription
	 * @param {string} description - New description
	 */
	setDescription(description : string) {
		this._description = description;
	}

	/**
	 * Return the VideosCollection's description.
	 *
	 * @method description
	 */
	description() {
		return this._description;
	}

	/**
	 * Return the VideosCollection's User.
	 *
	 * @method user
	 */
	user() {
		return this._user;
	}

	/**
	 * Load the VideosCollection's User.
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
						var uObject = User.fromJSONObject(user.dataValues);
						uObject.setSequelizeModel(user, function () {
							self._user_loaded = true;
							self._user = uObject;
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
	 * Return the VideosCollection's cover.
	 *
	 * @method cover
	 */
	cover() {
		return this._cover;
	}

	/**
	 * Load the VideosCollection's cover.
	 *
	 * @method loadCover
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	loadCover(successCallback : Function, failCallback : Function) {
		if(! this._cover_loaded) {
			var self = this;

			this.getSequelizeModel().getVideo()
				.then(function(img) {
					if(img != null) {
						var vObject = Video.fromJSONObject(img.dataValues);
						vObject.setSequelizeModel(img, function () {
							self._cover_loaded = true;
							self._cover = vObject;
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
	 * Return the VideosCollection's Videos.
	 *
	 * @method videos
	 */
	videos() {
		return this._videos;
	}

	/**
	 * Load the VideosCollection's Videos.
	 *
	 * @method loadVideos
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	loadVideos(successCallback : Function, failCallback : Function) {
		if(! this._videos_loaded) {
			var self = this;

			this.getSequelizeModel().getVideos()
				.then(function(videos) {

					var allVideos : Array<Video> = new Array<Video>();

					if(videos.length > 0) {

						videos.forEach(function (video:any) {
							var vObject = Video.fromJSONObject(video.dataValues);
							vObject.setSequelizeModel(video, function () {
								allVideos.push(vObject);
								if (allVideos.length == videos.length) {
									self._videos_loaded = true;
									self._videos = allVideos;
									successCallback();
								}
							}, function (error) {
								failCallback(error);
							}, false);
						});

					} else {
						self._videos_loaded = true;
						self._videos = allVideos;
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
			if(self._user_loaded && self._cover_loaded && self._videos_loaded) {
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
		this.loadCover(success, fail);
		this.loadVideos(success, fail);
	}

	/**
	 * Return a VideosCollection instance as a JSON Object
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

			if (this._cover_loaded) {
				newData["cover"] = (this.cover() !== null) ? this.cover().toJSONObject() : null;
			}

			if (this._videos_loaded) {
				newData["videos"] = (this.videos() !== null) ? this.serializeArray(this.videos()) : null;
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

			var newVideosCollectionJSON = this.toJSONObject(true);
			newVideosCollectionJSON["hashid"] = this.hashid();
			delete(newVideosCollectionJSON["id"]);
			delete(newVideosCollectionJSON["createdAt"]);
			delete(newVideosCollectionJSON["updatedAt"]);

			VideosCollectionSchema.create(newVideosCollectionJSON)
				.then(function (videosCollection) {
					var vcObject = VideosCollection.fromJSONObject(videosCollection.dataValues);
					self._id = vcObject.getId();

					self.setSequelizeModel(videosCollection, function() {
						successCallback(self);
					}, function(error) {
						failCallback(error);
					});
				})
				.catch(function (error) {
					failCallback(error);
				});
		} else {
			failCallback(new ModelException("VideosCollection already exists."));
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
		VideosCollectionSchema.findById(id)
			.then(function(videosCollection) {
				if(videosCollection != null) {
					var vcObject = VideosCollection.fromJSONObject(videosCollection.dataValues);
					vcObject.setSequelizeModel(videosCollection, function() {
						successCallback(vcObject);
					}, function(error) {
						failCallback(error);
					});
				} else {
					failCallback(new ModelException("VideosCollection with given Id was not found."));
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

			var newVideosCollectionJSON = self.toJSONObject(true);
			newVideosCollectionJSON["hashid"] = this.hashid();
			delete(newVideosCollectionJSON["id"]);
			delete(newVideosCollectionJSON["createdAt"]);
			delete(newVideosCollectionJSON["updatedAt"]);

			self.getSequelizeModel().updateAttributes(newVideosCollectionJSON)
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
			failCallback(new ModelException("You need to create VideosCollection before to update it."));
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
						var destroyId = self.getId();
						self._id = null;

						successCallback({"id" : destroyId});
					})
					.catch(function (error) {
						failCallback(error);
					});
			};

			var deleteVideos = function() {

				if(self.videos().length > 0) {
					var nbDelete = 0;

					var successDelete = function () {
						nbDelete = nbDelete + 1;
						if (nbDelete == self.videos().length) {
							deleteCollection();
						}
					};

					self.videos().forEach(function (video:Video) {
						video.delete(successDelete, failCallback);
					});
				} else {
					deleteCollection();
				}
			};

			if(! self._videos_loaded) {
				self.loadVideos(deleteVideos, failCallback);
			} else {
				deleteVideos();
			}
		} else {
			failCallback(new ModelException("You need to create VideosCollection before to delete it..."));
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
		VideosCollectionSchema.all()
			.then(function(videosCollections) {
				var allVideosCollections : Array<VideosCollection> = new Array<VideosCollection>();

				if(videosCollections.length > 0) {

					videosCollections.forEach(function (videosCollection:any) {
						var vcObject = VideosCollection.fromJSONObject(videosCollection.dataValues);
						vcObject.setSequelizeModel(videosCollection, function () {
							allVideosCollections.push(vcObject);
							if (allVideosCollections.length == videosCollections.length) {
								successCallback(allVideosCollections);
							}
						}, function (error) {
							failCallback(error);
						});
					});
				} else {
					successCallback(allVideosCollections);
				}
			})
			.catch(function(e) {
				failCallback(e);
			});
	}

	/**
	 * Add an Video to VideosCollection.
	 *
	 * @method addVideo
	 * @param {Video} video - Video to add to collection.
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	addVideo(video : Video, successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {

			if(video.getId() != null) {
				self.getSequelizeModel().addVideo(video.getSequelizeModel())
					.then(function () {

						if(self._videos == null) {
							self._videos = new Array<Video>();
						}

						self._videos.push(video);
						self._videos_loaded = true;

						if(self._cover == null) {
							var successSetCover = function(vid) {
								successCallback(self);
							};
							self.setCover(video, successSetCover, failCallback);
						} else {
							successCallback(self);
						}
					})
					.catch(function (error) {
						failCallback(error);
					});
			} else {
				failCallback(new ModelException("You need to create the Video before to add to VideoCollection."));
			}
		} else {
			failCallback(new ModelException("You need to create VideosCollection before to add an Video."));
		}
	}

	/**
	 * Remove an Video from VideosCollection.
	 *
	 * @method removeVideo
	 * @param {Video} video - Video to add to collection.
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	removeVideo(video : Video, successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {

			if(video.getId() != null) {

				if(self._videos == null) {
					failCallback(new ModelException("Video doesn't belong to this VideoCollection."));
				} else {
					var videoToDelete = null;

					self._videos = self._videos.filter(function(obj) {
						var comp = obj.getId() != video.getId();
						if(!comp) {
							videoToDelete = obj;
						}

						return comp;
					});

					if(videoToDelete == null) {
						failCallback(new ModelException("Video doesn't belong to this VideoCollection."));
					} else {
						self.getSequelizeModel().removeVideo(video.getSequelizeModel())
							.then(function () {
								if(self._cover.getId() == video.getId()) {
									if(self.videos().length > 0) {
										var successSetCover = function(img) {
											successCallback(self);
										};
										self.setCover(self.videos()[0], successSetCover, failCallback);
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
								self._videos.push(videoToDelete);
								failCallback(error);
							});
					}
				}
			} else {
				failCallback(new ModelException("Video doesn't exist. You can't remove an Video that doesn't exist from an VideoCollection."));
			}
		} else {
			failCallback(new ModelException("VideosCollection doesn't exist. VideoCollection must to exist before to remove something from it."));
		}
	}

	/**
	 * Set cover for VideosCollection.
	 *
	 * @method setCover
	 * @param {Video} video - Video to set as cover for collection.
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	setCover(video : Video, successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {

			if(video.getId() != null) {
				self.getSequelizeModel().setVideo(video.getSequelizeModel())
					.then(function () {
						self._cover = video;
						self._cover_loaded = true;
						successCallback(self);
					})
					.catch(function (error) {
						failCallback(error);
					});
			} else {
				failCallback(new ModelException("You need to create the Video before to set as cover for VideoCollection."));
			}
		} else {
			failCallback(new ModelException("You need to create VideosCollection before to set an Video as cover."));
		}
	}

	/**
	 * Unset cover for VideosCollection.
	 *
	 * @method unsetCover
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	unsetCover(successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {
			self.getSequelizeModel().setVideo(null)
				.then(function () {
					self._cover = null;
					self._cover_loaded = true;
					successCallback(self);
				})
				.catch(function (error) {
					failCallback(error);
				});
		} else {
			failCallback(new ModelException("You need to create VideosCollection before to unset an Video as cover."));
		}
	}

	/**
	 * Find One VideosCollection by hashid.
	 *
	 * @method findOneByHashid
	 * @param {string} hashid - The VideosCollection's hashid
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	static findOneByHashid(hashid : string, successCallback : Function, failCallback : Function) {
		VideosCollectionSchema.findOne({ where: {"hashid": hashid} })
			.then(function(videosCollection) {
				if(videosCollection != null) {
					var vcObject = VideosCollection.fromJSONObject(videosCollection.dataValues);
					vcObject.setSequelizeModel(videosCollection, function() {
						successCallback(vcObject);
					}, function(error) {
						failCallback(error);
					});
				} else {
					failCallback(new ModelException("VideosCollection with given Hashid was not found."));
				}
			})
			.catch(function(e) {
				failCallback(e);
			});
	}

	/**
	 * Return a VideosCollection instance from a JSON Object.
	 *
	 * @method fromJSONObject
	 * @static
	 * @param {JSONObject} jsonObject - The JSON Object
	 * @return {SDI} The model instance.
	 */
	static fromJSONObject(jsonObject : any) : VideosCollection {
		var videosCollection = new VideosCollection(jsonObject.hashid, jsonObject.name, jsonObject.description, jsonObject.id, jsonObject.createdAt, jsonObject.updatedAt);

		return videosCollection;
	}
}