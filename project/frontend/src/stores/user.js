import { writable } from "svelte/store";

// jsdoc

// jsdoc
export const user = writable({
	token: "123",
	user: {
		username: "",
		email: "",
		role: "",
	},
});
