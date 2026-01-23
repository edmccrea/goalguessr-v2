<script lang="ts">
	import { page } from '$app/state';

	const goalId = $derived(page.params.id);
</script>

<div class="min-h-screen bg-gray-900 text-white p-8">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-4xl font-bold mb-8">Edit Goal: {goalId}</h1>
		<p class="text-gray-400">Goal editing functionality coming soon...</p>
		<div class="mt-8">
			<a href="/editor" class="text-green-400 hover:text-green-300">Back to Editor</a>
		</div>
	</div>
</div>
