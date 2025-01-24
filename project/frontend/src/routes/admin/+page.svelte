<script>
	// jsdoc

	import { onMount } from "svelte";
	import { goto } from "$app/navigation";

	// jsdoc
	onMount(() => {
		goto("/admin/dashboard");
	});
</script>
