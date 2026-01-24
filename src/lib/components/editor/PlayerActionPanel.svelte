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
	<div class="bg-surface border border-border rounded-2xl p-5 shadow-lg">
		<div class="flex items-start justify-between gap-4">
			<!-- Player info -->
			<div class="flex items-center gap-4">
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
								class="w-12 h-12 rounded-xl object-cover border-2 border-border group-hover:border-primary transition-all shadow-sm"
							/>
						{:else}
							<div class="w-12 h-12 rounded-xl bg-primary/10 border-2 border-border flex items-center justify-center text-xl font-bold text-primary group-hover:border-primary transition-all">
								{selectedPlayer.id.toUpperCase().charAt(0)}
							</div>
						{/if}
						<span class="absolute -bottom-1 -right-1 w-5 h-5 bg-surface border-2 border-border rounded-lg flex items-center justify-center text-xs group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all shadow-sm">
							<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
								<path d="M12 20h9"/>
								<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
							</svg>
						</span>
					</button>
					<div>
						<div class="font-bold text-lg">
							Player {selectedPlayer.id.toUpperCase()}
						</div>
						{#if selectedHasBall}
							<div class="flex items-center gap-1.5 text-sm text-text-muted">
								<span>⚽</span> Has the ball
							</div>
						{:else}
							<div class="text-sm text-text-muted">Click on pitch to move</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Close button -->
			<button
				onclick={dismiss}
				class="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-dim rounded-lg transition-all"
				title="Close"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
				</svg>
			</button>
		</div>

		<!-- Actions row -->
		{#if !isEditingImage}
			<div class="mt-4 flex flex-wrap gap-2">
				<button
					onclick={removePlayer}
					class="flex items-center gap-1.5 bg-error-light hover:bg-error/20 text-error px-3 py-2 rounded-xl text-sm font-medium transition-all"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="3 6 5 6 21 6"/>
						<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
					</svg>
					Remove Player
				</button>
			</div>

			<!-- Ball holder actions -->
			{#if selectedHasBall}
				<div class="mt-4 pt-4 border-t border-border">
					<div class="flex items-center gap-2 text-xs text-text-muted mb-3">
						<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="12" r="10"/>
							<path d="M12 16v-4M12 8h.01"/>
						</svg>
						Actions (or drag from blue button on pitch)
					</div>
					<div class="flex flex-wrap gap-2">
						{#each players.filter((p) => p.id !== selectedId) as target (target.id)}
							<button
								onclick={() => addPass(target.id)}
								class="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-xl text-sm font-medium transition-all border border-blue-200 hover:border-blue-300"
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="9 10 4 15 9 20"/>
									<path d="M20 4v7a4 4 0 0 1-4 4H4"/>
								</svg>
								Pass to {target.id.toUpperCase()}
							</button>
						{/each}
						<button
							onclick={addShot}
							class="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<circle cx="12" cy="12" r="10"/>
							</svg>
							Shoot!
						</button>
					</div>
				</div>
			{/if}
		{/if}
	</div>
{/if}
