const jwt = require("jsonwebtoken");

/**
 * @typedef {Object} ExpressRequest
 * @property {Object.<string, string>} headers
 * @property {Object} user
 */

/**
 * @typedef {Object} ExpressResponse
 * @property {function(number): void} sendStatus
 */

/**
 * @typedef {Object} ExpressNextFunction
 * @property {function(): void} next
 */

/**
 * Middleware to authenticate JWT token from request headers
 * @param {ExpressRequest} req - Express request object
 * @param {ExpressResponse} res - Express response object
 * @param {ExpressNextFunction} next - Express next middleware function
 * @returns {void}
 * @throws {401} - If no token is provided
 * @throws {403} - If token is invalid
 */
const authenticateToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	if (!token) return res.sendStatus(401);

	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) return res.sendStatus(403);
		req.user = user;
		next();
	});
};

/**
 * Middleware factory to authorize user roles
 * @param {...string} roles - Allowed roles for the route
 * @returns {function(ExpressRequest, ExpressResponse, ExpressNextFunction): void} Middleware function to check user roles
 * @throws {403} - If user's role is not in allowed roles
 */
const authorizeRoles = (...roles) => {
	/**
	 * Middleware to check if user has required role
	 * @param {ExpressRequest} req - Express request object
	 * @param {ExpressResponse} res - Express response object
	 * @param {ExpressNextFunction} next - Express next middleware function
	 * @returns {void}
	 */
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return res.sendStatus(403);
		}
		next();
	};
};

module.exports = { authenticateToken, authorizeRoles };
