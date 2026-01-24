<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { EditorPitch, Timeline, MetadataForm, EditorToolbar, PlayerActionPanel } from '$lib/components/editor';
	import GoalAnimation from '$lib/components/animation/GoalAnimation.svelte';
	import { editorState } from '$lib/editor-state.svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	const goalId = $derived(page.params.id);

	type ViewMode = 'edit' | 'split' | 'preview';
	let viewMode = $state<ViewMode>('edit');

	let isPreviewMode = $derived(viewMode === 'preview');
	let isSubmitting = $state(false);

	// Load the goal data into the editor on mount
	onMount(() => {
		editorState.loadGoal(data.goal);
	});

	// Reactive animation data for live preview
	const liveAnimationData = $derived(editorState.getAnimationData());

	// Step indicator logic
	const playerCount = $derived(editorState.playerCount);
	const keyframeCount = $derived(editorState.animation.keyframes.length);
	const hasShot = $derived(editorState.animation.events.some(e => e.type === 'shot'));
	const validation = $derived(editorState.validate());

	const steps = $derived([
		{ label: 'Players', done: playerCount > 0 },
		{ label: 'Position', done: playerCount > 0 },
		{ label: 'Animate', done: keyframeCount >= 2 && hasShot },
		{ label: 'Save', done: validation.valid }
	]);

	function setViewMode(mode: ViewMode) {
		viewMode = mode;
	}

	async function handleSubmit() {
		const v = editorState.validate();
		if (!v.valid) return;

		isSubmitting = true;

		try {
			const response = await fetch(`/api/goals/${goalId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...editorState.metadata,
					animationData: liveAnimationData
				})
			});

			const responseData = await response.json();

			if (!response.ok) {
				throw new Error(responseData.error || 'Failed to update');
			}

			toast.success('Goal updated successfully');
		} catch (err) {
			toast.error('Failed to update goal', {
				description: err instanceof Error ? err.message : 'Please try again.'
			});
		} finally {
			isSubmitting = false;
		}
	}

	function handleReset() {
		if (confirm('Are you sure? This will revert all changes to the last saved state.')) {
			editorState.loadGoal(data.goal);
		}
	}
</script>

<div class="min-h-screen p-4 md:p-6">
	<div class="max-w-7xl mx-auto">
		<!-- Header -->
		<div class="mb-4 flex flex-wrap items-center justify-between gap-4">
			<div>
				<a href="/admin/goals" class="text-text-muted hover:text-primary text-sm">&larr; Back to Goals</a>
				<h1 class="text-2xl md:text-3xl font-bold">Edit Goal</h1>
				<p class="text-text-muted text-sm mt-1">{data.goal.scorer} - {data.goal.team} ({data.goal.year})</p>
			</div>
			<div class="flex gap-2">
				<!-- View mode toggle group -->
				<div class="flex rounded-lg overflow-hidden border border-border">
					<button
						onclick={() => setViewMode('edit')}
						class="px-3 py-2 text-sm font-medium transition-colors"
						class:bg-primary={viewMode === 'edit'}
						class:text-white={viewMode === 'edit'}
						class:bg-surface-dim={viewMode !== 'edit'}
						class:text-text={viewMode !== 'edit'}
						class:hover:bg-border={viewMode !== 'edit'}
					>
						Edit
					</button>
					<button
						onclick={() => setViewMode('split')}
						class="px-3 py-2 text-sm font-medium transition-colors border-l border-border"
						class:bg-primary={viewMode === 'split'}
						class:text-white={viewMode === 'split'}
						class:bg-surface-dim={viewMode !== 'split'}
						class:text-text={viewMode !== 'split'}
						class:hover:bg-border={viewMode !== 'split'}
					>
						Split
					</button>
					<button
						onclick={() => setViewMode('preview')}
						class="px-3 py-2 text-sm font-medium transition-colors border-l border-border"
						class:bg-primary={viewMode === 'preview'}
						class:text-white={viewMode === 'preview'}
						class:bg-surface-dim={viewMode !== 'preview'}
						class:text-text={viewMode !== 'preview'}
						class:hover:bg-border={viewMode !== 'preview'}
					>
						Preview
					</button>
				</div>
				<button
					onclick={handleReset}
					class="bg-surface-dim hover:bg-border text-text px-4 py-2 rounded-lg font-medium transition-colors"
				>
					Revert
				</button>
			</div>
		</div>

		<!-- Step indicator -->
		<div class="mb-4 flex items-center justify-center gap-2 md:gap-4">
			{#each steps as step, i}
				<div class="flex items-center gap-1.5">
					<div
						class="w-2.5 h-2.5 rounded-full transition-colors"
						class:bg-primary={step.done}
						class:bg-border={!step.done}
					></div>
					<span
						class="text-xs md:text-sm transition-colors"
						class:text-text={step.done}
						class:font-medium={step.done}
						class:text-text-muted={!step.done}
					>
						{step.label}
					</span>
				</div>
				{#if i < steps.length - 1}
					<div class="w-4 md:w-8 h-px bg-border"></div>
				{/if}
			{/each}
		</div>

		<div class="grid grid-cols-1 gap-4" class:xl:grid-cols-3={viewMode !== 'split'}>
			<!-- Main editor area -->
			<div class="space-y-3" class:xl:col-span-2={viewMode !== 'split'}>
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
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
						<div class="bg-surface border border-border rounded-xl p-4 shadow-sm">
							<div class="text-xs text-text-muted mb-2 font-medium">Editor</div>
							<EditorPitch />
						</div>
						<div class="bg-surface border border-border rounded-xl p-4 shadow-sm">
							<div class="text-xs text-text-muted mb-2 font-medium">Live Preview</div>
							<GoalAnimation animation={liveAnimationData} autoPlay={true} loop={true} />
						</div>
					</div>
				{:else}
					<div class="bg-surface border border-border rounded-xl p-4 shadow-sm">
						{#if isPreviewMode}
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
					<MetadataForm onsubmit={handleSubmit} {isSubmitting} submitLabel="Save Changes" />
				</div>
			{/if}
		</div>
	</div>
</div>
