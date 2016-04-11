/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

var child_process : any = require('child_process');

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
			if(data.charAt(0)=='/'){
				return "jpg";
			}else if(data.charAt(0)=='R'){
				return "gif";
			}else if(data.charAt(0)=='i'){
				return "png";
			} else {
				return null;
			}
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

	/**
	 * Test if obj is an empty object or not. See: http://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
	 * @param obj
	 * @returns {boolean}
     */
	public static isEmpty(obj : any) {
		if (obj == null || obj == "undefined" || obj === "" || typeof(obj) === "undefined") {
			return true;
		}

		if (obj instanceof Array && obj.length == 0) {
			return true;
		}

		if (typeof(obj) == "number") {
			return false;
		}

		if (typeof(obj) == "string" && obj.length > 0) {
			return false;
		}
		try {
			return Object.keys(obj).length === 0 && JSON.stringify(obj) === JSON.stringify({});
		} catch (e) {
			Logger.error("Catch error");
			Logger.error(e);
			Logger.error(typeof(obj));
			Logger.error(obj.length);
			return true;
		}
	}

	/**
	 * Perform a snapshot in a video.
	 * 'ffmpeg' lib needs to be installed on server.
	 *
	 * @method makeSnapshot
	 * @static
	 * @param {string} path - Path to video file
	 * @param {string} destPath - Path of snapshot image file
	 * @param {string} time - Time where perform snapshot
	 * @param {string} width - Snapshot's width
	 * @param {string} height - Snapshot's height
	 * @param {Function} callback - A callback function
	 */
	static makeSnapshot(path : string, destPath : string, time : string, width : string, height : string, callback : Function = null) {
		if (time == null) {
			time = '00:00:01';
		}
		if (width == null) {
			width = '200';
		}
		if (height == null) {
			height = '125';
		}
		child_process.exec('ffmpeg -ss ' + time + ' -i ' + path + ' -y -s ' + width + '*' + height + ' -vframes 1 -f image2 ' + destPath, function(error, stdout, stderr) {
			if (callback != null) {
				callback(error);
			}
		});
	}
}