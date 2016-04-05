/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../core/RouterItf.ts" />
/// <reference path="../core/CMSConfig.ts" />
/// <reference path="../auth/CMSAuth.ts" />

/// <reference path="../model/News.ts" />

declare var require : any;

var uuid : any = require('node-uuid');

/**
 * NewsRouter class.
 *
 * @class NewsRouter
 * @extends RouterItf
 */
class NewsRouter extends RouterItf {

	/**
	 * Constructor.
	 */
	constructor() {
		super();
	}

	/**
	 * Method called during Router creation.
	 *
	 * @method buildRouter
	 */
	buildRouter() {
		var self = this;

		// Manage params
		this.router.param("news_id", function (req, res, next, id) {
			var success = function(news) {
				req.news = news;
				next();
			};

			var fail = function(error) {
				next(error);
			};

			News.findOneByHashid(id, success, fail);
		});

		// Define '/' route.
		this.router.get('/', CMSAuth.can('manage user news collections'), function(req, res) { self.listAllNewsOfCollection(req, res); });
		this.router.post('/', CMSAuth.can('manage user news collections'), function(req, res) { self.newNews(req, res); });

		// Define '/:news_id' route.
		this.router.get('/:news_id', function(req, res) { self.showNews(req, res); });
		this.router.put('/:news_id', CMSAuth.can('manage user news'), function(req, res) { self.updateNews(req, res); });
		this.router.delete('/:news_id', CMSAuth.can('manage user news'), function(req, res) { self.deleteNews(req, res); });
	}

	/**
	 * List list all news of collection in req.
	 *
	 * @method listAllNewsOfCollection
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	listAllNewsOfCollection(req : any, res : any) {
		var news_JSON = req.newsCollection.toJSONObject(true)["newsList"];

		res.json(news_JSON);
	}

	/**
	 * Add a new News to Collection.
	 *
	 * @method newNews
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	newNews(req : any, res : any) {
		if(typeof(req.body.title) == "undefined" || typeof(req.body.content) == "undefined" || typeof(req.body.begin) == "undefined" || typeof(req.body.end) == "undefined") {
			res.status(500).send({ 'error': 'Missing some information to create new News Collection.' });
		} else {
			var hashid = uuid.v1();

			var newNews = new News(hashid, req.body.title, req.body.content, req.body.begin, req.body.end);

			var fail = function(error) {
				res.status(500).send({ 'error': error });
			};

			var success = function(newsObject : News) {

				var successCollectionLink = function() {
					res.json(newsObject.toJSONObject());
				};

				req.newsCollection.addNews(newsObject, successCollectionLink, fail);
			};

			newNews.create(success, fail);
		}
	}

	/**
	 * Show News info.
	 *
	 * @method showNews
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	showNews(req : any, res : any) {
		res.json(req.news.toJSONObject());
	}

	/**
	 * Update News info.
	 *
	 * @method updateNews
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	updateNews(req : any, res : any) {
		if(typeof(req.body.title) == "undefined" || typeof(req.body.content) == "undefined" || typeof(req.body.begin) == "undefined" || typeof(req.body.end) == "undefined") {
			res.status(500).send({ 'error': 'Missing some information to update New.' });
		} else {

			if(typeof(req.body.title) != "undefined") {
				req.news.setTitle(req.body.title);
			}

			if(typeof(req.body.content) != "undefined") {
				req.news.setContent(req.body.content);
			}

			if(typeof(req.body.begin) != "undefined") {
				req.news.setBegin(req.body.begin);
			}

			if(typeof(req.body.end) != "undefined") {
				req.news.setEnd(req.body.end);
			}

			var success = function(news) {
				res.json(news.toJSONObject());
			};

			var fail = function(error) {
				res.status(500).send({ 'error': error });
			};

			req.news.update(success, fail);
		}
	}

	/**
	 * Delete News.
	 *
	 * @method deleteNews
	 * @param {Express.Request} req - Request object.
	 * @param {Express.Response} res - Response object.
	 */
	deleteNews(req : any, res : any) {
		var fail = function(error) {
			res.status(500).send({ 'error': error });
		};

		var successRemoveNews = function() {
			var success = function(deleteNewId) {
				res.json(deleteNewId);
			};

			var fail = function(error) {
				res.status(500).send({ 'error': error });
			};

			req.news.delete(success, fail);
		};

		req.newsCollection.removeNews(req.news, successRemoveNews, fail);
	}
}