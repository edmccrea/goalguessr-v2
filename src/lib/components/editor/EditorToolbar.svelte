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

<div class="bg-surface border border-border rounded-xl p-3">
	<div class="flex items-center justify-between gap-4 flex-wrap">
		<!-- Left: Player management -->
		<div class="flex items-center gap-2 flex-wrap">
			{#if isAddingPlayer}
				<FlagSelector
					bind:value={imageUrlInput}
					onselect={(url) => addPlayer(url)}
					oncancel={cancelAddPlayer}
				/>
			{:else}
				<button
					onclick={() => (isAddingPlayer = true)}
					disabled={playerCount >= 6}
					class="bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
				>
					<span class="text-lg leading-none">+</span> Player
				</button>
			{/if}

			<!-- Player badges -->
			{#if players.length > 0}
				<div class="h-6 w-px bg-border mx-1"></div>
				<div class="flex items-center gap-1.5">
					{#each players as player (player.id)}
						{@const isSelected = selectedId === player.id}
						{@const hasBall = ballHolder === player.id}
						<button
							onclick={() => selectPlayer(player.id)}
							class="relative flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium transition-all border-2"
							class:border-primary={isSelected}
							class:bg-primary-light={isSelected}
							class:border-transparent={!isSelected}
							class:bg-surface-dim={!isSelected}
							class:hover:bg-border={!isSelected}
							title={player.id.toUpperCase() + (hasBall ? ' (Has ball)' : '')}
						>
							{#if player.imageUrl}
								<img
									src={player.imageUrl}
									alt=""
									class="w-5 h-5 rounded-full object-cover"
								/>
							{:else}
								<span class="text-xs">{player.id.toUpperCase()}</span>
							{/if}
							{#if hasBall}
								<span class="text-xs">⚽</span>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Right: Frame navigation -->
		<div class="flex items-center gap-2">
			<button
				onclick={goToPreviousFrame}
				disabled={selectedKeyframeIndex === 0}
				class="px-2 py-1 text-sm bg-surface-dim hover:bg-border rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
				title="Previous frame"
			>
				←
			</button>
			<div class="text-sm font-medium min-w-[120px] text-center">
				<span class="text-text-muted">Frame</span>
				<span class="mx-1">{selectedKeyframeIndex + 1} / {keyframes.length}</span>
				<span class="text-text-muted">({formatTime(currentKeyframe?.time ?? 0)})</span>
			</div>
			<button
				onclick={goToNextFrame}
				disabled={selectedKeyframeIndex >= keyframes.length - 1}
				class="px-2 py-1 text-sm bg-surface-dim hover:bg-border rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
				title="Next frame"
			>
				→
			</button>
		</div>
	</div>
</div>
