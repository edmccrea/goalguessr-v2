<script lang="ts">
	import Spinner from '$lib/components/ui/Spinner.svelte';

	type MissingEntities = {
		team?: string;
		player?: string;
		opponent?: string;
		competition?: string;
	};

	type TeamData = {
		name: string;
		country?: string;
		isNationalTeam?: boolean;
		logoUrl?: string;
	};

	type PlayerData = {
		name: string;
		nationality?: string;
		position?: string;
	};

	type CompetitionData = {
		name: string;
		type: 'league' | 'cup' | 'international';
		country?: string;
		isInternational?: boolean;
	};

	type EntityData = {
		team?: TeamData;
		player?: PlayerData;
		opponent?: TeamData;
		competition?: CompetitionData;
	};

	let {
		missingEntities,
		onConfirm,
		onCancel,
		isSubmitting = false
	}: {
		missingEntities: MissingEntities;
		onConfirm: (data: EntityData) => void;
		onCancel: () => void;
		isSubmitting?: boolean;
	} = $props();

	// Form state for each entity type - use derived for names from props
	let teamName = $derived(missingEntities.team || '');
	let playerName = $derived(missingEntities.player || '');
	let opponentName = $derived(missingEntities.opponent || '');
	let competitionName = $derived(missingEntities.competition || '');

	// Editable fields
	let teamCountry = $state('');
	let teamIsNational = $state(false);
	let playerNationality = $state('');
	let playerPosition = $state('');
	let opponentCountry = $state('');
	let opponentIsNational = $state(false);
	let competitionType = $state<'league' | 'cup' | 'international'>('cup');
	let competitionCountry = $state('');
	let competitionIsInternational = $state(false);

	function handleConfirm() {
		const data: EntityData = {};

		if (missingEntities.team) {
			data.team = {
				name: teamName,
				country: teamCountry || undefined,
				isNationalTeam: teamIsNational
			};
		}
		if (missingEntities.player) {
			data.player = {
				name: playerName,
				nationality: playerNationality || undefined,
				position: playerPosition || undefined
			};
		}
		if (missingEntities.opponent) {
			data.opponent = {
				name: opponentName,
				country: opponentCountry || undefined,
				isNationalTeam: opponentIsNational
			};
		}
		if (missingEntities.competition) {
			data.competition = {
				name: competitionName,
				type: competitionType,
				country: competitionCountry || undefined,
				isInternational: competitionIsInternational
			};
		}

		onConfirm(data);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onCancel();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Modal Overlay -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_interactive_supports_focus -->
<div
	class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
	role="dialog"
	aria-modal="true"
	tabindex="-1"
	onclick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
>
	<div class="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
		<!-- Header -->
		<div class="p-6 border-b border-border">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-500">
						<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
						<line x1="12" y1="9" x2="12" y2="13"/>
						<line x1="12" y1="17" x2="12.01" y2="17"/>
					</svg>
				</div>
				<div>
					<h2 class="text-xl font-bold">New Entities Detected</h2>
					<p class="text-sm text-text-muted">The following entities need to be added to the database</p>
				</div>
			</div>
		</div>

		<!-- Content -->
		<div class="p-6 space-y-6">
			<!-- Team Section -->
			{#if missingEntities.team}
				<div class="bg-background rounded-xl p-4">
					<div class="flex items-center gap-2 mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
							<path d="M16.5 9.4 7.55 4.24"/>
							<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
							<polyline points="3.29 7 12 12 20.71 7"/>
							<line x1="12" x2="12" y1="22" y2="12"/>
						</svg>
						<h3 class="font-semibold">New Team: {missingEntities.team}</h3>
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label for="team-name" class="block text-sm text-text-muted mb-1.5">Name</label>
							<input
								id="team-name"
								type="text"
								readonly
								value={teamName}
								class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-muted cursor-not-allowed"
							/>
						</div>
						<div>
							<label for="team-country" class="block text-sm text-text-muted mb-1.5">Country</label>
							<input
								id="team-country"
								type="text"
								bind:value={teamCountry}
								placeholder="e.g., England"
								class="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							/>
						</div>
						<div class="flex items-center gap-2">
							<input
								type="checkbox"
								id="team-national"
								bind:checked={teamIsNational}
								class="w-4 h-4 rounded border-border text-primary focus:ring-primary"
							/>
							<label for="team-national" class="text-sm">National Team</label>
						</div>
					</div>
				</div>
			{/if}

			<!-- Player Section -->
			{#if missingEntities.player}
				<div class="bg-background rounded-xl p-4">
					<div class="flex items-center gap-2 mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
							<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
							<circle cx="12" cy="7" r="4"/>
						</svg>
						<h3 class="font-semibold">New Player: {missingEntities.player}</h3>
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label for="player-name" class="block text-sm text-text-muted mb-1.5">Name</label>
							<input
								id="player-name"
								type="text"
								readonly
								value={playerName}
								class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-muted cursor-not-allowed"
							/>
						</div>
						<div>
							<label for="player-nationality" class="block text-sm text-text-muted mb-1.5">Nationality</label>
							<input
								id="player-nationality"
								type="text"
								bind:value={playerNationality}
								placeholder="e.g., Brazil"
								class="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							/>
						</div>
						<div>
							<label for="player-position" class="block text-sm text-text-muted mb-1.5">Position</label>
							<input
								id="player-position"
								type="text"
								bind:value={playerPosition}
								placeholder="e.g., Forward, Midfielder"
								class="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							/>
						</div>
					</div>
				</div>
			{/if}

			<!-- Opponent Section -->
			{#if missingEntities.opponent}
				<div class="bg-background rounded-xl p-4">
					<div class="flex items-center gap-2 mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
							<path d="M16.5 9.4 7.55 4.24"/>
							<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
							<polyline points="3.29 7 12 12 20.71 7"/>
							<line x1="12" x2="12" y1="22" y2="12"/>
						</svg>
						<h3 class="font-semibold">New Opponent: {missingEntities.opponent}</h3>
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label for="opponent-name" class="block text-sm text-text-muted mb-1.5">Name</label>
							<input
								id="opponent-name"
								type="text"
								readonly
								value={opponentName}
								class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-muted cursor-not-allowed"
							/>
						</div>
						<div>
							<label for="opponent-country" class="block text-sm text-text-muted mb-1.5">Country</label>
							<input
								id="opponent-country"
								type="text"
								bind:value={opponentCountry}
								placeholder="e.g., Spain"
								class="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							/>
						</div>
						<div class="flex items-center gap-2">
							<input
								type="checkbox"
								id="opponent-national"
								bind:checked={opponentIsNational}
								class="w-4 h-4 rounded border-border text-primary focus:ring-primary"
							/>
							<label for="opponent-national" class="text-sm">National Team</label>
						</div>
					</div>
				</div>
			{/if}

			<!-- Competition Section -->
			{#if missingEntities.competition}
				<div class="bg-background rounded-xl p-4">
					<div class="flex items-center gap-2 mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
							<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
							<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
							<path d="M4 22h16"/>
							<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
							<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
							<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
						</svg>
						<h3 class="font-semibold">New Competition: {missingEntities.competition}</h3>
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label for="competition-name" class="block text-sm text-text-muted mb-1.5">Name</label>
							<input
								id="competition-name"
								type="text"
								readonly
								value={competitionName}
								class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-muted cursor-not-allowed"
							/>
						</div>
						<div>
							<label for="competition-type" class="block text-sm text-text-muted mb-1.5">Type <span class="text-red-500">*</span></label>
							<select
								id="competition-type"
								bind:value={competitionType}
								class="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							>
								<option value="league">League</option>
								<option value="cup">Cup</option>
								<option value="international">International</option>
							</select>
						</div>
						<div>
							<label for="competition-country" class="block text-sm text-text-muted mb-1.5">Country</label>
							<input
								id="competition-country"
								type="text"
								bind:value={competitionCountry}
								placeholder="e.g., Europe"
								class="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							/>
						</div>
						<div class="flex items-center gap-2">
							<input
								type="checkbox"
								id="competition-international"
								bind:checked={competitionIsInternational}
								class="w-4 h-4 rounded border-border text-primary focus:ring-primary"
							/>
							<label for="competition-international" class="text-sm">International Competition</label>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<div class="p-6 border-t border-border flex gap-4">
			<button
				type="button"
				onclick={onCancel}
				disabled={isSubmitting}
				class="flex-1 bg-background hover:bg-surface border border-border text-text font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Cancel
			</button>
			<button
				type="button"
				onclick={handleConfirm}
				disabled={isSubmitting}
				class="flex-1 bg-primary hover:bg-primary-hover disabled:bg-primary/70 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
			>
				{#if isSubmitting}
					<Spinner size="md" />
					Creating & Approving...
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="20 6 9 17 4 12"/>
					</svg>
					Confirm & Approve
				{/if}
			</button>
		</div>
	</div>
</div>
