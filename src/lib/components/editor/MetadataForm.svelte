<script lang="ts">
	import { editorState } from '$lib/editor-state.svelte';
	import Combobox from '$lib/components/Combobox.svelte';

	interface Props {
		onsubmit: () => void;
		isSubmitting?: boolean;
	}

	let { onsubmit, isSubmitting = false }: Props = $props();

	const metadata = $derived(editorState.metadata);
	const validation = $derived(editorState.validate());

	// Suggestion state for comboboxes
	interface Suggestion {
		id: string;
		label: string;
		sublabel?: string;
	}

	let teamSuggestions = $state<Suggestion[]>([]);
	let scorerSuggestions = $state<Suggestion[]>([]);
	let opponentSuggestions = $state<Suggestion[]>([]);
	let competitionSuggestions = $state<Suggestion[]>([]);

	async function searchTeams(query: string) {
		try {
			const params = new URLSearchParams({ q: query });
			if (metadata.isInternational) {
				params.set('international', 'true');
			}
			const res = await fetch(`/api/search/teams?${params}`);
			const data = await res.json();
			teamSuggestions = data.suggestions ?? [];
		} catch {
			teamSuggestions = [];
		}
	}

	async function searchScorers(query: string) {
		try {
			const res = await fetch(`/api/search/players?q=${encodeURIComponent(query)}`);
			const data = await res.json();
			scorerSuggestions = data.suggestions ?? [];
		} catch {
			scorerSuggestions = [];
		}
	}

	async function searchOpponents(query: string) {
		try {
			const params = new URLSearchParams({ q: query });
			if (metadata.isInternational) {
				params.set('international', 'true');
			}
			const res = await fetch(`/api/search/teams?${params}`);
			const data = await res.json();
			opponentSuggestions = data.suggestions ?? [];
		} catch {
			opponentSuggestions = [];
		}
	}

	async function searchCompetitions(query: string) {
		try {
			const params = new URLSearchParams({ q: query });
			if (metadata.isInternational) {
				params.set('international', 'true');
			}
			const res = await fetch(`/api/search/competitions?${params}`);
			const data = await res.json();
			competitionSuggestions = data.suggestions ?? [];
		} catch {
			competitionSuggestions = [];
		}
	}
</script>

<div class="bg-surface border border-border rounded-xl p-6 space-y-4">
	<h2 class="font-semibold text-lg">Goal Details</h2>

	<div>
		<label for="team" class="block text-sm font-medium mb-1.5">
			Team <span class="text-error">*</span>
		</label>
		<Combobox
			id="team"
			name="team"
			bind:value={metadata.team}
			placeholder="e.g. Manchester United"
			suggestions={teamSuggestions}
			onSearch={searchTeams}
		/>
	</div>

	<div>
		<label for="year" class="block text-sm font-medium mb-1.5">
			Year <span class="text-error">*</span>
		</label>
		<input
			type="number"
			id="year"
			bind:value={metadata.year}
			min="1900"
			max={new Date().getFullYear() + 1}
			class="w-full bg-surface border border-border rounded-lg px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
			placeholder="e.g. 1999"
		/>
	</div>

	<div>
		<label for="scorer" class="block text-sm font-medium mb-1.5">
			Goalscorer <span class="text-error">*</span>
		</label>
		<Combobox
			id="scorer"
			name="scorer"
			bind:value={metadata.scorer}
			placeholder="e.g. Ole Gunnar Solskjaer"
			suggestions={scorerSuggestions}
			onSearch={searchScorers}
		/>
	</div>

	<div>
		<label for="competition" class="block text-sm font-medium mb-1.5">Competition</label>
		<Combobox
			id="competition"
			name="competition"
			bind:value={metadata.competition}
			placeholder="e.g. Champions League Final"
			suggestions={competitionSuggestions}
			onSearch={searchCompetitions}
		/>
	</div>

	<div>
		<label for="opponent" class="block text-sm font-medium mb-1.5">Opponent</label>
		<Combobox
			id="opponent"
			name="opponent"
			bind:value={metadata.opponent}
			placeholder="e.g. Bayern Munich"
			suggestions={opponentSuggestions}
			onSearch={searchOpponents}
		/>
	</div>

	<div>
		<label for="video" class="block text-sm font-medium mb-1.5">Video URL (optional)</label>
		<input
			type="url"
			id="video"
			bind:value={metadata.videoUrl}
			class="w-full bg-surface border border-border rounded-lg px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
			placeholder="https://..."
		/>
	</div>

	<div class="flex items-center gap-2">
		<input
			type="checkbox"
			id="international"
			bind:checked={metadata.isInternational}
			class="rounded border-border accent-primary"
		/>
		<label for="international" class="text-sm">International Match</label>
	</div>

	<!-- Validation errors -->
	{#if !validation.valid && validation.errors.length > 0}
		<div class="bg-error-light border border-error/20 rounded-lg p-3">
			<p class="text-sm font-medium text-error mb-1">Please fix the following:</p>
			<ul class="text-sm text-error/80 list-disc list-inside">
				{#each validation.errors as error}
					<li>{error}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<button
		onclick={onsubmit}
		disabled={!validation.valid || isSubmitting}
		class="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
	>
		{#if isSubmitting}
			Submitting...
		{:else}
			Submit for Review
		{/if}
	</button>
</div>
