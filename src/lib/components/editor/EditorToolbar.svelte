<script lang="ts">
	import { editorState } from '$lib/editor-state.svelte';
	import FlagSelector from './FlagSelector.svelte';

	const players = $derived(editorState.animation.players);
	const selectedId = $derived(editorState.selectedPlayerId);
	const playerCount = $derived(editorState.playerCount);
	const keyframes = $derived(editorState.animation.keyframes);
	const selectedKeyframeIndex = $derived(editorState.selectedKeyframeIndex);
	const currentKeyframe = $derived(editorState.currentKeyframe);
	const ballHolder = $derived(currentKeyframe?.positions?.ball?.holder);

	let isAddingPlayer = $state(false);
	let imageUrlInput = $state('');

	function addPlayer(imageUrl?: string) {
		const id = editorState.addPlayer(imageUrl || undefined);
		editorState.selectedPlayerId = id;
		imageUrlInput = '';
		isAddingPlayer = false;
	}

	function cancelAddPlayer() {
		isAddingPlayer = false;
		imageUrlInput = '';
	}

	function selectPlayer(id: string) {
		editorState.selectedPlayerId = editorState.selectedPlayerId === id ? null : id;
	}

	function goToPreviousFrame() {
		if (selectedKeyframeIndex > 0) {
			editorState.selectedKeyframeIndex = selectedKeyframeIndex - 1;
		}
	}

	function goToNextFrame() {
		if (selectedKeyframeIndex < keyframes.length - 1) {
			editorState.selectedKeyframeIndex = selectedKeyframeIndex + 1;
		}
	}

	function formatTime(ms: number): string {
		return (ms / 1000).toFixed(1) + 's';
	}
</script>

<div class="bg-surface border border-border rounded-2xl p-4 shadow-lg">
	<div class="flex items-center justify-between gap-4 flex-wrap">
		<!-- Left: Player management -->
		<div class="flex items-center gap-3 flex-wrap">
			<div class="flex items-center gap-2">
				<div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
						<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
						<circle cx="9" cy="7" r="4"/>
						<path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
					</svg>
				</div>
				<span class="text-sm font-medium text-text-muted">Players</span>
			</div>

			{#if isAddingPlayer}
				<FlagSelector
					bind:value={imageUrlInput}
					onselect={(url) => addPlayer(url)}
					oncancel={cancelAddPlayer}
					allowCustomUrl={false}
				/>
			{:else}
				<button
					onclick={() => (isAddingPlayer = true)}
					disabled={playerCount >= 6}
					class="bg-primary hover:bg-primary-hover text-white px-3 py-2 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
					</svg>
					Add Player
				</button>
			{/if}

			<!-- Player badges -->
			{#if players.length > 0}
				<div class="h-8 w-px bg-border"></div>
				<div class="flex items-center gap-2">
					{#each players as player (player.id)}
						{@const isSelected = selectedId === player.id}
						{@const hasBall = ballHolder === player.id}
						<button
							onclick={() => selectPlayer(player.id)}
							class="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm font-medium transition-all border-2"
							class:border-primary={isSelected}
							class:bg-primary-light={isSelected}
							class:shadow-sm={isSelected}
							class:border-transparent={!isSelected}
							class:bg-surface-dim={!isSelected}
							class:hover:bg-border={!isSelected}
							title={player.id.toUpperCase() + (hasBall ? ' (Has ball)' : '')}
						>
							{#if player.imageUrl}
								<img
									src={player.imageUrl}
									alt=""
									class="w-6 h-6 rounded-full object-cover ring-1 ring-border"
								/>
							{:else}
								<span class="text-xs font-bold">{player.id.toUpperCase()}</span>
							{/if}
							{#if hasBall}
								<span class="text-sm">⚽</span>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Right: Frame navigation -->
		<div class="flex items-center gap-2 bg-surface-dim rounded-xl px-2 py-1.5">
			<button
				onclick={goToPreviousFrame}
				disabled={selectedKeyframeIndex === 0}
				class="w-8 h-8 flex items-center justify-center text-sm bg-surface hover:bg-border rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
				title="Previous frame"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M19 12H5M12 19l-7-7 7-7"/>
				</svg>
			</button>
			<div class="text-sm font-medium min-w-[100px] text-center px-2">
				<span class="text-primary font-bold">{selectedKeyframeIndex + 1}</span>
				<span class="text-text-muted mx-1">/</span>
				<span class="text-text-muted">{keyframes.length}</span>
				<span class="text-text-muted text-xs ml-1">({formatTime(currentKeyframe?.time ?? 0)})</span>
			</div>
			<button
				onclick={goToNextFrame}
				disabled={selectedKeyframeIndex >= keyframes.length - 1}
				class="w-8 h-8 flex items-center justify-center text-sm bg-surface hover:bg-border rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
				title="Next frame"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M5 12h14M12 5l7 7-7 7"/>
				</svg>
			</button>
		</div>
	</div>
</div>
