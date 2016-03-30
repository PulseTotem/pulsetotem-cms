/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../BaseTest.ts" />

/// <reference path="../../scripts/core/Helper.ts" />

describe('Helper', function() {
	describe('#mergeObjects(obj1, obj2)', function() {
		it('merge two objects properly', function() {
			var obj1 = {
				attr1 : "attr1",
				attr2 : "attr2",
				attr3 : "attr3"
			};
			var obj2 = {
				attr2 : "attr4",
				attr5 : "attr5"
			};
			var expectedObj = {
				attr1 : "attr1",
				attr2 : "attr4",
				attr3 : "attr3",
				attr5 : "attr5"
			};

			var result = Helper.mergeObjects(obj1, obj2);

			assert.deepEqual(result, expectedObj, "Objects weren't merged properly.");
		});

		it('merge an object with an empty one properly', function() {
			var obj1 = {
				attr1 : "attr1",
				attr2 : "attr2",
				attr3 : "attr3"
			};
			var obj2 = {};

			var result = Helper.mergeObjects(obj1, obj2);

			assert.deepEqual(result, obj1, "Objects weren't merged properly.");
		});

		it('merge an empty object with a not empty properly', function() {
			var obj1 = {};
			var obj2 = {
				attr1 : "attr1",
				attr2 : "attr2",
				attr3 : "attr3"
			};

			var result = Helper.mergeObjects(obj1, obj2);

			assert.deepEqual(result, obj2, "Objects weren't merged properly.");
		});

		it('merge two empty objects properly', function() {
			var obj1 = {};
			var obj2 = {};

			var result = Helper.mergeObjects(obj1, obj2);

			assert.deepEqual(result, {}, "Objects weren't merged properly.");
		});

		it('merge an object with a null param properly', function() {
			var obj1 = {
				attr1 : "attr1",
				attr2 : "attr2",
				attr3 : "attr3"
			};
			var obj2 = null
			var expectedObj = {
				attr1 : "attr1",
				attr2 : "attr2",
				attr3 : "attr3"
			};

			var result = Helper.mergeObjects(obj1, obj2);

			assert.deepEqual(result, expectedObj, "Objects weren't merged properly.");
		});

		it('merge two null params properly', function() {
			var result = Helper.mergeObjects(null, null);

			assert.deepEqual(result, {}, "Objects weren't merged properly.");
		});

	});

	describe('#isEmpty(obj)', function () {
		it('should return true if obj is {}', function () {
			assert.ok(Helper.isEmpty({}));
		});

		it('should return true if obj is ""', function () {
			assert.ok(Helper.isEmpty(""));
		});

		it('should return true if obj is null', function () {
			assert.ok(Helper.isEmpty(null));
		});

		it('should return true if obj is undefined', function () {
			var a : any;
			assert.ok(Helper.isEmpty(a));
		});

		it('should return true if obj is []', function () {
			assert.ok(Helper.isEmpty([]));
		});

		it('should return false if obj is 2', function () {
			assert.ok(!Helper.isEmpty(2));
		});

		it('should return false if obj is {"b":"c"}', function () {
			assert.ok(!Helper.isEmpty({'b':'c'}));
		});

		it('should return false if obj is ["a"]', function () {
			assert.ok(!Helper.isEmpty(["a"]));
		});

		it('should return false if obj is "a"', function () {
			assert.ok(!Helper.isEmpty("a"));
		});
	});
});