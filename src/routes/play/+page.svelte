<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';

	let { data } = $props();
	let isResetting = $state(false);

	function getRoundStatus(round: (typeof data.roundStatus)[0]) {
		if (round.completed) {
			return { text: `${round.score} pts`, class: 'text-primary font-semibold' };
		}
		const prevRound = data.roundStatus.find((r) => r.roundNumber === round.roundNumber - 1);
		if (round.roundNumber === 1 || prevRound?.completed) {
			return { text: 'Ready to play', class: 'text-warning' };
		}
		return { text: 'Locked', class: 'text-text-muted' };
	}

	function canPlayRound(roundNumber: number): boolean {
		if (roundNumber === 1) return true;
		const prevRound = data.roundStatus.find((r) => r.roundNumber === roundNumber - 1);
		return prevRound?.completed ?? false;
	}

	function handleRoundClick(roundNumber: number) {
		const round = data.roundStatus.find((r) => r.roundNumber === roundNumber);
		if (round?.completed) {
			goto('/results');
		} else if (canPlayRound(roundNumber)) {
			goto(`/play/${roundNumber}`);
		}
	}
</script>

<div class="min-h-screen p-8">
	<div class="max-w-2xl mx-auto">
		<h1 class="text-4xl font-bold mb-2">Today's Game</h1>
		<p class="text-text-muted mb-8">Guess the team, year, and goalscorer for each goal</p>

		<div class="grid gap-4">
			{#each data.roundStatus as round}
				{@const status = getRoundStatus(round)}
				{@const canPlay = canPlayRound(round.roundNumber)}
				<button
					onclick={() => handleRoundClick(round.roundNumber)}
					disabled={!canPlay && !round.completed}
					class="bg-surface border border-border p-5 rounded-xl transition-all text-left shadow-sm {canPlay || round.completed
						? 'hover:border-primary hover:shadow-md cursor-pointer'
						: 'opacity-50 cursor-not-allowed'}"
				>
					<div class="flex justify-between items-center">
						<div class="flex items-center gap-4">
							<div
								class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white {round.completed
									? 'bg-primary'
									: canPlay
										? 'bg-warning'
										: 'bg-text-muted'}"
							>
								{round.roundNumber}
							</div>
							<span class="text-xl font-semibold">Round {round.roundNumber}</span>
						</div>
						<span class={status.class}>{status.text}</span>
					</div>
				</button>
			{/each}
		</div>

		{#if data.allCompleted}
			<div class="mt-8 bg-primary-light border border-primary/20 p-6 rounded-xl text-center">
				<div class="text-2xl font-bold text-primary mb-4">
					Game Complete! Total: {data.totalScore} / 120 pts
				</div>
				<a
					href="/results"
					class="inline-block bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors"
				>
					View Results
				</a>
			</div>
		{:else}
			<div class="mt-8 bg-surface border border-border p-4 rounded-xl text-center text-text-muted">
				Current score: <span class="font-semibold text-primary">{data.totalScore} pts</span>
			</div>
		{/if}

		<div class="mt-8 flex gap-4 justify-center">
			<a href="/" class="text-text-muted hover:text-primary transition-colors">Home</a>
			<a href="/leaderboard" class="text-text-muted hover:text-primary transition-colors">Leaderboard</a>
		</div>

		{#if data.isDev}
			<div class="mt-12 pt-8 border-t border-border">
				<div class="text-center text-text-muted text-sm mb-4">Dev Tools</div>
				<form
					method="POST"
					action="?/reset"
					use:enhance={() => {
						isResetting = true;
						return async ({ update }) => {
							await update();
							isResetting = false;
							await invalidateAll();
						};
					}}
					class="flex justify-center"
				>
					<button
						type="submit"
						disabled={isResetting}
						class="bg-error-light hover:bg-error/20 border border-error text-error px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
					>
						{isResetting ? 'Resetting...' : 'Reset Today\'s Game'}
					</button>
				</form>
			</div>
		{/if}
	</div>
</div>
