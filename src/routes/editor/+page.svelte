<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, scale, fade } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';
	import { EditorPitch, Timeline, MetadataForm, EditorToolbar, PlayerActionPanel } from '$lib/components/editor';
	import GoalAnimation from '$lib/components/animation/GoalAnimation.svelte';
	import { editorState } from '$lib/editor-state.svelte';
	import { toast } from 'svelte-sonner';
	import type { AnimationData } from '$lib/server/db/schema';

	let { data } = $props();

	type ViewMode = 'edit' | 'split' | 'preview';
	let viewMode = $state<ViewMode>('edit');
	let mounted = $state(false);
	let resubmitId = $state<string | null>(null);

	onMount(() => {
		mounted = true;

		// Load resubmit goal data if available
		if (data.resubmitGoal) {
			resubmitId = data.resubmitGoal.id;
			editorState.loadGoal({
				team: data.resubmitGoal.team,
				year: data.resubmitGoal.year,
				scorer: data.resubmitGoal.scorer,
				competition: data.resubmitGoal.competition,
				opponent: data.resubmitGoal.opponent,
				matchContext: data.resubmitGoal.matchContext,
				videoUrl: data.resubmitGoal.videoUrl,
				isInternational: data.resubmitGoal.isInternational,
				animationData: data.resubmitGoal.animationData as AnimationData
			});
			toast.info('Editing rejected submission', {
				description: 'Make your changes and resubmit for review.'
			});
		}
	});

	// Derived for backwards compatibility with existing logic
	let isPreviewMode = $derived(viewMode === 'preview');
	let isSubmitting = $state(false);

	// Reactive animation data for live preview - ensures GoalAnimation updates when edits are made
	const liveAnimationData = $derived(editorState.getAnimationData());

	// Step indicator logic
	const playerCount = $derived(editorState.playerCount);
	const keyframeCount = $derived(editorState.animation.keyframes.length);
	const hasShot = $derived(editorState.animation.events.some(e => e.type === 'shot'));
	const validation = $derived(editorState.validate());

	const steps = $derived([
		{ label: 'Players', done: playerCount > 0 },
		{ label: 'Position', done: playerCount > 0 }, // Consider done if players exist
		{ label: 'Animate', done: keyframeCount >= 2 && hasShot },
		{ label: 'Submit', done: validation.valid }
	]);

	function cycleViewMode() {
		if (viewMode === 'edit') viewMode = 'split';
		else if (viewMode === 'split') viewMode = 'preview';
		else viewMode = 'edit';
	}

	function setViewMode(mode: ViewMode) {
		viewMode = mode;
	}

	async function handleSubmit() {
		const v = editorState.validate();
		if (!v.valid) return;

		isSubmitting = true;

		try {
			const response = await fetch('/api/goals', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...editorState.metadata,
					animationData: liveAnimationData,
					resubmitId: resubmitId
				})
			});

			const responseData = await response.json();

			if (!response.ok) {
				throw new Error(responseData.error || 'Failed to submit');
			}

			if (resubmitId) {
				toast.success('Goal resubmitted!', {
					description: 'Your updated goal will be reviewed by an admin.'
				});
			} else {
				toast.success('Goal submitted!', {
					description: 'Your goal will be reviewed by an admin.'
				});
			}
			editorState.reset();
			resubmitId = null;
		} catch (err) {
			toast.error('Failed to submit goal', {
				description: err instanceof Error ? err.message : 'Please try again.'
			});
		} finally {
			isSubmitting = false;
		}
	}

	function handleReset() {
		if (confirm('Are you sure? This will clear all your work.')) {
			editorState.reset();
			resubmitId = null;
		}
	}
</script>

<svelte:head>
	<title>Submit Goal | Top Bins Daily</title>
</svelte:head>

