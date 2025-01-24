// jsdoc
const sqlite3 = require("sqlite3").verbose();
// jsdoc
const { open } = require("sqlite3");

// jsdoc
const openDb = async () => {
	return open({
		filename: "./database.db",
		driver: sqlite3.Database,
	});
};

module.exports = { openDb };
