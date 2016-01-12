/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="./Logger.ts" />

declare var require : any;
declare var __dirname : any;

var fs = require('fs');

/**
 * Contains CMS Configuration information.
 *
 * @class CMSConfig
 */
class CMSConfig {

    /**
     * JWT Secret key.
     *
     * @property jwtSecret
     * @type string
     * @static
     */
    static jwtSecret : string = "";

	/**
	 * Upload directory path.
	 *
	 * @property uploadDir
	 * @type string
	 * @static
	 */
	static uploadDir : string = "";

    /**
     * Retrieve configuration information from file description.
     *
     * @method retrieveConfigurationInformation
     * @static
     */
    static retrieveConfigurationInformation() {
        if(CMSConfig.jwtSecret == "" && CMSConfig.uploadDir == "") {
            var file = __dirname + '/cms_config.json';
			try {
				var configInfos = JSON.parse(fs.readFileSync(file, 'utf8'));
				CMSConfig.jwtSecret = configInfos.jwtSecret;
				CMSConfig.uploadDir = configInfos.uploadDir;
			} catch (e) {
				Logger.error("CMS configuration file can't be read.");
				Logger.debug(e);
			}
        }
    }

    /**
     * Return JWT Secret key.
     *
     * @method getJWTSecret
     * @static
     * @return {string} - JWT Secret key.
     */
    static getJWTSecret() : string {
        CMSConfig.retrieveConfigurationInformation();
        return CMSConfig.jwtSecret;
    }

	/**
	 * Return Upload directory path.
	 *
	 * @method getUploadDir
	 * @static
	 * @return {string} - Upload directory path.
	 */
	static getUploadDir() : string {
		CMSConfig.retrieveConfigurationInformation();
		return CMSConfig.uploadDir;
	}
}