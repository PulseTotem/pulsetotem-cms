/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/ModelItf.ts" />

/// <reference path="../core/Helper.ts" />
/// <reference path="../exceptions/ModelException.ts" />

/// <reference path="./Team.ts" />
/// <reference path="./News.ts" />

var NewsCollectionSchema : any = db["NewsCollections"];

/**
 * Model : NewsCollection
 *
 * @class NewsCollection
 * @extends ModelItf
 */
class NewsCollection extends ModelItf {

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
	 * NewsList property.
	 *
	 * @property _newsList
	 * @type Array<News>
	 */
	private _newsList : Array<News>;

	/**
	 * Lazy loading for _newsList property.
	 *
	 * @property _newsList_loaded
	 * @type boolean
	 */
	private _newsList_loaded : boolean;

	/**
	 * Constructor.
	 *
	 * @constructor
	 * @param {string} hashid - The NewsCollection's hashid.
	 * @param {string} name - The NewsCollection's name.
	 * @param {string} description - The NewsCollection's description.
	 * @param {number} id - The NewsCollection's id.
	 * @param {string} createdAt - The NewsCollection's createdAt.
	 * @param {string} updatedAt - The NewsCollection's updatedAt.
	 */
	constructor(hashid : string = "", name : string = "", description : string = "", id : number = null, createdAt : string = null, updatedAt : string = null) {
		super(id, createdAt, updatedAt);

		this.setHashid(hashid);
		this.setName(name);
		this.setDescription(description);

		this._team = null;
		this._team_loaded = false;

		this._user = null;
		this._user_loaded = false;

		this._newsList = null;
		this._newsList_loaded = false;
	}

	/**
	 * Set the NewsCollection's name.
	 *
	 * @method setName
	 * @param {string} name - New name
	 */
	setName(name : string) {
		this._name = name;
	}

	/**
	 * Return the NewsCollection's name.
	 *
	 * @method name
	 */
	name() {
		return this._name;
	}

	/**
	 * Set the NewsCollection's description.
	 *
	 * @method setDescription
	 * @param {string} description - New description
	 */
	setDescription(description : string) {
		this._description = description;
	}

	/**
	 * Return the NewsCollection's description.
	 *
	 * @method description
	 */
	description() {
		return this._description;
	}

	/**
	 * Return the NewsCollection's User.
	 *
	 * @method user
	 */
	user() {
		return this._user;
	}

	/**
	 * Load the NewsCollection's User.
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
	 * Return the NewsCollection's Team.
	 *
	 * @method team
	 */
	team() {
		return this._team;
	}

	/**
	 * Load the NewsCollection's Team.
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
	 * Return the NewsCollection's NewsList.
	 *
	 * @method newsList
	 */
	newsList() {
		return this._newsList;
	}

