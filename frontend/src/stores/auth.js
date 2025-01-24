import { writable } from "svelte/store";

/**
 * @typedef {Object} Idea
 * @property {string} title
 * @property {number} id
 * @property {string} description
 * @property {string} status
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/** @type {module:svelte/store.Writable<boolean>} */
export const auth = writable(false);

/** @type {module:svelte/store.Writable<Idea[]>} */
export const ideas = writable([]);
