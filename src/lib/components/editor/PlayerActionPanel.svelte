<script lang="ts">
	import { editorState } from '$lib/editor-state.svelte';
	import FlagSelector from './FlagSelector.svelte';

	const players = $derived(editorState.animation.players);
	const selectedId = $derived(editorState.selectedPlayerId);
	const currentKeyframe = $derived(editorState.currentKeyframe);
	const ballHolder = $derived(currentKeyframe?.positions?.ball?.holder);

	const selectedPlayer = $derived(players.find((p) => p.id === selectedId));
	const selectedHasBall = $derived(ballHolder === selectedId);

	let isEditingImage = $state(false);
	let editImageUrl = $state('');

	function dismiss() {
		editorState.selectedPlayerId = null;
	}

	function removePlayer() {
		if (selectedId) {
			editorState.removePlayer(selectedId);
		}
	}

	function addPass(toId: string) {
		if (selectedId && selectedId !== toId) {
			editorState.addEvent('pass', selectedId, toId);
		}
	}

	function addShot() {
		if (selectedId) {
			editorState.addEvent('shot', selectedId);
		}
	}

	function startEditingImage() {
		editImageUrl = selectedPlayer?.imageUrl ?? '';
		isEditingImage = true;
	}

	function saveImageEdit(url: string) {
		if (selectedId) {
			editorState.setPlayerImageUrl(selectedId, url || undefined);
		}
		isEditingImage = false;
		editImageUrl = '';
	}

	function cancelImageEdit() {
		isEditingImage = false;
		editImageUrl = '';
	}
</script>

{#if selectedId && selectedPlayer}
	<div class="bg-surface border border-border rounded-xl p-4 shadow-lg">
		<div class="flex items-start justify-between gap-4">
			<!-- Player info -->
			<div class="flex items-center gap-3">
				{#if isEditingImage}
					<FlagSelector
						bind:value={editImageUrl}
						onselect={saveImageEdit}
						oncancel={cancelImageEdit}
					/>
				{:else}
					<button
						onclick={startEditingImage}
						class="relative group"
						title="Click to change image"
					>
						{#if selectedPlayer.imageUrl}
							<img
								src={selectedPlayer.imageUrl}
								alt=""
								class="w-10 h-10 rounded-full object-cover border-2 border-border group-hover:border-primary transition-colors"
							/>
						{:else}
							<div class="w-10 h-10 rounded-full bg-surface-dim border-2 border-border flex items-center justify-center text-lg font-bold text-text-muted group-hover:border-primary transition-colors">
								{selectedPlayer.id.toUpperCase().charAt(0)}
							</div>
						{/if}
						<span class="absolute -bottom-1 -right-1 w-4 h-4 bg-surface-dim border border-border rounded-full flex items-center justify-center text-[10px] group-hover:bg-primary group-hover:text-white transition-colors">
							+
						</span>
					</button>
					<div>
						<div class="font-medium">
							{selectedPlayer.id.toUpperCase()}
						</div>
						{#if selectedHasBall}
							<div class="text-xs text-text-muted">Has the ball</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Close button -->
			<button
				onclick={dismiss}
				class="text-text-muted hover:text-text transition-colors p-1"
				title="Close"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Actions row -->
		{#if !isEditingImage}
			<div class="mt-3 flex flex-wrap gap-2">
				<button
					onclick={removePlayer}
					class="bg-error-light hover:bg-error/20 text-error px-3 py-1.5 rounded-lg text-sm transition-colors"
				>
					Remove
				</button>
			</div>

			<!-- Ball holder actions -->
			{#if selectedHasBall}
				<div class="mt-3 pt-3 border-t border-border">
					<p class="text-xs text-text-muted mb-2">Actions (or drag from blue button on pitch):</p>
					<div class="flex flex-wrap gap-2">
						{#each players.filter((p) => p.id !== selectedId) as target (target.id)}
							<button
								onclick={() => addPass(target.id)}
								class="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-sm transition-colors border border-blue-200"
							>
								Pass to {target.id.toUpperCase()}
							</button>
						{/each}
						<button
							onclick={addShot}
							class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
						>
							Shoot!
						</button>
					</div>
				</div>
			{/if}
		{/if}
	</div>
{/if}
