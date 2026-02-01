<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let { oncomplete }: { oncomplete: () => void } = $props();

	let currentStep = $state(0);

	const steps = [
		{
			title: 'Welcome to the Goal Editor!',
			description:
				'Create animated recreations of iconic football goals. This walkthrough will guide you through the editor.',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`
		},
		{
			title: 'Add Players',
			description:
				'Pick team badges and add players to the pitch. Use the toolbar to select a team crest and place players for both sides.',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`
		},
		{
			title: 'Position Players',
			description:
				'Drag players around the pitch to set their starting positions. Place them where they were when the goal build-up began.',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9l7-7 7 7"/><path d="M5 15l7 7 7-7"/><path d="M9 5l-7 7 7 7"/><path d="M15 5l7 7-7 7"/></svg>`
		},
		{
			title: 'Create Keyframes',
			description:
				'Use the timeline to add keyframes at different moments. Move players between keyframes to create the animation of the goal.',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
		},
		{
			title: 'Add Events',
			description:
				'Select a player and use the action panel to draw passes, shots, and dribbles between players. Make sure to add the final shot!',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`
		},
		{
			title: 'Fill in the Details',
			description:
				'Complete the metadata form on the right with the team, scorer, year, competition, and other info about the goal.',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
		},
		{
			title: 'Preview & Submit',
			description:
				'Switch to Preview or Split view to watch your animation. When you\'re happy, hit Submit and an admin will review it.',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
		}
	];

	function next() {
		if (currentStep < steps.length - 1) {
			currentStep++;
		} else {
			oncomplete();
		}
	}

	function back() {
		if (currentStep > 0) {
			currentStep--;
		}
	}
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
	transition:fade={{ duration: 200 }}
>
	<div
		class="relative w-full max-w-lg mx-4 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
		in:fly={{ y: 30, duration: 400, easing: cubicOut }}
	>
		<!-- Step content -->
		{#key currentStep}
			<div
				class="p-8 text-center"
				in:fly={{ x: 40, duration: 300, easing: cubicOut }}
			>
				<div class="mb-6 flex justify-center text-primary">
					{@html steps[currentStep].icon}
				</div>
				<h2 class="text-2xl font-bold mb-3">{steps[currentStep].title}</h2>
				<p class="text-text-muted leading-relaxed">{steps[currentStep].description}</p>
			</div>
		{/key}

		<!-- Step dots -->
		<div class="flex justify-center gap-1.5 pb-4">
			{#each steps as _, i (i)}
				<button
					onclick={() => (currentStep = i)}
					class="w-2 h-2 rounded-full transition-all {i === currentStep
						? 'bg-primary w-6'
						: 'bg-border hover:bg-text-muted'}"
					aria-label="Go to step {i + 1}"
				></button>
			{/each}
		</div>

		<!-- Navigation -->
		<div class="flex items-center justify-between px-8 pb-8">
			<button
				onclick={() => oncomplete()}
				class="text-sm text-text-muted hover:text-text transition-colors"
			>
				Skip
			</button>
			<div class="flex gap-3">
				{#if currentStep > 0}
					<button
						onclick={back}
						class="px-4 py-2 text-sm font-medium text-text-muted hover:text-text border border-border rounded-xl hover:bg-surface-dim transition-all"
					>
						Back
					</button>
				{/if}
				<button
					onclick={next}
					class="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-xl transition-all"
				>
					{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
				</button>
			</div>
		</div>
	</div>
</div>
