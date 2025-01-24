import { writable } from "svelte/store";

/**
 * @typedef {Object} AdminStore
 * @template T
 * @property {function(T): void} set Sets the value
 * @property {function(function(T): T): void} update Updates the value
 * @property {function(function(T): void): function(): void} subscribe Subscribes to value changes
 */

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
export const ideas = writable([]);
