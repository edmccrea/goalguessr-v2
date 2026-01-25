<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { fly, scale, fade } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';
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
	let elapsed = $state(0);
	let isSubmitting = $state(false);
	let mounted = $state(false);

	// Use server's start time to prevent timer reset exploit
	const startTime = $derived(data.roundStartedAt);

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

	// Reset form when round changes
	$effect(() => {
		// Track round number to trigger reset
		const _round = data.roundNumber;

		// Reset form state for new round (startTime comes from server)
		team = '';
		year = '';
		scorer = '';
		elapsed = 0;
		isSubmitting = false;
		teamSuggestions = [];
		scorerSuggestions = [];
		mounted = true;
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
		// Calculate immediately on load (don't wait for first interval)
		elapsed = Math.floor((Date.now() - startTime) / 1000);
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

	function getScoreEmoji(points: number): string {
		if (points >= 35) return '🔥';
		if (points >= 30) return '🎯';
		if (points >= 20) return '👏';
		if (points >= 10) return '👍';
		return '💪';
	}

	function getScoreMessage(points: number): string {
		if (points >= 35) return 'Perfect!';
		if (points >= 30) return 'Excellent!';
		if (points >= 20) return 'Great job!';
		if (points >= 10) return 'Not bad!';
		return 'Keep trying!';
	}
</script>

<svelte:head>
	<title>Round {data.roundNumber} - Goal Guessr</title>
</svelte:head>

<div class="min-h-[calc(100vh-3.5rem)] p-4 md:p-8">
	<div class="max-w-6xl mx-auto">
		<!-- Header -->
		{#if mounted}
			<div
				class="flex justify-between items-center mb-6"
				in:fly={{ y: -20, duration: 400, easing: cubicOut }}
			>
				<div>
					<div class="flex items-center gap-3 mb-2">
						<span class="text-sm font-medium text-text-muted">Round</span>
						<div class="flex items-center gap-2">
							{#each [1, 2, 3] as round}
								<div
									class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all {round < data.roundNumber
										? 'bg-primary text-white'
										: round === data.roundNumber
											? 'bg-primary text-white ring-2 ring-primary ring-offset-2 ring-offset-background'
											: 'bg-surface-dim text-text-muted'}"
								>
									{#if round < data.roundNumber}
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
											<polyline points="20 6 9 17 4 12"/>
										</svg>
									{:else}
										{round}
									{/if}
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Timer -->
				<div class="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-2">
					<div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
							<circle cx="12" cy="12" r="10"/>
							<polyline points="12 6 12 12 16 14"/>
						</svg>
					</div>
					<div>
						<div class="text-xs text-text-muted uppercase tracking-wide">Time</div>
						<div class="text-xl font-mono font-bold text-text tabular-nums">{formattedTime()}</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Main content: Animation + Form/Result side by side on desktop -->
		<div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
			<!-- Animation (left side - 3/5 width on desktop) -->
			{#if mounted}
				<div
					class="lg:col-span-3"
					in:scale={{ start: 0.95, duration: 500, delay: 100, easing: backOut }}
				>
					<div class="aspect-[16/10] rounded-2xl overflow-hidden border border-border shadow-lg bg-surface">
						<GoalAnimation animation={data.animationData as AnimationData} autoPlay={true} loop={true} />
					</div>
					<p class="text-center text-text-muted text-sm mt-3">
						Watch the play carefully and make your guess
					</p>
				</div>
			{/if}

			<!-- Form or Result (right side - 2/5 width on desktop) -->
			<div class="lg:col-span-2 flex flex-col">
				{#if showResult && form?.result}
					<!-- Result display -->
					<div
						class="bg-surface rounded-2xl p-6 flex-1 border border-border shadow-lg"
						in:scale={{ start: 0.9, duration: 400, easing: backOut }}
					>
						<!-- Score header -->
						<div class="text-center mb-6 pb-6 border-b border-border">
							<div class="text-4xl mb-2">{getScoreEmoji(form.result.totalPoints)}</div>
							<h2 class="text-2xl font-bold mb-1">{getScoreMessage(form.result.totalPoints)}</h2>
							<div class="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
								<span class="text-2xl font-bold">{form.result.totalPoints}</span>
								<span class="text-sm font-medium">points</span>
							</div>
						</div>

						<!-- Results breakdown -->
						<div class="space-y-3 mb-6">
							<!-- Team -->
							<div
								class="flex items-center gap-3 p-3 rounded-xl transition-all {form.result.teamCorrect ? 'bg-success-light border border-success/20' : 'bg-error-light border border-error/20'}"
								in:fly={{ x: -20, duration: 300, delay: 100, easing: cubicOut }}
							>
								<div class="w-10 h-10 rounded-lg {form.result.teamCorrect ? 'bg-success/20' : 'bg-error/20'} flex items-center justify-center flex-shrink-0">
									{#if form.result.teamCorrect}
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-success">
											<polyline points="20 6 9 17 4 12"/>
										</svg>
									{:else}
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-error">
											<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
										</svg>
									{/if}
								</div>
								<div class="flex-1 min-w-0">
									<div class="text-xs text-text-muted uppercase tracking-wide">Team</div>
									<div class="font-semibold truncate">{form.result.correctAnswer.team}</div>
									{#if !form.result.teamCorrect}
										<div class="text-xs text-text-muted truncate">You guessed: {team}</div>
									{/if}
								</div>
								<div class="text-lg font-bold {form.result.teamCorrect ? 'text-success' : 'text-error'}">
									{form.result.teamCorrect ? '+10' : '0'}
								</div>
							</div>

							<!-- Year -->
							<div
								class="flex items-center gap-3 p-3 rounded-xl transition-all {form.result.yearCorrect ? 'bg-success-light border border-success/20' : form.result.yearClose ? 'bg-warning-light border border-warning/20' : 'bg-error-light border border-error/20'}"
								in:fly={{ x: -20, duration: 300, delay: 200, easing: cubicOut }}
							>
								<div class="w-10 h-10 rounded-lg {form.result.yearCorrect ? 'bg-success/20' : form.result.yearClose ? 'bg-warning/20' : 'bg-error/20'} flex items-center justify-center flex-shrink-0">
									{#if form.result.yearCorrect}
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-success">
											<polyline points="20 6 9 17 4 12"/>
										</svg>
									{:else if form.result.yearClose}
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-warning">
											<path d="M12 9v4M12 17h.01"/>
										</svg>
									{:else}
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-error">
											<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
										</svg>
									{/if}
								</div>
								<div class="flex-1 min-w-0">
									<div class="text-xs text-text-muted uppercase tracking-wide">Year</div>
									<div class="font-semibold">{form.result.correctAnswer.year}</div>
									{#if !form.result.yearCorrect}
										<div class="text-xs text-text-muted">
											You guessed: {year}
											{#if form.result.yearClose}
												<span class="text-warning font-medium">(Close!)</span>
											{/if}
										</div>
									{/if}
								</div>
								<div class="text-lg font-bold {form.result.yearCorrect ? 'text-success' : form.result.yearClose ? 'text-warning' : 'text-error'}">
									{form.result.yearCorrect ? '+10' : form.result.yearClose ? `+${form.result.yearPoints}` : '0'}
								</div>
							</div>

							<!-- Scorer -->
							<div
								class="flex items-center gap-3 p-3 rounded-xl transition-all {form.result.scorerCorrect ? 'bg-success-light border border-success/20' : 'bg-error-light border border-error/20'}"
								in:fly={{ x: -20, duration: 300, delay: 300, easing: cubicOut }}
							>
								<div class="w-10 h-10 rounded-lg {form.result.scorerCorrect ? 'bg-success/20' : 'bg-error/20'} flex items-center justify-center flex-shrink-0">
									{#if form.result.scorerCorrect}
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-success">
											<polyline points="20 6 9 17 4 12"/>
										</svg>
									{:else}
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-error">
											<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
										</svg>
									{/if}
								</div>
								<div class="flex-1 min-w-0">
									<div class="text-xs text-text-muted uppercase tracking-wide">Goalscorer</div>
									<div class="font-semibold truncate">{form.result.correctAnswer.scorer}</div>
									{#if !form.result.scorerCorrect}
										<div class="text-xs text-text-muted truncate">You guessed: {scorer}</div>
									{/if}
								</div>
								<div class="text-lg font-bold {form.result.scorerCorrect ? 'text-success' : 'text-error'}">
									{form.result.scorerCorrect ? '+10' : '0'}
								</div>
							</div>

							<!-- Speed bonus -->
							{#if true}
							{@const correctCount = (form.result.teamCorrect ? 1 : 0) + (form.result.yearCorrect ? 1 : form.result.yearClose ? 0.5 : 0) + (form.result.scorerCorrect ? 1 : 0)}
							<div
								class="flex items-center gap-3 p-3 rounded-xl {form.result.speedBonus > 0 ? 'bg-primary/10 border border-primary/20' : 'bg-surface-dim border border-border'}"
								in:fly={{ x: -20, duration: 300, delay: 400, easing: cubicOut }}
							>
								<div class="w-10 h-10 rounded-lg {form.result.speedBonus > 0 ? 'bg-primary/20' : 'bg-surface'} flex items-center justify-center flex-shrink-0">
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="{form.result.speedBonus > 0 ? 'text-primary' : 'text-text-muted'}">
										<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
									</svg>
								</div>
								<div class="flex-1 min-w-0">
									<div class="text-xs text-text-muted uppercase tracking-wide">Speed Bonus</div>
									<div class="text-sm text-text-muted">
										{Math.floor(form.result.timeTakenMs / 1000)}s
										{#if correctCount === 0}
											· No correct answers
										{:else if correctCount < 3}
											· {Math.round(correctCount)}/3 multiplier
										{:else}
											· Full bonus!
										{/if}
									</div>
								</div>
								<div class="text-lg font-bold {form.result.speedBonus > 0 ? 'text-primary' : 'text-text-muted'}">
									+{form.result.speedBonus}
								</div>
							</div>
							{/if}
						</div>

						<!-- Match context -->
						{#if form.result.correctAnswer.competition || form.result.correctAnswer.matchContext}
							<div
								class="bg-surface-dim rounded-xl p-4 text-sm"
								in:fade={{ duration: 300, delay: 500 }}
							>
								<div class="flex items-center gap-2 text-text-muted mb-2">
									<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<circle cx="12" cy="12" r="10"/>
										<path d="M12 16v-4M12 8h.01"/>
									</svg>
									<span class="text-xs uppercase tracking-wide">Match Details</span>
								</div>
								{#if form.result.correctAnswer.competition}
									<div class="font-medium">{form.result.correctAnswer.competition}</div>
								{/if}
								{#if form.result.correctAnswer.opponent}
									<div class="text-text-muted">vs {form.result.correctAnswer.opponent}</div>
								{/if}
								{#if form.result.correctAnswer.matchContext}
									<div class="mt-2 text-text-muted italic text-xs">{form.result.correctAnswer.matchContext}</div>
								{/if}
							</div>
						{/if}

						<!-- Submitted by credit -->
						{#if form.result.correctAnswer.submittedByUsername}
							<div
								class="text-center text-[11px] text-text-muted/60 mt-3"
								in:fade={{ duration: 300, delay: 600 }}
							>
								Goal created by {form.result.correctAnswer.submittedByUsername}
							</div>
						{/if}
					</div>

					<!-- Next round button -->
					<div class="mt-4" in:fly={{ y: 20, duration: 400, delay: 600, easing: cubicOut }}>
						{#if form.nextRound}
							<button
								onclick={() => goto(`/play/${form.nextRound}`)}
								class="group w-full bg-primary hover:bg-primary-hover text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
							>
								Next Round
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-x-1">
									<path d="M5 12h14M12 5l7 7-7 7"/>
								</svg>
							</button>
						{:else}
							<button
								onclick={() => goto('/results')}
								class="group w-full bg-primary hover:bg-primary-hover text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
							>
								View Final Results
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-x-1">
									<path d="M5 12h14M12 5l7 7-7 7"/>
								</svg>
							</button>
						{/if}
					</div>
				{:else if mounted}
					<!-- Guess form -->
					<form
						method="POST"
						action="?/submit"
						use:enhance={({ formData }) => {
							formData.set('timeTakenMs', String(Date.now() - startTime));
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
						class="bg-surface rounded-2xl p-6 flex-1 flex flex-col border border-border shadow-lg"
						in:fly={{ x: 20, duration: 400, delay: 200, easing: cubicOut }}
					>
						<div class="flex items-center gap-3 mb-5">
							<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
									<circle cx="12" cy="12" r="10"/>
									<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
									<path d="M12 17h.01"/>
								</svg>
							</div>
							<div>
								<h2 class="text-lg font-bold">Make your guess</h2>
								<p class="text-xs text-text-muted">Answer quickly for a speed bonus!</p>
							</div>
						</div>


						{#if form?.error}
							<div class="flex items-center gap-3 bg-error-light border border-error/20 text-error px-4 py-3 rounded-xl mb-4 text-sm">
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<circle cx="12" cy="12" r="10"/>
									<line x1="12" y1="8" x2="12" y2="12"/>
									<line x1="12" y1="16" x2="12.01" y2="16"/>
								</svg>
								{form.error}
							</div>
						{/if}

						<div class="space-y-4 flex-1">
							<div>
								<label for="team" class="flex items-center gap-2 text-sm font-medium mb-2">
									<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
										<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
										<line x1="4" y1="22" x2="4" y2="15"/>
									</svg>
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
								<label for="year" class="flex items-center gap-2 text-sm font-medium mb-2">
									<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
										<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
										<line x1="16" y1="2" x2="16" y2="6"/>
										<line x1="8" y1="2" x2="8" y2="6"/>
										<line x1="3" y1="10" x2="21" y2="10"/>
									</svg>
									Year
								</label>
								<input
									type="number"
									id="year"
									name="year"
									bind:value={year}
									min="1900"
									max={new Date().getFullYear()}
									class="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
									placeholder="e.g. 2014"
									disabled={isSubmitting}
								/>
							</div>

							<div>
								<label for="scorer" class="flex items-center gap-2 text-sm font-medium mb-2">
									<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
										<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
										<circle cx="12" cy="7" r="4"/>
									</svg>
									Goalscorer
								</label>
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
							class="mt-6 bg-primary hover:bg-primary-hover disabled:bg-surface-dim disabled:text-text-muted disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
						>
							{#if isSubmitting}
								<svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Submitting...
							{:else}
								Submit Guess
							{/if}
						</button>
					</form>
				{/if}
			</div>
		</div>
	</div>
</div>
