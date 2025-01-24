import { writable } from "svelte/store";

/**
 * @typedef {Object} User
 * @property {string} token
 * @property {Object} user
 * @property {string} user.username
 * @property {string} user.email
 * @property {string} user.role
 */

/** @type {module:svelte/store.Writable<User>} */
export const user = writable({
	token: "123",
	user: {
		username: "",
		email: "",
		role: "",
	},
});
