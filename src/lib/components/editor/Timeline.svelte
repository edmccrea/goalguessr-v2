<script lang="ts">
	import { editorState } from '$lib/editor-state.svelte';

	const keyframes = $derived(editorState.animation.keyframes);
	const duration = $derived(editorState.animation.duration);
	const selectedIndex = $derived(editorState.selectedKeyframeIndex);
	const events = $derived(editorState.animation.events);

	let editingTimeIndex = $state<number | null>(null);
	let editingTimeValue = $state('');

	// Dragging state for timeline markers
	let draggingIndex = $state<number | null>(null);
	let timelineElement: HTMLDivElement | undefined = $state();
	let dragPreviewTime = $state<number | null>(null);

	function formatTime(ms: number): string {
		const seconds = ms / 1000;
		return seconds.toFixed(1) + 's';
	}

	function selectKeyframe(index: number) {
		editorState.selectedKeyframeIndex = index;
	}

	function addKeyframe() {
		// Add keyframe after the currently selected one
		const currentTime = keyframes[selectedIndex]?.time ?? 0;
		const nextKeyframe = keyframes[selectedIndex + 1];

		let newTime: number;
		if (nextKeyframe) {
			// Place halfway between current and next keyframe
			newTime = (currentTime + nextKeyframe.time) / 2;
		} else {
			// No next keyframe - place halfway between current and duration
			newTime = (currentTime + duration) / 2;
		}

		editorState.addKeyframe(newTime);
	}

	function removeKeyframe() {
		if (selectedIndex > 0 && keyframes.length > 1) {
			editorState.removeKeyframe(selectedIndex);
		}
	}

	function autoDistribute() {
		// Evenly space all keyframes across the duration
		const count = keyframes.length;
		if (count <= 1) return;

		// Calculate all new times first, then apply them
		// This avoids issues with re-sorting during the loop
		const newTimes: { oldTime: number; newTime: number }[] = [];
		for (let i = 1; i < count; i++) {
			newTimes.push({
				oldTime: keyframes[i].time,
				newTime: (duration * i) / (count - 1)
			});
		}

		// Apply all time changes
		for (const { oldTime, newTime } of newTimes) {
			// Find the keyframe with this old time and update it
			const index = editorState.animation.keyframes.findIndex((kf) => kf.time === oldTime);
			if (index > 0) {
				editorState.updateKeyframeTime(index, newTime);
			}
		}
	}

	function handleDurationChange(e: Event) {
		const value = (e.target as HTMLInputElement).valueAsNumber;
		if (!isNaN(value) && value >= 1 && value <= 30) {
			editorState.setDuration(value * 1000);
		}
	}

	function startEditingTime(index: number) {
		if (index === 0) return; // Can't edit start frame time
		editingTimeIndex = index;
		editingTimeValue = (keyframes[index].time / 1000).toFixed(1);
	}

	function saveTimeEdit() {
		if (editingTimeIndex === null) return;
		const value = parseFloat(editingTimeValue);
		if (!isNaN(value) && value > 0 && value <= duration / 1000) {
			editorState.updateKeyframeTime(editingTimeIndex, value * 1000);
		}
		editingTimeIndex = null;
		editingTimeValue = '';
	}

	function cancelTimeEdit() {
		editingTimeIndex = null;
		editingTimeValue = '';
	}

	function handleTimeKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			saveTimeEdit();
		} else if (e.key === 'Escape') {
			cancelTimeEdit();
		}
	}

	// Get events at a specific keyframe time
	function getEventsAtKeyframe(index: number): string[] {
		const kfTime = keyframes[index]?.time;
		if (kfTime === undefined) return [];
		return events
			.filter(e => e.time === kfTime)
			.map(e => e.type === 'shot' ? '⚽ Shot' : `➡️ Pass`);
	}

	// Calculate position on timeline (0-100%)
	function getTimelinePosition(time: number): number {
		return (time / duration) * 100;
	}

	// Convert mouse position to time on timeline
	function getTimeFromPosition(clientX: number): number {
		if (!timelineElement) return 0;
		const rect = timelineElement.getBoundingClientRect();
		const relativeX = clientX - rect.left;
		const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
		return percentage * duration;
	}

	// Start dragging a keyframe marker
	function startDragging(e: PointerEvent, index: number) {
		if (index === 0) return; // Can't drag the start keyframe
		e.preventDefault();
		e.stopPropagation();
		draggingIndex = index;
		dragPreviewTime = keyframes[index].time;
		editorState.selectedKeyframeIndex = index;
		(e.target as Element).setPointerCapture(e.pointerId);
	}

	// Handle dragging movement
	function handleTimelineDrag(e: PointerEvent) {
		if (draggingIndex === null) return;
		const newTime = getTimeFromPosition(e.clientX);
		// Clamp to valid range (after 0, before or at duration)
		dragPreviewTime = Math.max(50, Math.min(duration, newTime)); // Min 50ms to stay after start
	}

	// Finish dragging
	function finishDragging() {
		if (draggingIndex !== null && dragPreviewTime !== null) {
			editorState.updateKeyframeTime(draggingIndex, dragPreviewTime);
		}
		draggingIndex = null;
		dragPreviewTime = null;
	}
