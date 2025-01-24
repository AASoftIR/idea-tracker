<script>
	import { browser } from "$app/environment";
	import { onMount } from "svelte";

	/**
	 * @typedef {Object} User
	 * @property {string} username - The username of the user
	 */

	/**
	 * @typedef {Object} Idea
	 * @property {string} title - The title of the idea
	 * @property {string} description - The detailed description of the idea
	 * @property {User} User - The user who created the idea
	 */

	/** @type {Array<Idea>} */
	let approvedIdeas = [];

	/**
	 * Checks if the user is currently authenticated
	 * @returns {boolean} True if user is authenticated, false otherwise
	 */
	function isAuthenticated() {
		const token = browser ? localStorage.getItem("token") : "";
		return Boolean(token && token !== "invalid");
	}

	/**
	 * Fetches all approved ideas from the server
	 * @async
	 * @throws {Error} Throws an error if the network request fails
	 * @returns {Promise<void>} Resolves when the fetch operation is complete
	 */
	async function fetchApprovedIdeas() {
		approvedIdeas=[]
		try {
			const response = await fetch("http://localhost:5000/api/ideas/approved", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			approvedIdeas = await response.json();
			console.log(approvedIdeas);
			
		} catch (error) {
			console.error("Error fetching ideas:", error);
			approvedIdeas = [];
		}
		return;
	}

	onMount(() => {
		approvedIdeas=[]
		fetchApprovedIdeas();
	});

	/** @type {Array<Idea>} */
	let searchResults = [];
	/** @type {string} */
	let searchQuery = "";
	/** @type {number|null} */
	let searchTimeout = null;
	/** @type {Idea|null} */
	let selectedIdea = null;
	let modalOpen = false;

	/**
	 * Performs a debounced search for ideas
	 * @function
	 * @async
	 * @throws {Error} Throws an error if the network request fails
	 * @returns {void}
	 */
	function handleSearch() {
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		searchTimeout = setTimeout(async () => {
			if (searchQuery.length < 2) {
				searchResults = [];
				return;
			}

			try {
				const response = await fetch(
					`http://localhost:5000/api/ideas/search?query=${encodeURIComponent(searchQuery)}`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					}
				);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				searchResults = await response.json();
			} catch (error) {
				console.error("Error searching ideas:", error);
				searchResults = [];
			}
		}, 300);
	}

	/**
	 * Shows the details of a selected idea in a modal
	 * @param {Idea} idea - The idea to display
	 * @returns {void}
	 */
	function showIdeaDetails(idea) {
		selectedIdea = idea;
		const modal = document.getElementById("idea_details_modal");
		if (modal instanceof HTMLDialogElement) {
			modal.showModal();
		}
	}
</script>

<!-- Page content here -->
<div class="hero bg-base-100 min-h-screen">
	<div class="hero-content flex-col lg:flex-row-reverse">
		<img
			alt="IDEA APP"
			src="./dev.jpeg"
			class="max-w-[25vw] h-auto shadow-orange-500 shadow-xl transform-gpu img-3d"
		/>
		<div>
			<h1 class="text-5xl font-bold text-base-primary text-center pb-8">
				Your <span class="text-stroke text-7xl stroke-2 text-transparent"
					>Ultimate</span
				>
				IDEA
				<span
					class="uppercase text-transparent bg-clip-text bg-gradient-to-l from-yellow-400 to-red-700 text-7xl z-50"
				>
					Vault</span
				>
			</h1>
			{#if !isAuthenticated()}
				<a href="/login" class="btn btn-primary font-bold text-xl"
					>Get Started</a
				>
			{:else}
				<a href="/dashboard" class="btn btn-primary font-bold text-xl"
					>Dashboard</a
				>
			{/if}
		</div>
	</div>
</div>
<!-- Ideas Ticker -->
{#if approvedIdeas.length > 0}
	<div class="w-full bg-base-200 py-8 overflow-hidden">
		<h2 class="text-2xl font-bold text-center">Recent Ideas</h2>
		<div class="ideas-ticker">
			<div class="ticker-content max-h-full" style="--total-ideas: {approvedIdeas.length}">
				{#each [...approvedIdeas] as idea}
					<div
						class="card card-compact bg-primary text-primary-content mx-4 w-80 shadow-xl overflow-y-scroll"
					>
						<div class="card-body ">
							<h3 class="card-title text-xl text-pretty font-serif">{idea.title}</h3>
							<p class="text-sm opacity-90 font-mono">
								by @{idea.User ? idea.User.username : "Unknown"}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
{:else}
	<div class="w-full bg-base-100 py-8">
		<p class="text-center text-3xl">No ideas available</p>
	</div>
{/if}
<!-- Search Section -->
<div class="w-full bg-base-100 py-12">
	<div class="max-w-2xl mx-auto px-4">
		<div class="form-control w-full">
			<div class="relative">
				<input
					type="text"
					bind:value={searchQuery}
					on:input={handleSearch}
					placeholder="Search ideas..."
					class="input input-bordered w-full pr-16 input-lg shadow-lg transition-all duration-300 focus:shadow-2xl"
				/>
				<button
					class="btn btn-primary absolute top-0 right-0 rounded-l-none h-full select-none"
					aria-label="Search"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</button>
			</div>
		</div>

		{#if searchResults.length > 0}
			<div class="mt-6 grid gap-4 animate-fadeIn">
				{#each searchResults as idea}
					<button
						type="button"
						class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border-[0.9px] border-white/80"
						on:click={() => showIdeaDetails(idea)}
						on:keydown={(e) => e.key === "Enter" && showIdeaDetails(idea)}
						aria-label={`View details for ${idea.title}`}
					>
						<div class="card-body">
							<h3 class="card-title">{idea.title}</h3>
							<p class="text-sm opacity-75">
								by @{idea.User?.username || "Unknown"}
							</p>
						</div>
					</button>
				{/each}
			</div>
		{:else if searchQuery.length >= 2}
			<div class="text-center mt-6">
				<p class="text-lg opacity-75">No results found</p>
			</div>
		{/if}
	</div>
</div>

<!-- Replace the old modal with DaisyUI modal -->
<dialog id="idea_details_modal" class="modal">
	<div class="modal-box">
		{#if selectedIdea}
			<h3 class="font-bold text-lg">{selectedIdea.title}</h3>
			<p class="text-sm opacity-75 mt-2">
				by @{selectedIdea.User?.username || "Unknown"}
			</p>
			<p class="py-4">{selectedIdea.description}</p>
		{/if}
		<div class="modal-action">
			<form method="dialog">
				<button class="btn">Close</button>
			</form>
		</div>
	</div>
</dialog>

<style>
	.ideas-ticker {
		position: relative;
		width: 100%;
		height: 160px;
		display: flex;
		align-items: center;
	}

	.ticker-content {
		display: flex;
		position: absolute;
		animation: ticker 30s linear infinite;
		width: max-content;
	}

	@keyframes ticker {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(calc(-100% / 2));
		}
	}

	/* Pause animation on hover */
	.ideas-ticker:hover .ticker-content {
		animation-play-state: paused;
	}

	.animate-fadeIn {
		animation: fadeIn 0.3s ease-in-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
