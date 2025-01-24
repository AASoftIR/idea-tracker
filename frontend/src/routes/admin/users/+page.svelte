<script>
	import { fade, blur } from "svelte/transition";
	import { user } from "../../../stores/user";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { formatDate } from "$lib/index";

	/** @type {Array<Object>} Array of user objects */
	let users = [];
	/** @type {boolean} Loading state for async operations */
	let isLoading = false;
	/** @type {string|null} Error message to display */
	let errorMessage = null;

	/**
	 * Lifecycle function to check admin access and fetch initial data
	 * @return {Promise<void>}
	 */
	onMount(async () => {
		if (!user || $user.user.role !== "admin") {
			goto("/login");
			return;
		}
		await fetchUsers();
	});

	/**
	 * Fetches all users from the API
	 * @async
	 * @return {Promise<void>}
	 */
	async function fetchUsers() {
		isLoading = true;
		errorMessage = null;
		try {
			const response = await fetch("http://localhost:5000/api/admin/users", {
				headers: {
					Authorization: `Bearer ${localStorage.token}`,
				},
			});
			if (!response.ok) throw new Error("Failed to fetch users");
			users = await response.json();
		} catch (error) {
			console.error("Error fetching users:", error);
			errorMessage = "Failed to load users. Please try again.";
		} finally {
			isLoading = false;
		}
	}

	/**
	 * Deletes a single user
	 * @async
	 * @param {string} userId - The ID of the user to delete
	 * @return {Promise<void>}
	 */
	async function deleteUser(userId) {
		isLoading = true;
		errorMessage = null;
		try {
			const response = await fetch(
				`http://localhost:5000/api/admin/users/${userId}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${localStorage.token}`,
					},
				}
			);
			if (!response.ok) throw new Error("Failed to delete user");
			await fetchUsers();
		} catch (error) {
			console.error("Error deleting user:", error);
			errorMessage = "Failed to delete user. Please try again.";
		} finally {
			isLoading = false;
		}
	}

	/**
	 * Deletes multiple selected users
	 * @async
	 * @return {Promise<void>}
	 */
	async function deleteBulk() {
		const selectedUserIds = users
			.filter((user) => user.selected)
			.map((user) => user.id);
		if (selectedUserIds.length === 0) {
			errorMessage = "Please select users to delete";
			return;
		}

		isLoading = true;
		errorMessage = null;
		try {
			const response = await fetch(
				"http://localhost:5000/api/admin/users/bulk-delete",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.token}`,
					},
					body: JSON.stringify({ userIds: selectedUserIds }),
				}
			);
			if (!response.ok) throw new Error("Failed to delete users");
			await fetchUsers();
		} catch (error) {
			console.error("Error bulk deleting users:", error);
			errorMessage = "Failed to delete selected users. Please try again.";
		} finally {
			isLoading = false;
		}
	}

	/**
	 * Toggles selection state for all users
	 * @param {Event} event - The change event from checkbox
	 * @return {void}
	 */
	function toggleSelectAll(event) {
		const isChecked = event.target.checked;
		users = users.map((user) => ({ ...user, selected: isChecked }));
	}
</script>

<main
	class="container mx-auto max-w-[70%] mt-12 overflow-x-scroll"
	in:fade
	out:fade
>
	<h1 class="text-2xl font-mono mb-8">Manage Users</h1>

	{#if errorMessage}
		<div class="alert alert-error mb-4" transition:blur>
			{errorMessage}
		</div>
	{/if}

	{#if isLoading}
		<div class="flex justify-center py-4" transition:fade>
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else}
		<table class="table w-full !text-2xl table-md">
			<thead>
				<tr>
					<th><input type="checkbox" on:change={toggleSelectAll} /></th>
					<th>Username</th>
					<th>Email</th>
					<th>Joined At</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each users as user}
					<tr in:blur out:blur>
						<td><input type="checkbox" bind:checked={user.selected} /></td>
						<td>{user.username}</td>
						<td>{user.email}</td>
						<td class="font-mono tracking-wide text-lg"
							>{formatDate(user.createdAt)}</td
						>
						<td>
							<button
								class="btn btn-error"
								on:click={() => deleteUser(user.id)}
								disabled={isLoading}
							>
								Delete
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<button
			class="btn btn-error mt-4"
			on:click={deleteBulk}
			disabled={isLoading}
		>
			Delete Selected
		</button>
	{/if}
</main>
