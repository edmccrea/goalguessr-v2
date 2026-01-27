<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Nav from '$lib/components/ui/Nav.svelte';
	import { Toaster } from 'svelte-sonner';
	import { navigating } from '$app/stores';
	import { PUBLIC_FEATURE_LEADERBOARD } from '$env/static/public';

	let { children } = $props();

	const showLeaderboard = PUBLIC_FEATURE_LEADERBOARD === 'true';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap" rel="stylesheet" />
</svelte:head>

<!-- Navigation loading indicator -->
{#if $navigating}
	<div class="fixed top-0 left-0 right-0 z-[100] h-1 bg-primary/20">
		<div class="h-full bg-primary animate-[loading_1s_ease-in-out_infinite]"></div>
	</div>
{/if}

<Toaster richColors position="top-center" />
<Nav />
{@render children()}

<!-- Footer -->
<footer class="py-12 px-6 border-t border-border bg-surface">
	<div class="max-w-5xl mx-auto">
		<div class="flex flex-col sm:flex-row items-center justify-between gap-6">
			<div class="flex items-center gap-3">
				<img src={favicon} alt="Top Bins Daily" class="w-10 h-10" />
				<span class="font-bold text-lg tracking-tight">Top Bins <span class="text-primary">Daily</span></span>
			</div>

			<div class="flex gap-8 text-sm">
				<a href="/play" class="text-text-muted hover:text-primary transition-colors">Play</a>
				{#if showLeaderboard}
					<a href="/leaderboard" class="text-text-muted hover:text-primary transition-colors">Leaderboard</a>
				{/if}
				<a href="/editor" class="text-text-muted hover:text-primary transition-colors">Create</a>
				<a href="/profile" class="text-text-muted hover:text-primary transition-colors">Profile</a>
			</div>
		</div>

		<div class="mt-8 pt-8 border-t border-border text-center text-text-muted text-sm">
			<p>Test your football knowledge, one goal at a time.</p>
			<a
				href="https://buymeacoffee.com/edmccrea"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1.5 mt-3 text-text-muted hover:text-primary transition-colors"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
				</svg>
				Support this project
			</a>
		</div>
	</div>
</footer>
