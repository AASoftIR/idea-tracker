<script>
	// jsdoc

	// jsdoc

	// jsdoc
	import { user } from "../../stores/user";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { slide } from "svelte/transition";

	// jsdoc
	let { children } = $props();

	// jsdoc
	onMount(() => {
		if (!user || $user.user.role !== "admin") {
			goto("/login");
		}
	});
</script>

<!-- Main layout container with slide transitions -->
<main class="flex flex-row min-h-screen w-screen" in:slide out:slide>
	<!-- Drawer component for navigation sidebar -->
	<div class="drawer lg:drawer-open w-fit">
		<input id="my-drawer-2" type="checkbox" class="drawer-toggle" />

		<div class="drawer-side">
			<label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"
			></label>
			<!-- Navigation menu -->
			<ul
				class="menu bg-base-200 text-base-content min-h-full w-80 p-4 !text-2xl"
			>
				<li><a href="/admin/dashboard">Dashboard</a></li>
				<div class="divider"></div>
				<li><a href="/admin/users">Manage Users</a></li>
				<div class="divider"></div>
				<li><a href="/admin/ideas">Manage Ideas</a></li>
			</ul>
		</div>
	</div>

	<!-- Render child components -->
	{@render children()}
</main>
