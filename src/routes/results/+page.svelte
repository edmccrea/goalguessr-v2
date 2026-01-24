<script lang="ts">
	import { GoalAnimation } from '$lib/components/animation';
	import type { AnimationData } from '$lib/server/db/schema';

	let { data } = $props();

	const roundScores = $derived([data.round1Score, data.round2Score, data.round3Score]);

	let shareStatus = $state<'idle' | 'copied' | 'error'>('idle');

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

<div class="min-h-screen p-8">
	<div class="max-w-3xl mx-auto">
		<h1 class="text-4xl font-bold mb-2">Today's Results</h1>
		<p class="text-text-muted mb-8">
			{#if data.allCompleted}
				Game complete! Here's how you did.
			{:else}
				{data.completedRounds}/3 rounds completed
			{/if}
		</p>

		<div class="grid gap-6">
			{#each data.roundResults as round, idx}
				<div class="bg-surface rounded-xl overflow-hidden border border-border shadow-sm">
					<div class="flex justify-between items-center p-4 border-b border-border">
						<h2 class="text-xl font-semibold">Round {round.roundNumber}</h2>
						{#if round.completed}
							<span class="text-primary font-bold">{roundScores[idx]} pts</span>
						{:else}
							<span class="text-text-muted">Not played</span>
						{/if}
					</div>

					{#if round.goal}
						<div class="p-4">
							<!-- Animation -->
							{#if round.goal.animationData}
								<div class="aspect-[16/10] rounded-lg overflow-hidden border border-border mb-4">
									<GoalAnimation
										animation={round.goal.animationData as AnimationData}
										autoPlay={true}
										loop={true}
									/>
								</div>
							{/if}

							<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
								<!-- Team -->
								<div class="p-3 rounded-lg {round.completed ? (round.guess?.teamCorrect ? 'bg-success-light' : 'bg-error-light') : 'bg-surface-dim'}">
									<div class="text-text-muted text-sm mb-1">Team</div>
									<div class="font-semibold">{round.goal.team}</div>
									{#if round.completed && !round.guess?.teamCorrect}
										<div class="text-sm text-text-muted mt-1">
											You: {round.guess?.team || '-'}
										</div>
									{/if}
								</div>

								<!-- Year -->
								<div class="p-3 rounded-lg {round.completed ? (round.guess?.yearCorrect ? 'bg-success-light' : 'bg-error-light') : 'bg-surface-dim'}">
									<div class="text-text-muted text-sm mb-1">Year</div>
									<div class="font-semibold">{round.goal.year}</div>
									{#if round.completed && !round.guess?.yearCorrect}
										<div class="text-sm text-text-muted mt-1">
											You: {round.guess?.year || '-'}
										</div>
									{/if}
								</div>

								<!-- Scorer -->
								<div class="p-3 rounded-lg {round.completed ? (round.guess?.scorerCorrect ? 'bg-success-light' : 'bg-error-light') : 'bg-surface-dim'}">
									<div class="text-text-muted text-sm mb-1">Goalscorer</div>
									<div class="font-semibold">{round.goal.scorer}</div>
									{#if round.completed && !round.guess?.scorerCorrect}
										<div class="text-sm text-text-muted mt-1">
											You: {round.guess?.scorer || '-'}
										</div>
									{/if}
								</div>
							</div>

							<!-- Match context -->
							{#if round.goal.competition || round.goal.matchContext}
								<div class="mt-4 pt-4 border-t border-border text-text-muted text-sm">
									{#if round.goal.competition}
										<span>{round.goal.competition}</span>
									{/if}
									{#if round.goal.opponent}
										<span> vs {round.goal.opponent}</span>
									{/if}
									{#if round.goal.matchContext}
										<div class="mt-1 italic">{round.goal.matchContext}</div>
									{/if}
								</div>
							{/if}

							{#if round.completed && round.guess?.timeTakenMs}
								<div class="mt-2 text-sm text-text-muted">
									Answered in {Math.floor(round.guess.timeTakenMs / 1000)}s
								</div>
							{/if}

							<!-- Community Stats -->
							{#if round.communityStats && round.communityStats.totalGuesses > 1}
								<div class="mt-4 pt-4 border-t border-border">
									<h4 class="text-sm font-medium text-text-muted mb-3">Community Stats ({round.communityStats.totalGuesses} players)</h4>
									<div class="grid grid-cols-3 gap-3">
										<div class="text-center">
											<div class="text-lg font-semibold text-primary">{round.communityStats.teamCorrectPercent}%</div>
											<div class="text-xs text-text-muted">got team</div>
										</div>
										<div class="text-center">
											<div class="text-lg font-semibold text-primary">{round.communityStats.yearCorrectPercent}%</div>
											<div class="text-xs text-text-muted">got year</div>
										</div>
										<div class="text-center">
											<div class="text-lg font-semibold text-primary">{round.communityStats.scorerCorrectPercent}%</div>
											<div class="text-xs text-text-muted">got scorer</div>
										</div>
									</div>
									{#if round.communityStats.mostGuessedTeam || round.communityStats.mostGuessedScorer}
										<div class="mt-3 text-xs text-text-muted">
											{#if round.communityStats.mostGuessedTeam && round.communityStats.mostGuessedTeam !== round.goal?.team}
												<span>Most guessed team: {round.communityStats.mostGuessedTeam}</span>
											{/if}
											{#if round.communityStats.mostGuessedScorer && round.communityStats.mostGuessedScorer !== round.goal?.scorer}
												<span class="ml-2">Most guessed scorer: {round.communityStats.mostGuessedScorer}</span>
											{/if}
										</div>
									{/if}
								</div>
							{/if}
						</div>
					{:else}
						<div class="p-4 text-text-muted text-center">
							Goal data unavailable
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Total score -->
		<div class="mt-8 bg-primary-light p-6 rounded-xl text-center border border-primary/20">
			<div class="text-text-muted mb-2">Total Score</div>
			<div class="text-4xl font-bold text-primary">{data.totalScore} / 120 pts</div>
			{#if data.allCompleted}
				<div class="mt-2 text-text-muted">
					{#if data.totalScore >= 100}
						Amazing! You're a true football expert!
					{:else if data.totalScore >= 70}
						Great job! You know your goals!
					{:else if data.totalScore >= 40}
						Not bad! Keep playing to improve!
					{:else}
						Keep trying! Practice makes perfect!
					{/if}
				</div>
			{/if}
		</div>

		<!-- Share Button -->
		{#if data.completedRounds > 0}
			<div class="mt-8 flex justify-center">
				<button
					onclick={shareResults}
					class="flex items-center gap-2 bg-surface hover:bg-surface-dim border border-border px-6 py-3 rounded-xl font-semibold transition-colors {shareStatus === 'copied' ? 'border-success text-success' : shareStatus === 'error' ? 'border-error text-error' : ''}"
				>
					{#if shareStatus === 'copied'}
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
						</svg>
						Copied!
					{:else if shareStatus === 'error'}
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
						</svg>
						Failed to copy
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
						</svg>
						Share Results
					{/if}
				</button>
			</div>
		{/if}

		<!-- Actions -->
		<div class="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
			{#if !data.allCompleted}
				<a
					href="/play"
					class="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold text-center transition-colors"
				>
					Continue Playing
				</a>
			{/if}
			<a
				href="/leaderboard"
				class="bg-surface hover:bg-surface-dim border border-border px-6 py-3 rounded-xl font-semibold text-center transition-colors"
			>
				View Leaderboard
			</a>
			<a
				href="/"
				class="bg-surface hover:bg-surface-dim border border-border px-6 py-3 rounded-xl font-semibold text-center transition-colors"
			>
				Home
			</a>
		</div>
	</div>
</div>
