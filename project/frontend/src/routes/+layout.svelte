<script>
	// jsdoc

	import "../app.css";
	import { browser } from "$app/environment";
	import { auth } from "../stores/auth";
	import { user } from "../stores/user";
	import { onMount } from "svelte";
	import { onNavigate } from "$app/navigation";

	let { children } = $props();

	// jsdoc
	const API_BASE_URL = "http://localhost:5000/api";
	
	// jsdoc
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	// jsdoc
	const validateToken = async () => {
		if (!browser) return;

		try {
			const token = localStorage.getItem("token");
			const response = await fetch(
				`${API_BASE_URL}/validate-token?token=${token}`
			);
			const data = await response.json();

			if (data.error) {
				auth.set(false);
				return;
			}

			user.set({
				token: data.token,
				user: data,
			});
			auth.set(true);
		} catch (err) {
			console.error("Token validation failed:", err);
			auth.set(false);
		}
	};

	onMount(validateToken);
</script>

<svelte:head>
	<title>IDEA App🖊️</title>
</svelte:head>
<div class="drawer">
	<input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col">
		<!-- Navbar -->
		<div
			class="navbar bg-base-300 w-full border-b-[1px] border-white/60 *:!font-['Roboto']"
		>
			<div class="flex-none lg:hidden">
				<label
					for="my-drawer-3"
					aria-label="open sidebar"
					class="btn btn-square btn-ghost"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="inline-block h-6 w-6 stroke-current"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						></path>
					</svg>
				</label>
			</div>
			<div class="mx-2 flex-1 px-2">
				<a href="./"
					><img src="/favicon.png" alt="icon" class="w-20 h-auto" /></a
				>
			</div>
			<div class="hidden flex-none lg:block">
				<ul class="menu menu-horizontal text-white text-lg uppercase">
					<!-- Navbar menu content here -->
					{#if $user && $user.user && $user.user.role === "admin"}
						<li><a href="/admin/dashboard">Admin Dashboard</a></li>
										{:else}
					<li><a href="/dashboard">Dashboard</a></li>
					{/if}
					{#if $auth}
						<li><a href="/logout">Logout</a></li>
					{:else}
						<li><a href="/login">Login</a></li>
					{/if}
				</ul>
			</div>
		</div>
	</div>
	<div class="drawer-side">
		<label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"
		></label>
		<ul class="menu bg-base-200 min-h-full w-80 p-4 text-lg">
			<!-- Sidebar content here -->
			{#if $user && $user.user && $user.user.role === "admin"}
				<li><a href="/admin/dashboard">Admin Dashboard</a></li>
				<div class="divider"></div>
				<li><a href="/admin/users">Manage Users</a></li>
				<div class="divider"></div>
				<li><a href="/admin/ideas">Manage Ideas</a></li>
				<div class="divider"></div>
				{:else}
					<li><a href="/dashboard">Dashboard</a></li>
					<div class="divider"></div>

			{/if}
			{#if $auth}


				<li><a href="/logout">Logout</a></li>
				<div class="divider"></div>
			{:else}
				<li><a href="/login">Login</a></li>
				<div class="divider"></div>
			{/if}
		</ul>
	</div>
</div>
{@render children()}

<style>
	/* Add any component-specific styles here */
</style>
