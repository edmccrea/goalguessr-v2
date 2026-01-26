<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, scale, fade } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';
	import { PUBLIC_FEATURE_LEADERBOARD } from '$env/static/public';
	import { GoalAnimation } from '$lib/components/animation';
	import type { AnimationData } from '$lib/server/db/schema';

	const showLeaderboard = PUBLIC_FEATURE_LEADERBOARD === 'true';

	let { data } = $props();

	const roundScores = $derived([data.round1Score, data.round2Score, data.round3Score]);

	let shareStatus = $state<'idle' | 'copied' | 'error'>('idle');
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	function generateShareText(): string {
		const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

		let text = `Goal Guessr - ${today}\n\n`;

		data.roundResults.forEach((round, idx) => {
			if (round.completed && round.guess) {
				const teamEmoji = round.guess.teamCorrect ? '🟩' : '🟥';
				const yearEmoji = round.guess.yearCorrect ? '🟩' : '🟥';
				const scorerEmoji = round.guess.scorerCorrect ? '🟩' : '🟥';
				text += `R${idx + 1}: ${teamEmoji}${yearEmoji}${scorerEmoji} (${roundScores[idx]}pts)\n`;
			} else {
				text += `R${idx + 1}: ⬜⬜⬜ (skipped)\n`;
			}
		});

		text += `\nTotal: ${data.totalScore}/120 pts`;
		text += '\n\nPlay at goalguessr.com';

		return text;
	}

	async function shareResults() {
		const shareText = generateShareText();

		// Try native share API first (mobile)
		if (navigator.share) {
			try {
				await navigator.share({
					title: 'Goal Guessr Results',
					text: shareText
				});
				shareStatus = 'copied';
				return;
			} catch (err) {
				// User cancelled or share failed, fall through to clipboard
			}
		}

		// Fall back to clipboard
		try {
			await navigator.clipboard.writeText(shareText);
			shareStatus = 'copied';
			setTimeout(() => {
				shareStatus = 'idle';
			}, 2000);
		} catch (err) {
			shareStatus = 'error';
			setTimeout(() => {
				shareStatus = 'idle';
			}, 2000);
		}
	}
</script>

<svelte:head>
	<title>Results | Goal Guessr</title>
</svelte:head>

