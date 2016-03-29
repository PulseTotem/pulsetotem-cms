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
	static mergeObjects(obj1 : any, obj2 : any) : any {
		var obj3 = {};
		for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
		for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
		return obj3;
	}

	/**
	 * Detect file extension from base64 image data.
	 * @param data
	 * @returns {any}
     */
	public static guessImageExtensionFromB64(data) {
		if (data.indexOf("image/png") !== -1) {
			return "png"
		} else if (data.indexOf("image/jpeg") !== -1) {
			return "jpg";
		} else if (data.indexOf("image/gif") !== -1) {
			return "gif";
		} else {
			return null;
		}
	}

	public static guessMimetypeFromExtension(extension : string) {
		if (extension == "png") {
			return "image/png";
		} else if (extension == "jpg") {
			return "image/jpeg";
		} else if (extension == "gif") {
			return "image/gif";
		} else {
			return null;
		}
	}
}