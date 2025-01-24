// jsdoc
const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();

// jsdoc
app.use(cors());
app.use(express.json());

// jsdoc
const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: "./database.sqlite",
	logging: false,
});

// jsdoc
const User = sequelize.define("User", {
	username: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
		validate: {
			len: [3, 30],
			isAlphanumeric: true,
		},
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
		validate: {
			isEmail: true,
		},
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	role: {
		type: DataTypes.ENUM("user", "admin"),
		defaultValue: "user",
	},
});

const Idea = sequelize.define("Idea", {
	title: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: {
			async isUnique(value) {
				const idea = await Idea.findOne({
					where: {
						title: sequelize.where(
							sequelize.fn("LOWER", sequelize.col("title")),
							sequelize.fn("LOWER", value)
						),
					},
				});
				if (idea) {
					throw new Error(
						"An idea with this title already exists in the system"
					);
				}
			},
		},
	},
	description: {
		type: DataTypes.TEXT,
		allowNull: false,
		validate: {
			async isUnique(value) {
				const idea = await Idea.findOne({
					where: {
						description: sequelize.where(
							sequelize.fn("LOWER", sequelize.col("description")),
							sequelize.fn("LOWER", value)
						),
					},
				});
				if (idea) {
					throw new Error(
						"An idea with this description already exists in the system"
					);
				}
			},
		},
	},
	status: {
		type: DataTypes.ENUM("pending", "approved", "rejected"),
		defaultValue: "pending",
	},
});

// jsdoc
User.hasMany(Idea);
Idea.belongsTo(User);

// jsdoc
const auth = async (req, res, next) => {
	try {
		const token = req.header("Authorization").replace("Bearer ", "");
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findByPk(decoded.id);

		if (!user) throw new Error();

		req.user = user;
		req.token = token;
		next();
	} catch (error) {
		res.status(401).json({ error: "Please authenticate" });
	}
};

// jsdoc
const adminAuth = async (req, res, next) => {
	try {
		if (req.user.role !== "admin") {
			throw new Error();
		}
		next();
	} catch (error) {
		res.status(403).json({ error: "Admin access required" });
	}
};

