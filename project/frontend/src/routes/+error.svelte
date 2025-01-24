<script>
	import { page } from "$app/state";
</script>

<div
	class="min-h-screen flex items-center justify-center bg-gray-900 text-white"
>
	<div class="text-center">
		<h1 class="text-7xl font-bold mb-4">Oops!</h1>
		<p class="text-4xl mb-8">Something went wrong.</p>
		<p class="text-2xl mb-4">Status: {page.status}</p>
		<p class="text-2xl mb-8">Error: {page.error?.message}</p>
		<a href="/" class="btn btn-primary">Go back to Home</a>
	</div>
</div>
