/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/**
 * Helper class.
 *
 * @class Helper
 */
class Helper {

	/**
	 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
	 *
	 * @method mergeObjects
	 * @param obj1
	 * @param obj2
	 * @returns obj3 a new object based on obj1 and obj2
	 */
	static mergeObjects(obj1 : any, obj2 : any){
		var obj3 = {};
		for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
		for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
		return obj3;
	}
}