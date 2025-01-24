<script>
	import { fade, blur } from "svelte/transition";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { browser } from "$app/environment";
	import { auth, ideas } from "../../stores/auth";
	import { user } from "../../stores/user";
	import { ai } from "$lib/index";

	// jsdoc

	// jsdoc

	// jsdoc

	// jsdoc
	let title = "";
	// jsdoc
	let description = "";
	// jsdoc
	let error = "";
	// jsdoc
	let loading = false;
	// jsdoc
	let toast = false;
	// jsdoc
	let toastMessage = "hi";
	// jsdoc
	let selectedIdea = null;

	// jsdoc
	function validateForm() {
		if (!title || !description) {
			error = "Both fields are required";
			return false;
		}
		error = "";
		return true;
	}

	// jsdoc
	async function rewriteIdea(type, text) {
		return await ai(
			`please rewrite this idea ${type} and do not change the meaning. Please give JUST the rewritten version no explanation: ${text}`
		);
	}

	// jsdoc
	async function rewriteTitleAndDescription() {
		let t = await rewriteIdea("title", title);
		let d = await rewriteIdea("description", description);
		title = t.answer.replaceAll('"', "");
		description = d.answer.replaceAll('"', "");
	}

	// jsdoc
	function showToast(message, duration = 2000) {
		toastMessage = message;
		toast = true;
		setTimeout(() => {
			toast = false;
			toastMessage = false;
		}, duration);
	}

	// jsdoc
	async function addIdea() {
		if (!validateForm()) return;

		loading = true;
		try {
			const response = await fetch("http://localhost:5000/api/ideas", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${browser ? localStorage.getItem("token") : user.token}`,
				},
				body: JSON.stringify({ title, description }),
			});
			const data = await response.json();

			if (data.error) {
				showToast(data.error);
			} else {
				ideas.update((ideas) => [...ideas, data]);
				showToast("Idea added successfully");
				title = "";
				description = "";
			}
		} catch (err) {
			showToast(err.message);
		} finally {
			loading = false;
		}
	}

	// jsdoc
	async function removeIdea(id) {
		loading = true;
		try {
			const response = await fetch(`http://localhost:5000/api/ideas/${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${browser ? localStorage.getItem("token") : user.token}`,
				},
			});
			const data = await response.json();

			if (data.error) {
				showToast(data.error);
			} else {
				ideas.update((ideas) => ideas.filter((idea) => idea.id !== id));
				showToast("Idea removed successfully");
			}
		} catch (err) {
			showToast(err.message);
		} finally {
			loading = false;
		}
	}

	// jsdoc
	async function updateIdea() {
		if (!validateForm() || !selectedIdea) return;

		loading = true;
		try {
			const response = await fetch(
				`http://localhost:5000/api/ideas/${selectedIdea.id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${browser ? localStorage.getItem("token") : user.token}`,
					},
					body: JSON.stringify({ title, description }),
				}
			);
			const data = await response.json();

			if (data.error) {
				showToast(data.error);
			} else {
				ideas.update((ideas) =>
					ideas.map((idea) => (idea.id === selectedIdea.id ? data : idea))
				);
				showToast("Idea updated successfully");
				title = "";
				description = "";
				selectedIdea = null;
			}
		} catch (err) {
			showToast(err.message);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		if (!auth) {
			localStorage.removeItem("token");
			auth.set(false);
			user.set(null);
			setTimeout(() => goto("/login"), 100);
		} else if ($user?.user?.role === "admin") {
			goto("/admin/dashboard");
		} else {
			const token = browser ? localStorage.getItem("token") : user.token;
			fetch("http://localhost:5000/api/ideas", {
				headers: { Authorization: `Bearer ${token}` },
			})
				.then((res) => res.json())
				.then((data) => ideas.set(data))
				.catch(console.error);
		}
	});
</script>

<main in:fade>
	{#if toast}
		<div class="toast !z-[10000] fixed right-6 bottom-20" in:fade out:fade>
			<div class="alert bg-red-600 *:text-3xl">
				<span>{toastMessage}</span>
			</div>
		</div>
	{/if}
	{#if loading}
		<div
			class="w-screen h-screen bg-black/70 flex justify-center items-center z-[1000]"
		>
			<span class="loading loading-dots loading-lg"></span>
		</div>
	{:else}
		<div class="container mx-auto my-16 max-w-[70vw]">
			<!-- ...existing code... -->
			<button
				class="btn"
				on:click={() => {
					selectedIdea = null;
					title = "";
					description = "";
					my_modal_1.showModal();
				}}>Add New Idea</button
			>
			<dialog id="my_modal_1" class="modal" in:fade out:fade>
				<div class="modal-box">
					<h3 class="text-lg font-bold">
						{selectedIdea ? "Update Idea" : "Add New Idea"}
					</h3>
					<div class="py-4">
						<input
							type="text"
							placeholder="Title"
							bind:value={title}
							class="input input-bordered w-full mb-4 text-2xl text-white font-bold"
						/>
						<textarea
							placeholder="Description"
							bind:value={description}
							class="textarea textarea-bordered w-full mb-4 text-2xl text-white font-bold"
						></textarea>
						{#if error}
							<p class="text-red-500">{error}</p>
						{/if}
					</div>
					<div class="modal-action">
						<button class="btn" on:click={selectedIdea ? updateIdea : addIdea}
							>{selectedIdea ? "Update" : "Add"}</button
						>
						<button class="btn" on:click={rewriteTitleAndDescription}
							>AI🤖</button
						>
						<form method="dialog">
							<button class="btn">Close</button>
						</form>
					</div>
				</div>
			</dialog>
			<div class="overflow-x-auto">
				<table class="table !text-2xl">
					<!-- head -->
					<thead>
						<tr>
							<th>Title</th>
							<th>Description</th>
							<th>Status</th>
							<th>Creation Date</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each $ideas as idea}
							<tr in:blur out:blur>
								<td>{idea.title}</td>
								<td>{idea.description}</td>
								<td
									class:text-red-500={idea.status == "pending"}
									class:text-green-500={idea.status == "approved"}
									>{idea.status}</td
								>
								<td>{idea.createdAt}</td>
								<td>
									{#if idea.status === "pending"}
										<button
											class="btn"
											on:click={() => {
												selectedIdea = idea;
												title = idea.title;
												description = idea.description;
												my_modal_1.showModal();
											}}>Edit</button
										>
									{/if}

									<button class="btn" on:click={() => removeIdea(idea.id)}
										>Remove</button
									>
								</td>
							</tr>
						{/each}
						{#if $ideas.length === 0}
							<tr>
								<td colspan="5" class="text-center">No ideas found</td>
							</tr>
						{/if}
					</tbody>
					<!-- foot -->
					<tfoot>
						<tr>
							<th>Title</th>
							<th>Description</th>
							<th>Status</th>
							<th>Creation Date</th>
							<th>Actions</th>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	{/if}
</main>
