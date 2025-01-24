// jsdoc

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { openDb } = require("../db");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");

// jsdoc
router.post("/register", async (req, res) => {
	const { username, password } = req.body;

	// Input validation
	if (!username || !password) {
		return res
			.status(400)
			.json({ error: "Username and password are required" });
	}
	if (password.length < 6) {
		return res
			.status(400)
			.json({ error: "Password must be at least 6 characters" });
	}

	const db = await openDb();
	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		await db.run(
			"INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
			[username, hashedPassword, "user"]
		);
		res.status(201).json({ message: "User registered successfully" });
	} catch (err) {
		console.error("Registration error:", err);
		if (err.message.includes("UNIQUE constraint failed")) {
			return res.status(409).json({ error: "Username already exists" });
		}
		res.status(400).json({ error: "Registration failed" });
	} finally {
		await db.close();
	}
});

// jsdoc
router.post("/login", async (req, res) => {
	const { username, password } = req.body;

	// Input validation
	if (!username || !password) {
		return res
			.status(400)
			.json({ error: "Username and password are required" });
	}

	const db = await openDb();
	try {
		const user = await db.get("SELECT * FROM users WHERE username = ?", [
			username,
		]);

		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const token = jwt.sign(
			{ id: user.id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "1h" }
		);

		res.json({
			token,
			user: {
				id: user.id,
				username: user.username,
				role: user.role,
			},
		});
	} catch (err) {
		console.error("Login error:", err);
		res.status(500).json({ error: "Internal server error" });
	} finally {
		await db.close();
	}
});

// jsdoc

// jsdoc
module.exports = { router, authenticateToken };
