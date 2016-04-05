/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/ModelItf.ts" />

/// <reference path="../core/Helper.ts" />
/// <reference path="../exceptions/ModelException.ts" />

/// <reference path="./NewsCollection.ts" />

var NewsSchema : any = db["News"];

/**
 * Model : News
 *
 * @class News
 * @extends ModelItf
 */
class News extends ModelItf {

	/**
	 * Title property.
	 *
	 * @property _title
	 * @type string
	 */
	private _title : string;

	/**
	 * Content property.
	 *
	 * @property _content
	 * @type string
	 */
	private _content : string;

	/**
	 * Begin property.
	 *
	 * @property _begin
	 * @type string
	 */
	private _begin : string;

	/**
	 * End property.
	 *
	 * @property _end
	 * @type string
	 */
	private _end : string;

	/**
	 * NewsCollection property
	 *
	 * @property _collection
	 * @type NewsCollection
	 */
	private _collection : NewsCollection;

	/**
	 * Lazy loading for NewsCollection property
	 *
	 * @property _collection_loaded
	 * @type boolean
	 */
	private _collection_loaded : boolean;

	/**
	 * Constructor.
	 *
	 * @constructor
	 * @param {string} hashid - The News's hashid.
	 * @param {string} title - The News's title.
	 * @param {string} content - The News's content.
	 * @param {string} begin - The News's begin.
	 * @param {string} end - The News's end.
	 * @param {number} id - The News's id.
	 * @param {string} createdAt - The News's createdAt.
	 * @param {string} updatedAt - The News's updatedAt.
	 */
	constructor(hashid : string = "", title : string = "", content : string = "", begin : string = "", end : string = "", id : number = null, createdAt : string = null, updatedAt : string = null) {
		super(id, createdAt, updatedAt);

		this.setHashid(hashid);
		this.setTitle(title);
		this.setContent(content);
		this.setBegin(begin);
		this.setEnd(end);

		this._collection = null;
		this._collection_loaded = false;
	}

	/**
	 * Set the News's title.
	 *
	 * @method setTitle
	 * @param {string} title - New title
	 */
	setTitle(title : string) {
		this._title = title;
	}

	/**
	 * Return the News's title.
	 *
	 * @method title
	 */
	title() {
		return this._title;
	}

	/**
	 * Set the News's content.
	 *
	 * @method setContent
	 * @param {string} content - New content
	 */
	setContent(content : string) {
		this._content = content;
	}

	/**
	 * Return the News's content.
	 *
	 * @method content
	 */
	content() {
		return this._content;
	}

	/**
	 * Set the News's begin.
	 *
	 * @method setBegin
	 * @param {string} begin - New begin
	 */
	setBegin(begin : string) {
		this._begin = begin;
	}

	/**
	 * Return the News's begin.
	 *
	 * @method begin
	 */
	begin() {
		return this._begin;
	}

	/**
	 * Set the News's end.
	 *
	 * @method setEnd
	 * @param {string} end - New end
	 */
	setEnd(end : string) {
		this._end = end;
	}

	/**
	 * Return the News's end.
	 *
	 * @method end
	 */
	end() {
		return this._end;
	}

	/**
	 * Return the News's NewsCollection.
	 *
	 * @method collection
	 */
	collection() {
		return this._collection;
	}

	/**
	 * Load the News's NewsCollection.
	 *
	 * @method loadCollection
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	loadCollection(successCallback : Function, failCallback : Function) {
		if(! this._collection_loaded) {
			var self = this;

			this.getSequelizeModel().getNewsCollection()
				.then(function(newsCollection) {
					if(newsCollection != null) {
						var ncObject = NewsCollection.fromJSONObject(newsCollection.dataValues);
						ncObject.setSequelizeModel(newsCollection, function () {
							self._collection_loaded = true;
							self._collection = ncObject;
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
	 * Return a News instance as a JSON Object
	 *
	 * @method toJSONObject
	 * @param {boolean} complete - flag to obtain complete description of Model
	 * @returns {JSONObject} a JSON Object representing the instance
	 */
	toJSONObject(complete : boolean = false) : any {
		var data = super.toJSONObject();

		var newData = {
			"id" : this.hashid(),
			"title": this.title(),
			"content": this.content(),
			"begin" : this.begin(),
			"end" : this.end()
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

			var newNewsJSON = this.toJSONObject(true);
			newNewsJSON["hashid"] = this.hashid();
			delete(newNewsJSON["id"]);
			delete(newNewsJSON["createdAt"]);
			delete(newNewsJSON["updatedAt"]);

			NewsSchema.create(newNewsJSON)
				.then(function (news) {
					var nObject = News.fromJSONObject(news.dataValues);
					self._id = nObject.getId();

					self.setSequelizeModel(news, function() {
						successCallback(self);
					}, function(error) {
						failCallback(error);
					});
				})
				.catch(function (error) {
					failCallback(error);
				});
		} else {
			failCallback(new ModelException("News already exists."));
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
		NewsSchema.findById(id)
			.then(function(news) {
				if(news != null) {
					var nObject = News.fromJSONObject(news.dataValues);
					nObject.setSequelizeModel(news, function() {
						successCallback(nObject);
					}, function(error) {
						failCallback(error);
					});
				} else {
					failCallback(new ModelException("News with given Id was not found."));
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

			var newNewsJSON = self.toJSONObject(true);
			newNewsJSON["hashid"] = this.hashid();
			delete(newNewsJSON["id"]);
			delete(newNewsJSON["createdAt"]);
			delete(newNewsJSON["updatedAt"]);

			self.getSequelizeModel().updateAttributes(newNewsJSON)
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
			failCallback(new ModelException("You need to create News before to update it."));
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
			failCallback(new ModelException("You need to create News before to delete it..."));
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
		NewsSchema.all()
			.then(function(newsList) {
				var allNews : Array<News> = new Array<News>();

				if(newsList.length > 0) {
					newsList.forEach(function (news:any) {
						var nObject = News.fromJSONObject(news.dataValues);
						nObject.setSequelizeModel(news, function () {
							allNews.push(nObject);
							if (allNews.length == newsList.length) {
								successCallback(allNews);
							}
						}, function (error) {
							failCallback(error);
						});
					});
				} else {
					successCallback(allNews);
				}
			})
			.catch(function(e) {
				failCallback(e);
			});
	}

	/**
	 * Find One News by hashid.
	 *
	 * @method findOneByHashid
	 * @param {string} hashid - The News's hashid
	 * @param {Function} successCallback - The callback function when success.
	 * @param {Function} failCallback - The callback function when fail.
	 */
	static findOneByHashid(hashid : string, successCallback : Function, failCallback : Function) {
		NewsSchema.findOne({ where: {"hashid": hashid} })
			.then(function(news) {
				if(news != null) {
					var nObject = News.fromJSONObject(news.dataValues);
					nObject.setSequelizeModel(news, function() {
						successCallback(nObject);
					}, function(error) {
						failCallback(error);
					});
				} else {
					failCallback(new ModelException("News with given Hashid was not found."));
				}
			})
			.catch(function(e) {
				failCallback(e);
			});
	}

	/**
	 * Return a News instance from a JSON Object.
	 *
	 * @method fromJSONObject
	 * @static
	 * @param {JSONObject} jsonObject - The JSON Object
	 * @return {SDI} The model instance.
	 */
	static fromJSONObject(jsonObject : any) : News {
		var news = new News(jsonObject.hashid, jsonObject.title, jsonObject.content, jsonObject.begin, jsonObject.end, jsonObject.id, jsonObject.createdAt, jsonObject.updatedAt);

		return news;
	}
}