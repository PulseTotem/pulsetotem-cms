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
	 * Return the mimetype from a base64 image
	 *
	 * @param data The base64 image
	 * @returns {string} a mimetype
	 */
	static guessImageMimeFromB64(data){
		if(data.charAt(0)=='/'){
			return "image/jpeg";
		}else if(data.charAt(0)=='R'){
			return "image/gif";
		}else if(data.charAt(0)=='i'){
			return "image/png";
		}
	}

	/**
	 * Return an image extension given the mimetype
	 *
	 * @param mime Mimetype of an image
	 * @returns {string} Extension the image file should have
     */
	static guessImageExtensionFromMimeType(mime : string) {
		if (mime == "image/jpeg") {
			return "jpg";
		} else if (mime == "image/gif") {
			return "gif";
		} else if (mime == "image/png") {
			return "png";
		}
	}
}