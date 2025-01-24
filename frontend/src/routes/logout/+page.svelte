<script>
	/**
	 * @file Logout page component that handles user logout process
	 */

	import { user } from "./../../stores/user.js";
	import { goto } from "$app/navigation";
	import { browser } from "$app/environment";
	import { onMount } from "svelte";
	import { auth } from "../../stores/auth";

	/**
	 * Handles the logout process by removing user data and redirecting
	 * @function handleLogout
	 * @returns {void}
	 */
	const handleLogout = () => {
		try {
			if (browser) {
				localStorage.removeItem("token");
			}
			auth.set(false);
			user.set(null);
		} catch (error) {
			console.error("Error during logout:", error);
		}
	};

	/**
	 * Component lifecycle hook that executes when component is mounted
	 * Initiates the logout process and redirects to home page
	 * @returns {void}
	 */
	onMount(() => {
		handleLogout();
		setTimeout(() => {
			goto("/").catch((error) => {
				console.error("Navigation error:", error);
			});
		}, 100);
	});
</script>

<div class="logout-page">
	<h1>Logging out...</h1>
</div>

<style>
	.logout-page {
		text-align: center;
		padding: 2rem;
	}
</style>
