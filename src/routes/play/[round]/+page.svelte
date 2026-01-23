<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { GoalAnimation } from '$lib/components/animation';
	import Combobox from '$lib/components/Combobox.svelte';
	import type { AnimationData } from '$lib/server/db/schema';

	interface Suggestion {
		id: string;
		label: string;
		sublabel?: string;
	}

	let { data, form } = $props();

	let team = $state('');
	let year = $state('');
	let scorer = $state('');
	let startTime = $state(Date.now());
	let elapsed = $state(0);
	let isSubmitting = $state(false);

	// Suggestions for autocomplete
	let teamSuggestions = $state<Suggestion[]>([]);
	let scorerSuggestions = $state<Suggestion[]>([]);

	// Search functions for autocomplete
	async function searchTeams(query: string) {
		const params = new URLSearchParams({ q: query });
		if (data.isInternational) params.set('international', 'true');

		try {
			const res = await fetch(`/api/search/teams?${params}`);
			const result = await res.json();
			teamSuggestions = result.suggestions ?? [];
		} catch {
			teamSuggestions = [];
		}
	}

	async function searchPlayers(query: string) {
		try {
			const res = await fetch(`/api/search/players?q=${encodeURIComponent(query)}`);
			const result = await res.json();
			scorerSuggestions = result.suggestions ?? [];
		} catch {
			scorerSuggestions = [];
		}
	}

	// Derive showResult from form success
	const showResult = $derived(form?.success === true);

	// Reset timer and form when round changes
	$effect(() => {
		// Track round number to trigger reset
		const _round = data.roundNumber;

		// Reset all state for new round
		team = '';
		year = '';
		scorer = '';
		startTime = Date.now();
		elapsed = 0;
		isSubmitting = false;
		teamSuggestions = [];
		scorerSuggestions = [];
	});

	// Restore form values on error
	$effect(() => {
		if (form && 'error' in form && form.error) {
			team = (form as { team?: string }).team ?? team;
			year = (form as { year?: string }).year ?? year;
			scorer = (form as { scorer?: string }).scorer ?? scorer;
		}
	});

	// Timer (only run when not showing result)
	$effect(() => {
		if (showResult) return;
		const interval = setInterval(() => {
			elapsed = Math.floor((Date.now() - startTime) / 1000);
		}, 1000);
		return () => clearInterval(interval);
	});

	const formattedTime = $derived(() => {
		const mins = Math.floor(elapsed / 60);
		const secs = elapsed % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	});

	function getTimeTakenMs(): number {
		return Date.now() - startTime;
	}
</script>