<div class="min-h-[calc(100vh-3.5rem)] relative overflow-hidden">
	<!-- Animated background elements -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
		<div class="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
	</div>

	<div class="relative z-10 p-4 md:p-8">
		<div class="max-w-3xl mx-auto">
			<!-- Header -->
			{#if mounted}
				<div class="text-center mb-10" in:fly={{ y: -20, duration: 500, easing: cubicOut }}>
					<span class="inline-flex items-center gap-2 text-primary font-medium text-sm mb-4 px-3 py-1.5 bg-primary/10 rounded-full">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
							<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
							<path d="M4 22h16"/>
							<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
							<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
							<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
						</svg>
						{#if data.allCompleted}
							Game Complete
						{:else}
							{data.completedRounds}/3 Rounds
						{/if}
					</span>
					<h1 class="text-3xl sm:text-4xl font-bold mb-2">Today's Results</h1>
					<p class="text-text-muted">
						{#if data.allCompleted}
							Here's how you did today
						{:else}
							Keep playing to complete all rounds
						{/if}
					</p>
				</div>
			{/if}

				<div class="grid gap-6">
				{#each data.roundResults as round, idx}
					{#if mounted}
						<div
							class="bg-surface rounded-2xl overflow-hidden border border-border shadow-lg hover:shadow-xl transition-all duration-300"
							in:fly={{ y: 30, duration: 500, delay: 100 + idx * 100, easing: cubicOut }}
						>
							<div class="flex justify-between items-center p-4 border-b border-border bg-gradient-to-r from-surface to-surface-dim/30">
								<div class="flex items-center gap-3">
									<div class="w-10 h-10 rounded-xl {round.completed ? 'bg-primary/10' : 'bg-surface-dim'} flex items-center justify-center">
										{#if round.completed}
											<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
												<polyline points="20 6 9 17 4 12"/>
											</svg>
										{:else}
											<span class="text-text-muted font-bold">{round.roundNumber}</span>
										{/if}
									</div>
									<h2 class="text-lg font-bold">Round {round.roundNumber}</h2>
								</div>
								{#if round.completed}
									<div class="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full">
										<span class="text-lg font-bold">{roundScores[idx]}</span>
										<span class="text-sm font-medium">pts</span>
									</div>
								{:else}
									<span class="text-text-muted text-sm bg-surface-dim px-3 py-1.5 rounded-full">Not played</span>
								{/if}
							</div>

							{#if round.goal}
								<div class="p-4 md:p-6">
									<!-- Animation -->
									{#if round.goal.animationData}
										<div class="aspect-[16/10] rounded-xl overflow-hidden border border-border mb-5 shadow-sm">
											<GoalAnimation
												animation={round.goal.animationData as AnimationData}
												autoPlay={true}
												loop={true}
											/>
										</div>
									{/if}

									<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
										<!-- Team -->
										<div class="flex items-center gap-3 p-3 rounded-xl transition-all {round.completed ? (round.guess?.teamCorrect ? 'bg-success-light border border-success/20' : 'bg-error-light border border-error/20') : 'bg-surface-dim border border-border'}">
											<div class="w-9 h-9 rounded-lg {round.completed ? (round.guess?.teamCorrect ? 'bg-success/20' : 'bg-error/20') : 'bg-surface'} flex items-center justify-center flex-shrink-0">
												{#if round.completed}
													{#if round.guess?.teamCorrect}
														<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-success">
															<polyline points="20 6 9 17 4 12"/>
														</svg>
													{:else}
														<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-error">
															<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
														</svg>
													{/if}
												{:else}
													<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
														<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
														<line x1="4" y1="22" x2="4" y2="15"/>
													</svg>
												{/if}
											</div>
											<div class="flex-1 min-w-0">
												<div class="text-xs text-text-muted uppercase tracking-wide">Team</div>
												<div class="font-semibold truncate">{round.goal.team}</div>
												{#if round.completed && !round.guess?.teamCorrect}
													<div class="text-xs text-text-muted truncate">You: {round.guess?.team || '-'}</div>
												{/if}
											</div>
										</div>

										<!-- Year -->
										<div class="flex items-center gap-3 p-3 rounded-xl transition-all {round.completed ? (round.guess?.yearCorrect ? 'bg-success-light border border-success/20' : 'bg-error-light border border-error/20') : 'bg-surface-dim border border-border'}">
											<div class="w-9 h-9 rounded-lg {round.completed ? (round.guess?.yearCorrect ? 'bg-success/20' : 'bg-error/20') : 'bg-surface'} flex items-center justify-center flex-shrink-0">
												{#if round.completed}
													{#if round.guess?.yearCorrect}
														<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-success">
															<polyline points="20 6 9 17 4 12"/>
														</svg>
													{:else}
														<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-error">
															<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
														</svg>
													{/if}
												{:else}
													<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
														<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
														<line x1="16" y1="2" x2="16" y2="6"/>
														<line x1="8" y1="2" x2="8" y2="6"/>
														<line x1="3" y1="10" x2="21" y2="10"/>
													</svg>
												{/if}
											</div>
											<div class="flex-1 min-w-0">
												<div class="text-xs text-text-muted uppercase tracking-wide">Year</div>
												<div class="font-semibold">{round.goal.year}</div>
												{#if round.completed && !round.guess?.yearCorrect}
													<div class="text-xs text-text-muted">You: {round.guess?.year || '-'}</div>
												{/if}
											</div>
										</div>

										<!-- Scorer -->
										<div class="flex items-center gap-3 p-3 rounded-xl transition-all {round.completed ? (round.guess?.scorerCorrect ? 'bg-success-light border border-success/20' : 'bg-error-light border border-error/20') : 'bg-surface-dim border border-border'}">
											<div class="w-9 h-9 rounded-lg {round.completed ? (round.guess?.scorerCorrect ? 'bg-success/20' : 'bg-error/20') : 'bg-surface'} flex items-center justify-center flex-shrink-0">
												{#if round.completed}
													{#if round.guess?.scorerCorrect}
														<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-success">
															<polyline points="20 6 9 17 4 12"/>
														</svg>
													{:else}
														<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-error">
															<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
														</svg>
													{/if}
												{:else}
													<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
														<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
														<circle cx="12" cy="7" r="4"/>
													</svg>
												{/if}
											</div>
											<div class="flex-1 min-w-0">
												<div class="text-xs text-text-muted uppercase tracking-wide">Scorer</div>
												<div class="font-semibold truncate">{round.goal.scorer}</div>
												{#if round.completed && !round.guess?.scorerCorrect}
													<div class="text-xs text-text-muted truncate">You: {round.guess?.scorer || '-'}</div>
												{/if}
											</div>
										</div>
									</div>

									<!-- Match context -->
									{#if round.goal.competition || round.goal.matchContext}
										<div class="mt-5 bg-surface-dim rounded-xl p-4 text-sm">
											<div class="flex items-center gap-2 text-text-muted mb-2">
												<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<circle cx="12" cy="12" r="10"/>
													<path d="M12 16v-4M12 8h.01"/>
												</svg>
												<span class="text-xs uppercase tracking-wide font-medium">Match Details</span>
											</div>
											{#if round.goal.competition}
												<div class="font-medium text-text">{round.goal.competition}</div>
											{/if}
											{#if round.goal.opponent}
												<div class="text-text-muted">vs {round.goal.opponent}</div>
											{/if}
											{#if round.goal.matchContext}
												<div class="mt-2 text-text-muted italic text-xs">{round.goal.matchContext}</div>
											{/if}
										</div>
									{/if}

									{#if round.completed && round.guess?.timeTakenMs}
										<div class="mt-4 flex items-center gap-2 text-sm text-text-muted">
											<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
												<circle cx="12" cy="12" r="10"/>
												<polyline points="12 6 12 12 16 14"/>
											</svg>
											Answered in {Math.floor(round.guess.timeTakenMs / 1000)}s
										</div>
									{/if}

									<!-- Community Stats -->
									{#if round.communityStats && round.communityStats.totalGuesses > 1}
										<div class="mt-5 pt-5 border-t border-border">
											<div class="flex items-center gap-2 text-text-muted mb-4">
												<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
													<circle cx="9" cy="7" r="4"/>
													<path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
												</svg>
												<span class="text-sm font-medium">Community Stats</span>
												<span class="text-xs bg-surface-dim px-2 py-0.5 rounded-full">{round.communityStats.totalGuesses} players</span>
											</div>
											<div class="grid grid-cols-3 gap-3">
												<div class="text-center bg-surface-dim rounded-xl p-3">
													<div class="text-xl font-bold text-primary">{round.communityStats.teamCorrectPercent}%</div>
													<div class="text-xs text-text-muted mt-1">got team</div>
												</div>
												<div class="text-center bg-surface-dim rounded-xl p-3">
													<div class="text-xl font-bold text-primary">{round.communityStats.yearCorrectPercent}%</div>
													<div class="text-xs text-text-muted mt-1">got year</div>
												</div>
												<div class="text-center bg-surface-dim rounded-xl p-3">
													<div class="text-xl font-bold text-primary">{round.communityStats.scorerCorrectPercent}%</div>
													<div class="text-xs text-text-muted mt-1">got scorer</div>
												</div>
											</div>
											{#if round.communityStats.mostGuessedTeam || round.communityStats.mostGuessedScorer}
												<div class="mt-3 text-xs text-text-muted flex flex-wrap gap-x-4 gap-y-1">
													{#if round.communityStats.mostGuessedTeam && round.communityStats.mostGuessedTeam !== round.goal?.team}
														<span>Most guessed team: <span class="font-medium text-text">{round.communityStats.mostGuessedTeam}</span></span>
													{/if}
													{#if round.communityStats.mostGuessedScorer && round.communityStats.mostGuessedScorer !== round.goal?.scorer}
														<span>Most guessed scorer: <span class="font-medium text-text">{round.communityStats.mostGuessedScorer}</span></span>
													{/if}
												</div>
											{/if}
										</div>
									{/if}
								</div>
							{:else}
								<div class="p-6 text-text-muted text-center">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-2 opacity-50">
										<circle cx="12" cy="12" r="10"/>
										<path d="M12 16v-4M12 8h.01"/>
									</svg>
									Goal data unavailable
								</div>
							{/if}
						</div>
					{/if}
				{/each}
			</div>

			<!-- Total score -->
			{#if mounted}
				<div
					class="mt-10 bg-gradient-to-br from-primary via-primary to-primary-hover p-8 rounded-2xl text-center text-white relative overflow-hidden shadow-xl"
					in:scale={{ start: 0.95, duration: 500, delay: 400, easing: backOut }}
				>
					<!-- Decorative elements -->
					<div class="absolute inset-0 overflow-hidden pointer-events-none">
						<div class="absolute top-0 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
						<div class="absolute bottom-0 right-1/4 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
					</div>

					<div class="relative z-10">
						<div class="text-white/80 text-sm uppercase tracking-wide mb-3">Total Score</div>
						<div class="text-5xl sm:text-6xl font-bold mb-2">{data.totalScore}</div>
						<div class="text-white/70 text-lg">out of 120 points</div>

						{#if data.allCompleted}
							<div class="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
								{#if data.totalScore >= 100}
									<span class="text-2xl">🏆</span>
									<span class="font-medium">Football Expert!</span>
								{:else if data.totalScore >= 70}
									<span class="text-2xl">⭐</span>
									<span class="font-medium">Great performance!</span>
								{:else if data.totalScore >= 40}
									<span class="text-2xl">👍</span>
									<span class="font-medium">Not bad!</span>
								{:else}
									<span class="text-2xl">💪</span>
									<span class="font-medium">Keep practicing!</span>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Actions -->
			{#if mounted}
				<div class="mt-8 flex flex-col gap-4" in:fly={{ y: 20, duration: 500, delay: 500, easing: cubicOut }}>
					<!-- Primary Actions -->
					<div class="flex flex-col sm:flex-row gap-3 justify-center">
						{#if !data.allCompleted}
							<a
								href="/play"
								class="group bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-bold text-center transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
							>
								Continue Playing
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-x-1">
									<path d="M5 12h14M12 5l7 7-7 7"/>
								</svg>
							</a>
						{/if}

						<!-- Share Button -->
						{#if data.completedRounds > 0}
							<button
								onclick={shareResults}
								class="group flex items-center justify-center gap-2 bg-surface hover:bg-surface-dim border-2 px-8 py-4 rounded-xl font-bold transition-all hover:-translate-y-0.5 {shareStatus === 'copied' ? 'border-success text-success' : shareStatus === 'error' ? 'border-error text-error' : 'border-border hover:border-primary/30'}"
							>
								{#if shareStatus === 'copied'}
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
										<polyline points="20 6 9 17 4 12"/>
									</svg>
									Copied!
								{:else if shareStatus === 'error'}
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
										<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
									</svg>
									Failed
								{:else}
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted group-hover:text-primary transition-colors">
										<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
										<polyline points="16 6 12 2 8 6"/>
										<line x1="12" y1="2" x2="12" y2="15"/>
									</svg>
									Share Results
								{/if}
							</button>
						{/if}
					</div>

					<!-- Secondary Actions -->
					<div class="flex flex-wrap gap-3 justify-center">
						{#if showLeaderboard}
							<a
								href="/leaderboard"
								class="group flex items-center gap-2 bg-surface hover:bg-surface-dim border border-border px-6 py-3 rounded-xl font-medium text-center transition-all hover:border-primary/30"
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted group-hover:text-primary transition-colors">
									<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
									<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
									<path d="M4 22h16"/>
									<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
									<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
									<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
								</svg>
								Leaderboard
							</a>
						{/if}
						<a
							href="/"
							class="group flex items-center gap-2 bg-surface hover:bg-surface-dim border border-border px-6 py-3 rounded-xl font-medium text-center transition-all hover:border-primary/30"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted group-hover:text-primary transition-colors">
								<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
								<polyline points="9 22 9 12 15 12 15 22"/>
							</svg>
							Home
						</a>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
