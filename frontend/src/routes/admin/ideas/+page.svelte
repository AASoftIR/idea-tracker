<script>
	import { user } from "../../../stores/user";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { fade, blur } from "svelte/transition";
	import { ideas } from "../../../stores/admin";
	import { formatDate } from "$lib/index";

	/**
	 * Fetches ideas and sets them in the store.
	 * @async
	 * @function fetchIdeas
	 * @returns {Promise<void>}
	 */
	async function fetchIdeas() {
		try {
			const response = await fetch("http://localhost:5000/api/admin/ideas", {
				headers: {
					Authorization: `Bearer ${localStorage.token}`,
				},
			});
			ideas.set(await response.json());
		} catch (error) {
			console.error("Error fetching ideas:", error);
		}
	}

	/**
	 * Approves an idea by updating its status.
	 * @async
	 * @function approveIdea
	 * @param {string|number} ideaId - The ID of the idea to approve.
	 * @returns {Promise<void>}
	 */
	async function approveIdea(ideaId) {
		try {
			await fetch(`http://localhost:5000/api/admin/ideas/${ideaId}/status`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.token}`,
				},
				body: JSON.stringify({ status: "approved" }),
			});
			await fetchIdeas();
		} catch (error) {
			console.error("Error approving idea:", error);
		}
	}

	/**
	 * Denies an idea by updating its status.
	 * @async
	 * @function denyIdea
	 * @param {string|number} ideaId - The ID of the idea to deny.
	 * @returns {Promise<void>}
	 */
	async function denyIdea(ideaId) {
		try {
			await fetch(`http://localhost:5000/api/admin/ideas/${ideaId}/status`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.token}`,
				},
				body: JSON.stringify({ status: "denied" }),
			});
			await fetchIdeas();
		} catch (error) {
			console.error("Error denying idea:", error);
		}
	}

	/**
	 * Deletes an idea.
	 * @async
	 * @function deleteIdea
	 * @param {string|number} ideaId - The ID of the idea to delete.
	 * @returns {Promise<void>}
	 */
	async function deleteIdea(ideaId) {
		try {
			await fetch(`http://localhost:5000/api/admin/ideas/${ideaId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${localStorage.token}`,
				},
			});
			await fetchIdeas();
		} catch (error) {
			console.error("Error deleting idea:", error);
		}
	}

	onMount(async () => {
		if (!user || $user.user.role !== "admin") {
			goto("/login");
		}
		await fetchIdeas();
	});
</script>

<main
	class="container mx-auto max-w-[70%] mt-12 overflow-x-scroll"
	in:fade
	out:fade
>
	<h1 class="text-2xl font-mono mb-8">Manage Ideas</h1>
	<table class="table w-full mx-auto !text-2xl">
		<thead>
			<tr class="text-center">
				<th>Title</th>
				<th>Description</th>
				<th>Status</th>
				<th>Creation Date</th>
				<th>Edited Date</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each $ideas as idea}
				<tr class="text-center" in:blur out:blur>
					<td>{idea.title}</td>
					<td>{idea.description}</td>
					<td
						class:text-green-500={idea.status == "approved"}
						class:text-red-500={idea.status == "pending"}>{idea.status}</td
					>
					<td class="font-mono tracking-wide text-lg"
						>{formatDate(idea.createdAt)}</td
					>
					<td class="font-mono tracking-wide text-lg"
						>{formatDate(idea.updatedAt)}</td
					>

					<td>
						<button
							class="btn btn-success"
							on:click={() => approveIdea(idea.id)}>Approve</button
						>
						<button class="btn btn-warning" on:click={() => denyIdea(idea.id)}
							>Deny</button
						>
						<button class="btn btn-error" on:click={() => deleteIdea(idea.id)}
							>Delete</button
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</main>
