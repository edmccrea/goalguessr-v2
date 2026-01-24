<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let activeTab = $state<'daily' | 'alltime'>('daily');
</script>

<div class="min-h-screen p-8">
	<div class="max-w-3xl mx-auto">
		<div class="mb-8">
			<a href="/" class="text-text-muted hover:text-primary text-sm">&larr; Back to Home</a>
			<h1 class="text-4xl font-bold">Leaderboard</h1>
		</div>

		<div class="flex gap-2 mb-6">
			<button
				onclick={() => (activeTab = 'daily')}
				class="px-6 py-2 rounded-xl font-medium transition-colors {activeTab === 'daily'
					? 'bg-primary text-white'
					: 'bg-surface border border-border hover:border-primary'}"
			>
				Today
			</button>
			<button
				onclick={() => (activeTab = 'alltime')}
				class="px-6 py-2 rounded-xl font-medium transition-colors {activeTab === 'alltime'
					? 'bg-primary text-white'
					: 'bg-surface border border-border hover:border-primary'}"
			>
				All Time
			</button>
		</div>

		{#if activeTab === 'daily'}
			<div class="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
				<div class="px-6 py-3 bg-surface-dim border-b border-border">
					<p class="text-sm text-text-muted">Scores for {data.todayDate}</p>
				</div>
				<table class="w-full">
					<thead class="bg-surface-dim">
						<tr>
							<th class="px-6 py-3 text-left text-sm font-medium text-text-muted">#</th>
							<th class="px-6 py-3 text-left text-sm font-medium text-text-muted">Player</th>
							<th class="px-6 py-3 text-center text-sm font-medium text-text-muted hidden sm:table-cell">R1</th>
							<th class="px-6 py-3 text-center text-sm font-medium text-text-muted hidden sm:table-cell">R2</th>
							<th class="px-6 py-3 text-center text-sm font-medium text-text-muted hidden sm:table-cell">R3</th>
							<th class="px-6 py-3 text-right text-sm font-medium text-text-muted">Total</th>
						</tr>
					</thead>
					<tbody>
						{#if data.dailyLeaderboard.length === 0}
							<tr class="border-t border-border">
								<td colspan="6" class="px-6 py-8 text-center text-text-muted">
									No scores yet today. Be the first to play!
								</td>
							</tr>
						{:else}
							{#each data.dailyLeaderboard as entry}
								<tr class="border-t border-border hover:bg-surface-dim/50 transition-colors">
									<td class="px-6 py-4">
										{#if entry.rank === 1}
											<span class="text-xl">🥇</span>
										{:else if entry.rank === 2}
											<span class="text-xl">🥈</span>
										{:else if entry.rank === 3}
											<span class="text-xl">🥉</span>
										{:else}
											<span class="text-text-muted">{entry.rank}</span>
										{/if}
									</td>
									<td class="px-6 py-4 font-medium">{entry.username}</td>
									<td class="px-6 py-4 text-center text-text-muted hidden sm:table-cell">{entry.round1Score}</td>
									<td class="px-6 py-4 text-center text-text-muted hidden sm:table-cell">{entry.round2Score}</td>
									<td class="px-6 py-4 text-center text-text-muted hidden sm:table-cell">{entry.round3Score}</td>
									<td class="px-6 py-4 text-right font-bold text-primary">{entry.totalScore}</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
				<div class="px-6 py-3 bg-surface-dim border-b border-border">
					<p class="text-sm text-text-muted">Registered players only</p>
				</div>
				<table class="w-full">
					<thead class="bg-surface-dim">
						<tr>
							<th class="px-6 py-3 text-left text-sm font-medium text-text-muted">#</th>
							<th class="px-6 py-3 text-left text-sm font-medium text-text-muted">Player</th>
							<th class="px-6 py-3 text-center text-sm font-medium text-text-muted hidden sm:table-cell">Games</th>
							<th class="px-6 py-3 text-center text-sm font-medium text-text-muted hidden sm:table-cell">Avg</th>
							<th class="px-6 py-3 text-right text-sm font-medium text-text-muted">Total</th>
						</tr>
					</thead>
					<tbody>
						{#if data.allTimeLeaderboard.length === 0}
							<tr class="border-t border-border">
								<td colspan="5" class="px-6 py-8 text-center text-text-muted">
									No registered players have played yet. <a href="/auth/register" class="text-primary hover:underline">Register</a> to appear on the all-time leaderboard!
								</td>
							</tr>
						{:else}
							{#each data.allTimeLeaderboard as entry}
								<tr class="border-t border-border hover:bg-surface-dim/50 transition-colors">
									<td class="px-6 py-4">
										{#if entry.rank === 1}
											<span class="text-xl">🥇</span>
										{:else if entry.rank === 2}
											<span class="text-xl">🥈</span>
										{:else if entry.rank === 3}
											<span class="text-xl">🥉</span>
										{:else}
											<span class="text-text-muted">{entry.rank}</span>
										{/if}
									</td>
									<td class="px-6 py-4 font-medium">{entry.username}</td>
									<td class="px-6 py-4 text-center text-text-muted hidden sm:table-cell">{entry.gamesPlayed}</td>
									<td class="px-6 py-4 text-center text-text-muted hidden sm:table-cell">{entry.averageScore}</td>
									<td class="px-6 py-4 text-right font-bold text-primary">{entry.totalScore}</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