<div class="min-h-[calc(100vh-3.5rem)] relative overflow-hidden">
	<!-- Animated background elements -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
		<div class="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
	</div>

	<div class="relative z-10 p-4 md:p-6">
		<div class="max-w-7xl mx-auto">
			<!-- Header -->
			{#if mounted}
				<div
					class="mb-6 flex flex-wrap items-center justify-between gap-4"
					in:fly={{ y: -20, duration: 500, easing: cubicOut }}
				>
					<div>
						<a href="/" class="group inline-flex items-center gap-1.5 text-text-muted hover:text-primary text-sm mb-2 transition-colors">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:-translate-x-1">
								<path d="M19 12H5M12 19l-7-7 7-7"/>
							</svg>
							Back to Home
						</a>
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
									<path d="M12 20h9"/>
									<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
								</svg>
							</div>
							<div>
								<h1 class="text-2xl md:text-3xl font-bold">Goal Editor</h1>
								<p class="text-text-muted text-sm">Create and animate iconic goals</p>
							</div>
						</div>
					</div>
					<div class="flex gap-3">
						<!-- View mode toggle group -->
						<div class="flex rounded-xl overflow-hidden border border-border bg-surface shadow-sm">
							<button
								onclick={() => setViewMode('edit')}
								class="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all"
								class:bg-primary={viewMode === 'edit'}
								class:text-white={viewMode === 'edit'}
								class:shadow-sm={viewMode === 'edit'}
								class:text-text-muted={viewMode !== 'edit'}
								class:hover:text-text={viewMode !== 'edit'}
								class:hover:bg-surface-dim={viewMode !== 'edit'}
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M12 20h9"/>
									<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
								</svg>
								Edit
							</button>
							<button
								onclick={() => setViewMode('split')}
								class="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all border-l border-border"
								class:bg-primary={viewMode === 'split'}
								class:text-white={viewMode === 'split'}
								class:shadow-sm={viewMode === 'split'}
								class:text-text-muted={viewMode !== 'split'}
								class:hover:text-text={viewMode !== 'split'}
								class:hover:bg-surface-dim={viewMode !== 'split'}
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<rect x="3" y="3" width="18" height="18" rx="2"/>
									<line x1="12" y1="3" x2="12" y2="21"/>
								</svg>
								Split
							</button>
							<button
								onclick={() => setViewMode('preview')}
								class="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all border-l border-border"
								class:bg-primary={viewMode === 'preview'}
								class:text-white={viewMode === 'preview'}
								class:shadow-sm={viewMode === 'preview'}
								class:text-text-muted={viewMode !== 'preview'}
								class:hover:text-text={viewMode !== 'preview'}
								class:hover:bg-surface-dim={viewMode !== 'preview'}
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<polygon points="5 3 19 12 5 21 5 3"/>
								</svg>
								Preview
							</button>
						</div>
						<button
							onclick={handleReset}
							class="group flex items-center gap-2 bg-surface hover:bg-surface-dim border border-border text-text-muted hover:text-text px-4 py-2.5 rounded-xl font-medium transition-all hover:border-error/30"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:text-error transition-colors">
								<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
								<path d="M3 3v5h5"/>
							</svg>
							Reset
						</button>
					</div>
				</div>
			{/if}

			<!-- Step indicator -->
			{#if mounted}
				<div
					class="mb-6 flex items-center justify-center"
					in:fly={{ y: -10, duration: 400, delay: 100, easing: cubicOut }}
				>
					<div class="inline-flex items-center gap-3 md:gap-4 bg-surface border border-border rounded-xl px-4 py-3 shadow-sm">
						{#each steps as step, i}
							<div class="flex items-center gap-2">
								<div
									class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all {step.done ? 'bg-primary text-white' : 'bg-surface-dim text-text-muted'}"
								>
									{#if step.done}
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
											<polyline points="20 6 9 17 4 12"/>
										</svg>
									{:else}
										{i + 1}
									{/if}
								</div>
								<span
									class="text-sm transition-colors hidden sm:inline {step.done ? 'text-text font-medium' : 'text-text-muted'}"
								>
									{step.label}
								</span>
							</div>
							{#if i < steps.length - 1}
								<div class="w-6 md:w-10 h-px {steps[i + 1]?.done || step.done ? 'bg-primary/30' : 'bg-border'}"></div>
							{/if}
						{/each}
					</div>
				</div>
			{/if}

			{#if mounted}
				<div
					class="grid grid-cols-1 gap-4"
					class:xl:grid-cols-3={viewMode !== 'split'}
					in:fly={{ y: 20, duration: 500, delay: 200, easing: cubicOut }}
				>
					<!-- Main editor area -->
					<div class="space-y-4" class:xl:col-span-2={viewMode !== 'split'}>
						<!-- Toolbar (players + frame nav) -->
						{#if !isPreviewMode}
							<EditorToolbar />
						{/if}

						<!-- Timeline (moved up for visibility) -->
						{#if !isPreviewMode}
							<Timeline />
						{/if}

						<!-- Pitch -->
						{#if viewMode === 'split'}
							<!-- Split view: Editor + Live Preview side by side -->
							<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
								<div class="bg-surface border border-border rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow">
									<div class="flex items-center gap-2 text-xs text-text-muted mb-3 font-medium uppercase tracking-wide">
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<path d="M12 20h9"/>
											<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
										</svg>
										Editor
									</div>
									<EditorPitch />
								</div>
								<div class="bg-surface border border-border rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow">
									<div class="flex items-center gap-2 text-xs text-text-muted mb-3 font-medium uppercase tracking-wide">
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<polygon points="5 3 19 12 5 21 5 3"/>
										</svg>
										Live Preview
									</div>
									<GoalAnimation animation={liveAnimationData} autoPlay={true} loop={true} />
								</div>
							</div>
						{:else}
							<div class="bg-surface border border-border rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow">
								{#if isPreviewMode}
									<div class="flex items-center gap-2 text-xs text-text-muted mb-3 font-medium uppercase tracking-wide">
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<polygon points="5 3 19 12 5 21 5 3"/>
										</svg>
										Preview
									</div>
									<GoalAnimation animation={liveAnimationData} autoPlay={true} loop={true} />
								{:else}
									<EditorPitch />
								{/if}
							</div>
						{/if}

						<!-- Player Action Panel (shows when player selected) -->
						{#if !isPreviewMode}
							<PlayerActionPanel />
						{/if}
					</div>

					<!-- Sidebar: Metadata Form (hidden in split view for more space) -->
					{#if viewMode !== 'split'}
						<div class="xl:col-span-1">
							<MetadataForm onsubmit={handleSubmit} {isSubmitting} />
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
