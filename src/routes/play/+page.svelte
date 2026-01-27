<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';

	let { data } = $props();
	let isResetting = $state(false);
	let isResettingAll = $state(false);
</script>

<svelte:head>
	<title>Play | Top Bins Daily</title>
</svelte:head>

<!-- This page now only shows dev tools when accessed via ?dev -->
<!-- Normal navigation redirects to the appropriate round -->

{#if data.isDev}
	<div class="min-h-screen p-8">
		<div class="max-w-md mx-auto">
			<h1 class="text-2xl font-bold mb-2">Dev Tools</h1>
			<p class="text-text-muted mb-8">Development utilities for testing</p>

			<div class="flex flex-col gap-4">
				<form
					method="POST"
					action="?/reset"
					use:enhance={() => {
						isResetting = true;
						return async ({ update }) => {
							await update();
							isResetting = false;
							await invalidateAll();
							goto('/play/1');
						};
					}}
				>
					<button
						type="submit"
						disabled={isResetting || isResettingAll}
						class="w-full bg-warning-light hover:bg-warning/20 border border-warning text-warning px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
					>
						{isResetting ? 'Resetting...' : 'Reset My Progress'}
					</button>
				</form>

				<form
					method="POST"
					action="?/resetAll"
					use:enhance={() => {
						isResettingAll = true;
						return async ({ update }) => {
							await update();
							isResettingAll = false;
							await invalidateAll();
							goto('/play/1');
						};
					}}
				>
					<button
						type="submit"
						disabled={isResetting || isResettingAll}
						class="w-full bg-error-light hover:bg-error/20 border border-error text-error px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
					>
						{isResettingAll ? 'Resetting...' : 'Reset All Goals & Data'}
					</button>
					<p class="text-xs text-text-muted mt-2 text-center">
						Clears all goals and creates new sample goals
					</p>
				</form>
			</div>

			<div class="mt-8 flex gap-4 justify-center">
				<a href="/" class="text-text-muted hover:text-primary transition-colors">Home</a>
				<a href="/play/1" class="text-text-muted hover:text-primary transition-colors">Play</a>
			</div>
		</div>
	</div>
{:else}
	<div class="min-h-screen flex items-center justify-center">
		<p class="text-text-muted">Redirecting...</p>
	</div>
{/if}
