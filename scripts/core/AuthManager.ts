/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="./Logger.ts" />

/**
 * AuthManager class.
 *
 * @class AuthManager
 */
class AuthManager {

	/**
	 * Roles.
	 * A map between an Role and a check function.
	 *
	 * @property roles
	 * @type Object
	 * @static
	 */
	static roles : Object = new Object();

	/**
	 * Actions.
	 * A map between an Action and an Array of Roles.
	 *
	 * @property actions
	 * @type Object
	 * @static
	 */
	static actions : Object = new Object();

	/**
	 * Add a role.
	 *
	 * @method addRole
	 * @static
	 * @param {string} role - Role's description.
	 * @param {Function} checkFunction - Check function for the Role.
	 */
	static addRole(role : string, checkFunction : Function){
		if(typeof(this.roles[role]) == "undefined") {
			this.roles[role] = checkFunction;
		} else {
			Logger.error("Role '" + role + "' is declared in several times.");
		}
	}

	/**
	 * Add an action.
	 *
	 * @method addAction
	 * @static
	 * @param {string} action - Action's description.
	 * @param {string or Array<string>} roles - Associated roles.
	 */
	static addAction(action : string, roles : any){
		if(typeof(this.actions[action]) == "undefined") {
			var rolesForAction = [].concat(roles);
			this.actions[action] = rolesForAction;
		} else {
			Logger.error("Action '" + action + "' is declared in several times.");
		}
	}

	/**
	 * Return a function that checks the conditions for action in param.
	 *
	 * @method can
	 * @static
	 * @param {string} action - Action to check
	 * @return {Function} a Middleware Function that checks conditions for action
	 */
	static can(action: string) : Function {
		var self = this;

		return function(req, res, next) { // Return a middleware function
			if(req.method != 'OPTIONS') {
				if (typeof(self.actions[action]) != "undefined") { // check for existing action
					var rolesForAction = self.actions[action];

					if (rolesForAction.length > 0) { // check for roles associated to action

						var errorsList = new Array();

						var checkRole = function (roleIndex) {
							// Loop through all checkFunction.
							// Continue while checkFunction returns an error. Stop when a checkFunction is OK.

							if (roleIndex < rolesForAction.length) {

								var role = rolesForAction[roleIndex];

								if (typeof(self.roles[role]) != "undefined") {
									var checkFunction = self.roles[role];

									checkFunction(req, res, function (error) {
										if (typeof(error) == "undefined" || error == null) { // All is ok.
											next();
										} else { // An error occured.
											errorsList.push(error.message);

											checkRole(++roleIndex);
										}
									});

								} else {
									next(new Error("Authorization for this action '" + action + "' can't be checked."));
								}

							} else {
								next(new Error("You haven't authorization to perform this action '" + action + "'. Errors list is : " + JSON.stringify(errorsList)));
							}
						};

						checkRole(0);

					} else {
						next(new Error("Authorization for this action '" + action + "' can't be checked."));
					}
				} else {
					next(new Error("Authorization for this action '" + action + "' can't be checked."));
				}
			} else {
				//No check during 'OPTIONS' request.
				next();
			}
		};
	}
}