const jwt = require("jsonwebtoken");

// jsdoc

// jsdoc

// jsdoc

// jsdoc
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

// jsdoc
const authorizeRoles = (...roles) => {
	// jsdoc
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return res.sendStatus(403);
		}
		next();
	};
};

module.exports = { authenticateToken, authorizeRoles };
