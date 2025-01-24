/**
 * @fileoverview Ideas route handlers for managing idea submissions and approvals
 * @module routes/ideas
 * @requires express
 * @requires ../middleware/auth
 */

const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

/**
 * @typedef {Object} ExpressRequest
 * @property {Object.<string, string>} headers - Request headers
 * @property {Object} user - Authenticated user information
 * @property {Object} body - Request body
 * @property {Object} params - URL parameters
 */

/**
 * @typedef {Object} ExpressResponse
 * @property {function(number): void} sendStatus - Sends HTTP status
 * @property {function(Object): void} json - Sends JSON response
 * @property {function(number): ExpressResponse} status - Sets HTTP status
 */

/**
 * @typedef {Object} ExpressNextFunction
 * @property {function(): void} next - Passes control to the next middleware
 */

/** @type {module:sqlite.Database} */
let db;

/**
 * Middleware to initialize SQLite database connection
 * @async
 * @param {ExpressRequest} req - Express request object
 * @param {ExpressResponse} res - Express response object
 * @param {ExpressNextFunction} next - Next middleware function
 */
router.use(async (req, res, next) => {
	if (!db) {
		const sqlite3 = require("sqlite3").verbose();
		const { open } = require("sqlite");
		db = await open({
			filename: "./database.db",
			driver: sqlite3.Database,
		});
	}
	next();
});

/**
 * Add a new idea
 * @route POST /ideas
 * @async
 * @param {ExpressRequest} req - Express request object
 * @param {ExpressResponse} res - Express response object
 * @returns {Promise<void>}
 * @throws {Error} When database operation fails
 */
router.post("/", authenticateToken, async (req, res) => {
	const { title, description } = req.body;
	if (!title || !description) {
		return res
			.status(400)
			.json({ error: "Title and description are required." });
	}

	try {
		await db.run(
			`INSERT INTO ideas (title, description, status, author_id) VALUES (?, ?, 'pending', ?)`,
			[title, description, req.user.id]
		);
		res.status(201).json({ message: "Idea submitted for approval." });
	} catch (err) {
		res.status(500).json({ error: "Failed to submit idea." });
	}
});

/**
 * Get all approved ideas
 * @route GET /ideas
 * @async
 * @param {ExpressRequest} req - Express request object
 * @param {ExpressResponse} res - Express response object
 * @returns {Promise<void>}
 * @throws {Error} When database operation fails
 */
router.get("/", async (req, res) => {
	try {
		const ideas = await db.all(
			`SELECT i.*, u.username as author_name 
			 FROM ideas i 
			 JOIN users u ON i.author_id = u.id 
			 WHERE i.status = 'approved'`
		);
		res.json(ideas);
	} catch (err) {
		console.error("Error fetching ideas:", err);
		res.status(500).json({ error: "Failed to fetch ideas." });
	}
});

/**
 * Update an existing idea
 * @route PUT /ideas/:id
 * @async
 * @param {ExpressRequest} req - Express request object
 * @param {ExpressResponse} res - Express response object
 * @returns {Promise<void>}
 * @throws {Error} When database operation fails or unauthorized access
 */
router.put("/:id", authenticateToken, async (req, res) => {
	const { id } = req.params;
	const { title, description } = req.body;

	if (!title && !description) {
		return res.status(400).json({
			error: "At least one field (title or description) is required.",
		});
	}

	try {
		const idea = await db.get(`SELECT * FROM ideas WHERE id = ?`, [id]);

		if (!idea) {
			return res.status(404).json({ error: "Idea not found." });
		}

		if (idea.author_id !== req.user.id) {
			return res
				.status(403)
				.json({ error: "You are not authorized to edit this idea." });
		}

		await db.run(
			`UPDATE ideas SET title = ?, description = ?, status = 'pending' WHERE id = ?`,
			[title || idea.title, description || idea.description, id]
		);

		res.json({ message: "Idea updated and set for re-approval." });
	} catch (err) {
		console.error("Error updating idea:", err);
		res.status(500).json({ error: "Failed to update idea." });
	}
});

/**
 * Delete an existing idea
 * @route DELETE /ideas/:id
 * @async
 * @param {ExpressRequest} req - Express request object
 * @param {ExpressResponse} res - Express response object
 * @returns {Promise<void>}
 * @throws {Error} When database operation fails or unauthorized access
 */
router.delete("/:id", authenticateToken, async (req, res) => {
	const { id } = req.params;

	try {
		const idea = await db.get(`SELECT * FROM ideas WHERE id = ?`, [id]);

		if (!idea) {
			return res.status(404).json({ error: "Idea not found." });
		}

		if (idea.author_id !== req.user.id) {
			return res
				.status(403)
				.json({ error: "You are not authorized to delete this idea." });
		}

		await db.run(`DELETE FROM ideas WHERE id = ?`, [id]);
		res.json({ message: "Idea deleted successfully." });
	} catch (err) {
		res.status(500).json({ error: "Failed to delete idea." });
	}
});

/**
 * Express router for ideas endpoints
 * @type {express.Router}
 */
module.exports = router;
