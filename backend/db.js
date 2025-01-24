/**
 * Description placeholder
 *
 * @type {*}
 */
const sqlite3 = require("sqlite3").verbose();
/**
 * Description placeholder
 *
 * @type {*}
 */
const { open } = require("sqlite3");

/**
 * Description placeholder
 *
 * @async
 * @returns {unknown}
 */
const openDb = async () => {
	return open({
		filename: "./database.db",
		driver: sqlite3.Database,
	});
};

module.exports = { openDb };
