<script>
	/**
	 * @fileoverview Admin route component that redirects to the dashboard
	 * @module AdminRoute
	 */

	import { onMount } from "svelte";
	import { goto } from "$app/navigation";

	/**
	 * Handles component initialization and redirects to admin dashboard
	 * @function
	 * @returns {void}
	 */
	onMount(() => {
		goto("/admin/dashboard");
	});
</script>
