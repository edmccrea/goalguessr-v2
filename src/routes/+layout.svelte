<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Nav from '$lib/components/ui/Nav.svelte';
	import { Toaster } from 'svelte-sonner';
	import { navigating } from '$app/stores';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
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