</script>

<div class="bg-surface border border-border rounded-2xl p-4 shadow-lg">
	<!-- Header row with duration and controls -->
	<div class="flex items-center justify-between mb-4">
		<div class="flex items-center gap-4">
			<div class="flex items-center gap-2">
				<div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
						<circle cx="12" cy="12" r="10"/>
						<polyline points="12 6 12 12 16 14"/>
					</svg>
				</div>
				<span class="text-sm font-medium text-text-muted">Timeline</span>
			</div>

			<div class="flex items-center gap-2 bg-surface-dim rounded-xl px-3 py-1.5">
				<label for="duration" class="text-xs text-text-muted font-medium">Duration</label>
				<input
					type="number"
					id="duration"
					min="1"
					max="30"
					step="0.5"
					value={duration / 1000}
					onchange={handleDurationChange}
					class="w-14 bg-surface border border-border rounded-lg px-2 py-1 text-sm text-center focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
				/>
				<span class="text-xs text-text-muted">sec</span>
			</div>

			{#if keyframes.length > 2}
				<button
					onclick={autoDistribute}
					class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-surface-dim hover:bg-border rounded-lg transition-colors"
					title="Evenly space all keyframes"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="3" y1="12" x2="21" y2="12"/>
						<line x1="3" y1="6" x2="21" y2="6"/>
						<line x1="3" y1="18" x2="21" y2="18"/>
					</svg>
					Auto-space
				</button>
			{/if}
		</div>

		{#if selectedIndex > 0}
			<button
				onclick={removeKeyframe}
				class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-error-light hover:bg-error/20 text-error rounded-lg transition-colors"
				title="Delete selected frame"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="3 6 5 6 21 6"/>
					<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
				</svg>
				Delete Frame
			</button>
		{/if}
	</div>

	<!-- Visual timeline bar -->
	<div
		bind:this={timelineElement}
		class="relative h-12 bg-surface-dim rounded-xl mb-4 touch-none"
		onpointermove={handleTimelineDrag}
		onpointerup={finishDragging}
		onpointerleave={finishDragging}
	>
		<!-- Time markers -->
		<div class="absolute inset-x-0 top-1 flex justify-between px-3 text-[10px] text-text-muted font-medium">
			<span>0s</span>
			<span>{(duration / 1000).toFixed(0)}s</span>
		</div>

		<!-- Progress track -->
		<div class="absolute top-6 left-3 right-3 h-1 bg-border rounded-full"></div>

		<!-- Drag preview indicator -->
		{#if draggingIndex !== null && dragPreviewTime !== null}
			{@const previewPosition = getTimelinePosition(dragPreviewTime)}
			<div
				class="absolute top-5 w-3 h-3 -ml-1.5 rounded-full bg-primary/30 border-2 border-primary border-dashed pointer-events-none"
				style="left: calc({previewPosition}% * 0.92 + 3%)"
			></div>
			<div
				class="absolute top-10 -ml-4 text-[10px] font-medium text-primary whitespace-nowrap pointer-events-none"
				style="left: calc({previewPosition}% * 0.92 + 3%)"
			>
				{formatTime(dragPreviewTime)}
			</div>
		{/if}

		<!-- Keyframe markers on timeline -->
		{#each keyframes as keyframe, index (index)}
			{@const isSelected = index === selectedIndex}
			{@const isDragging = draggingIndex === index}
			{@const position = isDragging && dragPreviewTime !== null
				? getTimelinePosition(dragPreviewTime)
				: getTimelinePosition(keyframe.time)}
			<button
				onclick={() => selectKeyframe(index)}
				onpointerdown={(e) => startDragging(e, index)}
				class="absolute top-5 w-3 h-3 -ml-1.5 rounded-full border-2 transition-all shadow-sm"
				class:bg-primary={isSelected}
				class:border-primary={isSelected}
				class:ring-2={isSelected}
				class:ring-primary={isSelected}
				class:bg-white={!isSelected}
				class:border-border={!isSelected}
				class:hover:border-primary={!isSelected}
				class:hover:scale-110={!isSelected}
				class:scale-110={isSelected}
				class:cursor-grab={index !== 0}
				class:cursor-grabbing={isDragging}
				class:opacity-50={isDragging}
				style="left: calc({position}% * 0.92 + 3%)"
				title="{index === 0 ? 'Start (fixed)' : `Frame ${index}: Drag to move`}"
			></button>
		{/each}
	</div>

	<!-- Keyframe cards -->
	<div class="flex gap-2 overflow-x-auto pb-1">
		{#each keyframes as keyframe, index (index)}
			{@const isSelected = index === selectedIndex}
			{@const eventsHere = getEventsAtKeyframe(index)}
			{@const isEditingThis = editingTimeIndex === index}
			<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
			<div
				onclick={() => selectKeyframe(index)}
				class="flex-shrink-0 w-24 p-2.5 rounded-xl border-2 transition-all text-left hover:border-primary cursor-pointer"
				class:border-primary={isSelected}
				class:bg-primary-light={isSelected}
				class:shadow-sm={isSelected}
				class:border-border={!isSelected}
				class:bg-surface-dim={!isSelected}
			>
				<div class="flex items-center justify-between mb-1">
					<span class="text-[10px] font-bold text-text-muted uppercase tracking-wide">
						{index === 0 ? 'Start' : `Frame ${index}`}
					</span>
					{#if isSelected}
						<span class="w-2 h-2 rounded-full bg-primary"></span>
					{/if}
				</div>
				<!-- Editable time -->
				{#if isEditingThis}
					<!-- svelte-ignore a11y_autofocus -->
					<input
						type="number"
						bind:value={editingTimeValue}
						onkeydown={handleTimeKeydown}
						onblur={saveTimeEdit}
						onclick={(e) => e.stopPropagation()}
						step="0.1"
						min="0.1"
						max={duration / 1000}
						class="w-full text-xs font-medium bg-white border border-primary rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
						autofocus
					/>
				{:else}
					<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
					<span
						onclick={(e) => { e.stopPropagation(); startEditingTime(index); }}
						class="text-sm font-semibold transition-colors block"
						class:hover:text-primary={index !== 0}
						class:cursor-pointer={index !== 0}
						class:cursor-default={index === 0}
						title={index === 0 ? 'Start is always at 0s' : 'Click to edit time'}
					>
						{formatTime(keyframe.time)}
					</span>
				{/if}
				{#if eventsHere.length > 0}
					<div class="mt-1 text-[10px] text-text-muted truncate">
						{eventsHere.join(', ')}
					</div>
				{/if}
			</div>
		{/each}

		<!-- Add keyframe button -->
		<button
			onclick={addKeyframe}
			class="group flex-shrink-0 w-24 p-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary-light/50 transition-all flex flex-col items-center justify-center text-text-muted hover:text-primary"
			title="Add a new keyframe"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:scale-110">
				<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
			</svg>
			<span class="text-[10px] mt-1 font-medium">Add Frame</span>
		</button>
	</div>
</div>
