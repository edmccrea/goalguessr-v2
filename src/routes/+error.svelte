<script lang="ts">
	import { page } from '$app/stores';

	// Type assertion to access custom error properties
	$: errorDetails = ($page.error as { message?: string; details?: string } | null)?.details;
</script>

<svelte:head>
	<title>Error {$page.status} | Top Bins Daily</title>
</svelte:head>

<div class="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 py-12">
	<div class="text-center max-w-md">
		{#if $page.status === 503}
			<!-- Service unavailable - friendly "no game" state -->
			<div class="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
				<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500">
					<circle cx="12" cy="12" r="10"/>
					<polyline points="12 6 12 12 16 14"/>
				</svg>
			</div>

			<h1 class="text-3xl font-bold text-text mb-2">{$page.error?.message || 'Coming Soon'}</h1>

			<p class="text-lg text-text-muted mb-8">
				{errorDetails || 'No games are available right now. Check back later!'}
			</p>
		{:else}
			<!-- Standard error state -->
			<div class="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
				<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500">
					<circle cx="12" cy="12" r="10"/>
					<line x1="12" y1="8" x2="12" y2="12"/>
					<line x1="12" y1="16" x2="12.01" y2="16"/>
				</svg>
			</div>

			<h1 class="text-6xl font-bold text-text mb-2">{$page.status}</h1>

			<p class="text-xl text-text-muted mb-8">
				{#if $page.status === 404}
					Page not found
				{:else if $page.status === 403}
					Access denied
				{:else if $page.status === 500}
					Something went wrong
				{:else}
					{$page.error?.message || 'An error occurred'}
				{/if}
			</p>
		{/if}

		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a
				href="/"
				class="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-all"
			>
				Go Home
			</a>
			{#if $page.status !== 503}
				<button
					onclick={() => history.back()}
					class="bg-surface hover:bg-surface-dim border border-border px-6 py-3 rounded-xl font-medium transition-all"
				>
					Go Back
				</button>
			{/if}
		</div>
	</div>
</div>
