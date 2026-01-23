<script lang="ts">
	let { data } = $props();

	const roundScores = $derived([data.round1Score, data.round2Score, data.round3Score]);
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

		<!-- Actions -->
		<div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
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