	/**
	 * Load the NewsCollection's NewsList.
	 *
	 * @method loadNewsList
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	loadNewsList(successCallback : Function, failCallback : Function) {
		if(! this._newsList_loaded) {
			var self = this;

			this.getSequelizeModel().getNews()
				.then(function(newsList) {

					var allNews : Array<News> = new Array<News>();

					if(newsList.length > 0) {

						newsList.forEach(function (news:any) {
							var nObject = News.fromJSONObject(news.dataValues);
							nObject.setSequelizeModel(news, function () {
								allNews.push(nObject);
								if (allNews.length == newsList.length) {
									self._newsList_loaded = true;
									self._newsList = allNews;
									successCallback();
								}
							}, function (error) {
								failCallback(error);
							}, false);
						});

					} else {
						self._newsList_loaded = true;
						self._newsList = allNews;
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
			if(self._user_loaded && self._team_loaded && self._newsList_loaded) {
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
		this.loadTeam(success, fail);
		this.loadNewsList(success, fail);
	}

	/**
	 * Return a NewsCollection instance as a JSON Object
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

			if (this._team_loaded) {
				newData["team"] = (this.team() !== null) ? this.team().toJSONObject() : null;
			}

			if (this._newsList_loaded) {
				newData["newsList"] = (this.newsList() !== null) ? this.serializeArray(this.newsList()) : null;
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

			var newNewsCollectionJSON = this.toJSONObject(true);
			newNewsCollectionJSON["hashid"] = this.hashid();
			delete(newNewsCollectionJSON["id"]);
			delete(newNewsCollectionJSON["createdAt"]);
			delete(newNewsCollectionJSON["updatedAt"]);

			NewsCollectionSchema.create(newNewsCollectionJSON)
				.then(function (newsCollection) {
					var ncObject = NewsCollection.fromJSONObject(newsCollection.dataValues);
					self._id = ncObject.getId();

					self.setSequelizeModel(newsCollection, function() {
						successCallback(self);
					}, function(error) {
						failCallback(error);
					});
				})
				.catch(function (error) {
					failCallback(error);
				});
		} else {
			failCallback(new ModelException("NewsCollection already exists."));
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
		NewsCollectionSchema.findById(id)
			.then(function(newsCollection) {
				if(newsCollection != null) {
					var ncObject = NewsCollection.fromJSONObject(newsCollection.dataValues);
					ncObject.setSequelizeModel(newsCollection, function() {
						successCallback(ncObject);
					}, function(error) {
						failCallback(error);
					});
				} else {
					failCallback(new ModelException("NewsCollection with given Id was not found."));
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

			var newNewsCollectionJSON = self.toJSONObject(true);
			newNewsCollectionJSON["hashid"] = this.hashid();
			delete(newNewsCollectionJSON["id"]);
			delete(newNewsCollectionJSON["createdAt"]);
			delete(newNewsCollectionJSON["updatedAt"]);

			self.getSequelizeModel().updateAttributes(newNewsCollectionJSON)
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
			failCallback(new ModelException("You need to create NewsCollection before to update it."));
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

			var deleteNewsList = function() {

				if(self.newsList().length > 0) {
					var nbDelete = 0;

					var successDelete = function () {
						nbDelete = nbDelete + 1;
						if (nbDelete == self.newsList().length) {
							deleteCollection();
						}
					};

					self.newsList().forEach(function (news:News) {
						news.delete(successDelete, failCallback);
					});
				} else {
					deleteCollection();
				}
			};

			if(! self._newsList_loaded) {
				self.loadNewsList(deleteNewsList, failCallback);
			} else {
				deleteNewsList();
			}
		} else {
			failCallback(new ModelException("You need to create NewsCollection before to delete it..."));
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
		NewsCollectionSchema.all()
			.then(function(newsCollections) {
				var allNewsCollections : Array<NewsCollection> = new Array<NewsCollection>();

				if(newsCollections.length > 0) {

					newsCollections.forEach(function (newsCollection:any) {
						var ncObject = NewsCollection.fromJSONObject(newsCollection.dataValues);
						ncObject.setSequelizeModel(newsCollection, function () {
							allNewsCollections.push(ncObject);
							if (allNewsCollections.length == newsCollections.length) {
								successCallback(allNewsCollections);
							}
						}, function (error) {
							failCallback(error);
						});
					});
				} else {
					successCallback(allNewsCollections);
				}
			})
			.catch(function(e) {
				failCallback(e);
			});
	}

	/**
	 * Add an News to NewsCollection.
	 *
	 * @method addNews
	 * @param {News} news - News to add to collection.
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	addNews(news : News, successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {

			if(news.getId() != null) {
				self.getSequelizeModel().addNews(news.getSequelizeModel())
					.then(function () {

						if(self._newsList == null) {
							self._newsList = new Array<News>();
						}

						self._newsList.push(news);
						self._newsList_loaded = true;
						successCallback(self);
					})
					.catch(function (error) {
						failCallback(error);
					});
			} else {
				failCallback(new ModelException("You need to create the News before to add to NewsCollection."));
			}
		} else {
			failCallback(new ModelException("You need to create NewsCollection before to add an News."));
		}
	}

	/**
	 * Remove an News from NewsCollection.
	 *
	 * @method removeNews
	 * @param {News} news - News to add to collection.
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	removeNews(news : News, successCallback : Function, failCallback : Function) {
		var self = this;

		if(this.getId() != null) {

			if(news.getId() != null) {

				if(self._newsList == null) {
					failCallback(new ModelException("News doesn't belong to this NewsCollection."));
				} else {
					var newsToDelete = null;

					self._newsList = self._newsList.filter(function(obj) {
						var comp = obj.getId() != news.getId();
						if(!comp) {
							newsToDelete = obj;
						}

						return comp;
					});

					if(newsToDelete == null) {
						failCallback(new ModelException("News doesn't belong to this NewsCollection."));
					} else {
						self.getSequelizeModel().removeNews(news.getSequelizeModel())
							.then(function () {
								successCallback(self);
							})
							.catch(function (error) {
								self._newsList.push(newsToDelete);
								failCallback(error);
							});
					}
				}
			} else {
				failCallback(new ModelException("News doesn't exist. You can't remove an News that doesn't exist from an NewsCollection."));
			}
		} else {
			failCallback(new ModelException("NewsCollection doesn't exist. NewsCollection must to exist before to remove something from it."));
		}
	}

	/**
	 * Find One NewsCollection by hashid.
	 *
	 * @method findOneByHashid
	 * @param {string} hashid - The NewsCollection's hashid
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	static findOneByHashid(hashid : string, successCallback : Function, failCallback : Function) {
		NewsCollectionSchema.findOne({ where: {"hashid": hashid} })
			.then(function(newsCollection) {
				if(newsCollection != null) {
					var ncObject = NewsCollection.fromJSONObject(newsCollection.dataValues);
					ncObject.setSequelizeModel(newsCollection, function() {
						successCallback(ncObject);
					}, function(error) {
						failCallback(error);
					});
				} else {
					failCallback(new ModelException("NewsCollection with given Hashid was not found."));
				}
			})
			.catch(function(e) {
				failCallback(e);
			});
	}

	/**
	 * Return a NewsCollection instance from a JSON Object.
	 *
	 * @method fromJSONObject
	 * @static
	 * @param {JSONObject} jsonObject - The JSON Object
	 * @return {SDI} The model instance.
	 */
	static fromJSONObject(jsonObject : any) : NewsCollection {
		var newsCollection = new NewsCollection(jsonObject.hashid, jsonObject.name, jsonObject.description, jsonObject.id, jsonObject.createdAt, jsonObject.updatedAt);

		return newsCollection;
	}
}