<div class="min-h-screen p-4 md:p-8">
	<div class="max-w-6xl mx-auto">
		<!-- Header -->
		<div class="flex justify-between items-center mb-6">
			<div>
				<a href="/play" class="text-text-muted hover:text-primary text-sm">&larr; Back to game</a>
				<h1 class="text-2xl md:text-3xl font-bold">Round {data.roundNumber}</h1>
			</div>
			<div class="text-right">
				<div class="text-sm text-text-muted">Time</div>
				<div class="text-xl md:text-2xl font-mono text-primary">{formattedTime()}</div>
			</div>
		</div>

		<!-- Main content: Animation + Form/Result side by side on desktop -->
		<div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
			<!-- Animation (left side - 3/5 width on desktop) -->
			<div class="lg:col-span-3 aspect-[16/10] rounded-xl overflow-hidden border border-border shadow-sm">
				<GoalAnimation animation={data.animationData as AnimationData} autoPlay={true} loop={true} />
			</div>

			<!-- Form or Result (right side - 2/5 width on desktop) -->
			<div class="lg:col-span-2 flex flex-col">
				{#if showResult && form?.result}
					<!-- Result display -->
					<div class="bg-surface rounded-xl p-5 flex-1 border border-border shadow-sm">
						<div class="flex justify-between items-start mb-4">
							<h2 class="text-xl font-bold">
								{#if form.result.totalPoints >= 30}
									Excellent!
								{:else if form.result.totalPoints >= 20}
									Good job!
								{:else if form.result.totalPoints >= 10}
									Not bad!
								{:else}
									Better luck next time!
								{/if}
							</h2>
							<div class="text-2xl font-bold text-primary">
								{form.result.totalPoints} pts
							</div>
						</div>

						<div class="grid gap-3 mb-4">
							<!-- Team -->
							<div class="flex justify-between items-center p-3 rounded-lg {form.result.teamCorrect ? 'bg-success-light' : 'bg-error-light'}">
								<div>
									<div class="text-xs text-text-muted">Team</div>
									<div class="font-semibold">{form.result.correctAnswer.team}</div>
									{#if !form.result.teamCorrect}
										<div class="text-xs text-text-muted">You: {team}</div>
									{/if}
								</div>
								<div class="{form.result.teamCorrect ? 'text-success' : 'text-error'} font-bold">
									{form.result.teamCorrect ? '+10' : '0'}
								</div>
							</div>

							<!-- Year -->
							<div class="flex justify-between items-center p-3 rounded-lg {form.result.yearCorrect ? 'bg-success-light' : form.result.yearClose ? 'bg-warning-light' : 'bg-error-light'}">
								<div>
									<div class="text-xs text-text-muted">Year</div>
									<div class="font-semibold">{form.result.correctAnswer.year}</div>
									{#if !form.result.yearCorrect}
										<div class="text-xs text-text-muted">
											You: {year}
											{#if form.result.yearClose}
												<span class="text-warning">(Close!)</span>
											{/if}
										</div>
									{/if}
								</div>
								<div class="{form.result.yearCorrect ? 'text-success' : form.result.yearClose ? 'text-warning' : 'text-error'} font-bold">
									{form.result.yearPoints}
								</div>
							</div>

							<!-- Scorer -->
							<div class="flex justify-between items-center p-3 rounded-lg {form.result.scorerCorrect ? 'bg-success-light' : 'bg-error-light'}">
								<div>
									<div class="text-xs text-text-muted">Goalscorer</div>
									<div class="font-semibold">{form.result.correctAnswer.scorer}</div>
									{#if !form.result.scorerCorrect}
										<div class="text-xs text-text-muted">You: {scorer}</div>
									{/if}
								</div>
								<div class="{form.result.scorerCorrect ? 'text-success' : 'text-error'} font-bold">
									{form.result.scorerCorrect ? '+10' : '0'}
								</div>
							</div>

							<!-- Speed bonus -->
							{#if true}
								{@const correctCount = (form.result.teamCorrect ? 1 : 0) + (form.result.yearCorrect ? 1 : form.result.yearClose ? 0.5 : 0) + (form.result.scorerCorrect ? 1 : 0)}
								<div class="flex justify-between items-center p-3 rounded-lg {form.result.speedBonus > 0 ? 'bg-primary-light' : 'bg-surface-dim'}">
									<div>
										<div class="text-xs text-text-muted">Speed Bonus</div>
										<div class="text-xs text-text-muted">
											{Math.floor(form.result.timeTakenMs / 1000)}s
											{#if correctCount === 0}
												· No bonus
											{:else if correctCount < 3}
												· {Math.round(correctCount)}/3 multiplier
											{:else}
												· Full bonus!
											{/if}
										</div>
									</div>
									<div class="{form.result.speedBonus > 0 ? 'text-primary' : 'text-text-muted'} font-bold">
										+{form.result.speedBonus}
									</div>
								</div>
							{/if}
						</div>

						<!-- Match context -->
						{#if form.result.correctAnswer.competition || form.result.correctAnswer.matchContext}
							<div class="border-t border-border pt-3 text-sm text-text-muted">
								{#if form.result.correctAnswer.competition}
									<div>{form.result.correctAnswer.competition}</div>
								{/if}
								{#if form.result.correctAnswer.opponent}
									<div>vs {form.result.correctAnswer.opponent}</div>
								{/if}
								{#if form.result.correctAnswer.matchContext}
									<div class="mt-1 italic text-xs">{form.result.correctAnswer.matchContext}</div>
								{/if}
							</div>
						{/if}
					</div>

					<!-- Next round button -->
					<div class="mt-4">
						{#if form.nextRound}
							<button
								onclick={() => goto(`/play/${form.nextRound}`)}
								class="w-full bg-primary hover:bg-primary-hover text-white px-6 py-4 rounded-xl font-bold transition-colors"
							>
								Next Round &rarr;
							</button>
						{:else}
							<button
								onclick={() => goto('/results')}
								class="w-full bg-primary hover:bg-primary-hover text-white px-6 py-4 rounded-xl font-bold transition-colors"
							>
								View Final Results
							</button>
						{/if}
					</div>
				{:else}
					<!-- Guess form -->
					<form
						method="POST"
						action="?/submit"
						use:enhance={() => {
							isSubmitting = true;
							return async ({ result, update }) => {
								isSubmitting = false;
								if (result.type === 'success') {
									await update({ reset: false, invalidateAll: false });
								} else {
									await update();
								}
							};
						}}
						class="bg-surface rounded-xl p-5 flex-1 flex flex-col border border-border shadow-sm"
					>
						<h2 class="text-lg font-semibold mb-4">Make your guess</h2>

						<input type="hidden" name="timeTakenMs" value={getTimeTakenMs()} />

						{#if form?.error}
							<div class="bg-error-light border border-error text-error px-4 py-3 rounded-lg mb-4 text-sm">
								{form.error}
							</div>
						{/if}

						<div class="grid gap-4 flex-1">
							<div>
								<label for="team" class="block text-sm font-medium mb-1.5">
									{data.isInternational ? 'National Team' : 'Club'}
								</label>
								<Combobox
									id="team"
									name="team"
									bind:value={team}
									placeholder={data.isInternational ? 'e.g. Argentina' : 'e.g. Manchester United'}
									disabled={isSubmitting}
									suggestions={teamSuggestions}
									onSearch={searchTeams}
								/>
							</div>

							<div>
								<label for="year" class="block text-sm font-medium mb-1.5">Year</label>
								<input
									type="number"
									id="year"
									name="year"
									bind:value={year}
									min="1900"
									max={new Date().getFullYear()}
									class="w-full bg-surface-dim border border-border rounded-lg px-4 py-2.5 focus:border-primary focus:outline-none"
									placeholder="e.g. 2014"
									disabled={isSubmitting}
								/>
							</div>

							<div>
								<label for="scorer" class="block text-sm font-medium mb-1.5">Goalscorer</label>
								<Combobox
									id="scorer"
									name="scorer"
									bind:value={scorer}
									placeholder="e.g. Lionel Messi"
									disabled={isSubmitting}
									suggestions={scorerSuggestions}
									onSearch={searchPlayers}
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={isSubmitting || !team || !year || !scorer}
							class="mt-4 bg-primary hover:bg-primary-hover disabled:bg-surface-dim disabled:text-text-muted disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
						>
							{isSubmitting ? 'Submitting...' : 'Submit Guess'}
						</button>

						<p class="text-center text-text-muted text-xs mt-3">
							Answer quickly for a speed bonus!
						</p>
					</form>
				{/if}
			</div>
		</div>
	</div>
</div>