// jsdoc
app.post("/api/register", async (req, res) => {
	try {
		const { username, email, password, isAdmin } = req.body;

		// Check for existing username
		const existingUserByUsername = await User.findOne({ where: { username } });
		if (existingUserByUsername) {
			return res.status(400).json({ error: "Username already exists" });
		}

		// Check for existing email
		const existingUserByEmail = await User.findOne({ where: { email } });
		if (existingUserByEmail) {
			return res.status(400).json({ error: "Email already exists" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user with role based on isAdmin flag
		const user = await User.create({
			username,
			email,
			password: hashedPassword,
			role: isAdmin ? "admin" : "user",
		});

		const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
		res.status(201).json({ user, token });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// jsdoc
app.post("/api/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ where: { email } });

		if (!user || !(await bcrypt.compare(password, user.password))) {
			throw new Error("Invalid credentials");
		}

		const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
		res.json({ user, token });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// jsdoc
app.get("/api/validate-token", async (req, res) => {
	try {
		const token = req.query.token;
		if (!token) {
			return res.status(400).json({ error: "Token is required" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findByPk(decoded.id);

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		res.json({
			username: user.username,
			email: user.email,
			role: user.role,
		});
	} catch (error) {
		res.status(401).json({ error: "Invalid token" });
	}
});

// jsdoc
app.post("/api/ideas", auth, async (req, res) => {
	try {
		const { title, description } = req.body;

		if (!title || !description) {
			return res.status(400).json({
				error: "Title and description are required",
				type: "ValidationError",
			});
		}

		// Function to calculate similarity between two strings
		const calculateSimilarity = (str1, str2) => {
			const s1 = str1.toLowerCase().replace(/\s+/g, " ").trim();
			const s2 = str2.toLowerCase().replace(/\s+/g, " ").trim();

			if (s1 === s2) return 1;

			const words1 = new Set(s1.split(" "));
			const words2 = new Set(s2.split(" "));
			const intersection = new Set([...words1].filter((x) => words2.has(x)));
			const union = new Set([...words1, ...words2]);

			return intersection.size / union.size;
		};

		// Check for similar ideas across all users
		const existingIdeas = await Idea.findAll({
			raw: true,
		});

		const SIMILARITY_THRESHOLD = 0.8;

		for (const existingIdea of existingIdeas) {
			const titleSimilarity = calculateSimilarity(title, existingIdea.title);
			if (titleSimilarity > SIMILARITY_THRESHOLD) {
				return res.status(400).json({
					error:
						"An idea with a very similar title already exists in the system",
					type: "SimilarityError",
				});
			}

			const descriptionSimilarity = calculateSimilarity(
				description,
				existingIdea.description
			);
			if (descriptionSimilarity > SIMILARITY_THRESHOLD) {
				return res.status(400).json({
					error:
						"An idea with a very similar description already exists in the system",
					type: "SimilarityError",
				});
			}
		}

		const idea = await Idea.create({
			title,
			description,
			UserId: req.user.id,
		});

		res.status(201).json(idea);
	} catch (error) {
		res.status(400).json({
			error: error.message,
			type: error.name,
		});
	}
});

// jsdoc
app.get("/api/ideas", auth, async (req, res) => {
	try {
		const ideas = await Idea.findAll({
			where: {
				[Sequelize.Op.or]: [{ status: "approved" }, { UserId: req.user.id }],
			},
			include: [
				{
					model: User,
					attributes: ["email"],
				},
			],
		});
		res.json(ideas);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// jsdoc
app.put("/api/ideas/:id", auth, async (req, res) => {
	try {
		const idea = await Idea.findOne({
			where: {
				id: req.params.id,
				UserId: req.user.id,
				status: "pending",
			},
		});

		if (!idea) throw new Error("Idea not found or unauthorized");

		await idea.update(req.body);
		res.json(idea);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// jsdoc
app.get("/api/ideas/approved", async (req, res) => {
	try {
		const approvedIdeas = await Idea.findAll({
			where: { status: "approved" },
			include: [
				{
					model: User,
					attributes: ["id", "username", "email"], // Added email to attributes
				},
			],
			order: [["createdAt", "DESC"]],
		});
		res.json(approvedIdeas);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// jsdoc
app.get("/api/ideas/search", async (req, res) => {
	try {
		const { query } = req.query;

		if (!query) {
			return res.status(400).json({ error: "Search query is required" });
		}

		const searchResults = await Idea.findAll({
			where: {
				status: "approved",
				[Sequelize.Op.or]: [
					{
						title: {
							[Sequelize.Op.like]: `%${query}%`,
						},
					},
					{
						description: {
							[Sequelize.Op.like]: `%${query}%`,
						},
					},
					{
						"$User.username$": {
							[Sequelize.Op.like]: `%${query}%`,
						},
					},
				],
			},
			include: [
				{
					model: User,
					attributes: ["id", "username", "email"],
				},
			],
			order: [["createdAt", "DESC"]],
		});

		res.json(searchResults);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// jsdoc
app.delete("/api/ideas/:id", auth, async (req, res) => {
	try {
		const deleted = await Idea.destroy({
			where: {
				id: req.params.id,
				UserId: req.user.id,
			},
		});

		if (!deleted) throw new Error("Idea not found or unauthorized");
		res.json({ message: "Idea deleted" });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// jsdoc
app.get("/api/admin/ideas", auth, adminAuth, async (req, res) => {
	try {
		const ideas = await Idea.findAll({
			include: [
				{
					model: User,
					attributes: ["email"],
				},
			],
		});
		res.json(ideas);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// jsdoc
app.put("/api/admin/ideas/:id/status", auth, adminAuth, async (req, res) => {
	try {
		const { status } = req.body;
		const idea = await Idea.findByPk(req.params.id);
		if (!idea) throw new Error("Idea not found");

		await idea.update({ status });
		res.json(idea);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// jsdoc
app.get("/api/admin/users", auth, adminAuth, async (req, res) => {
	try {
		const users = await User.findAll({
			where: { role: "user" },
		});
		res.json(users);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// jsdoc
app.delete("/api/admin/users/:id", auth, adminAuth, async (req, res) => {
	try {
		await Idea.destroy({ where: { UserId: req.params.id } });
		await User.destroy({ where: { id: req.params.id } });
		res.json({ message: "User and associated ideas deleted" });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// jsdoc
app.post("/api/admin/users/bulk-delete", auth, adminAuth, async (req, res) => {
	try {
		const { userIds } = req.body;
		await Idea.destroy({ where: { UserId: userIds } });
		await User.destroy({ where: { id: userIds } });
		res.json({ message: "Users and associated ideas deleted" });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// jsdoc
app.delete("/api/admin/ideas/:id", auth, adminAuth, async (req, res) => {
	try {
		const { id } = req.params;
		const idea = await Idea.findByPk(id);
		if (!idea) {
			return res.status(404).json({ error: "Idea not found" });
		}
		await idea.destroy();
		res.json({ message: "Idea deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// jsdoc
app.get("/api/admin/stats/users", auth, adminAuth, async (req, res) => {
	try {
		const totalUsers = await User.count();
		const totalAdmins = await User.count({ where: { role: "admin" } });
		res.json({ totalUsers, totalAdmins });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// jsdoc
app.get("/api/admin/stats/ideas", auth, adminAuth, async (req, res) => {
	try {
		const totalIdeas = await Idea.count();
		const ideasByStatus = await Idea.findAll({
			attributes: [
				"status",
				[Sequelize.fn("COUNT", Sequelize.col("status")), "count"],
			],
			group: ["status"],
		});
		res.json({ totalIdeas, ideasByStatus });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// jsdoc
app.get("/api/admin/stats/ideas-status", auth, adminAuth, async (req, res) => {
	try {
		const approvedCount = await Idea.count({ where: { status: "approved" } });
		const pendingCount = await Idea.count({ where: { status: "pending" } });
		res.json({ approvedCount, pendingCount });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// jsdoc
app.post("/api/groq", async (req, res) => {
	try {
		const { text } = req.body;

		const response = await fetch(
			"https://api.groq.com/openai/v1/chat/completions",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.AI_TOKEN}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: "llama-3.3-70b-versatile",
					messages: [
						{
							role: "user",
							content: text,
						},
					],
				}),
			}
		);

		if (!response.ok) {
			throw new Error(`Groq AI API error: ${response.statusText}`);
		}

		const data = await response.json();
		res.json({ answer: data.choices[0].message.content });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// jsdoc
(async () => {
	try {
		await sequelize.sync();
		console.log("Database synchronized");

		const PORT = process.env.PORT || 5000;
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Unable to start server:", error);
	}
})();
