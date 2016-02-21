/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../BaseTest.ts" />

/// <reference path="../../scripts/core/ModelItf.ts" />

describe('ModelItf', function() {
	beforeEach(function() {
		nock.cleanAll();
	});

	describe('#constructor(id,createdAt,updatedAt)', function() {
		it('should store the given id', function() {
			var id = 12;
			var model = new ModelItf(id);

			assert.equal(model.getId(), id, "The id is not correctly stored.");
		});

		it('should give a null id if an undefined argument is given', function() {
			var model = new ModelItf(undefined);
			assert.equal(model.getId(), null, "The id is not null");
		});

		it('should store the given "createdAt" attribute', function() {
			var createdAtString = moment().format();
			var model = new ModelItf(12, createdAtString);

			assert.equal(model.createdAt(), createdAtString, "The string createdAt is not correctly stored.");
		});

		it('should assign a null value if "createdAt" is not given ', function() {
			var model = new ModelItf();
			assert.equal(model.createdAt(), null, "The string createdAt is not null.");
		});

		it('should store the given "updatedAt" attribute', function() {
			var updatedAtString = moment().format();
			var model = new ModelItf(12, "", updatedAtString);

			assert.equal(model.updatedAt(), updatedAtString, "The string updatedAt is not correctly stored.");
		});

		it('should assign a null value if "updatedAt" is not given ', function() {
			var model = new ModelItf();
			assert.equal(model.updatedAt(), null, "The string updatedAt is not null.");
		});
	});

	describe('#setSequelizeModel(sequelizeModel, successCallback, failCallback, loadAssociations)', function() {
		it('should store the given sequelizeModel and load associations', function(done) {
			var id = 12;
			var model = new ModelItf(id);
			var stubLoadAssocations = sinon.stub(model, "loadAssociations", function(successLoad, failLoad) {
				successLoad();
			});

			var successCB = function() {
				assert.equal(model.getSequelizeModel(), null, "The sequelizeModel is not correctly stored.");
				assert.equal(stubLoadAssocations.calledOnce, true, "'loadAssociations' is not called or more than once.");
				done();
			};

			var failCB = function(error) {
				done(error);
			};

			model.setSequelizeModel(null, successCB, failCB);
		});

		it('should store the given sequelizeModel and not load associations', function(done) {
			var id = 12;
			var model = new ModelItf(id);
			var stubLoadAssocations = sinon.stub(model, "loadAssociations", function(successLoad, failLoad) {
				successLoad();
			});

			var successCB = function() {
				assert.equal(model.getSequelizeModel(), null, "The sequelizeModel is not correctly stored.");
				assert.equal(stubLoadAssocations.called, false, "'loadAssociations' is called almost once.");
				done();
			};

			var failCB = function(error) {
				done(error);
			};

			model.setSequelizeModel(null, successCB, failCB, false);
		});
	});
});