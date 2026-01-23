<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen p-8">
	<div class="max-w-3xl mx-auto">
		<div class="mb-8">
			<a href="/" class="text-text-muted hover:text-primary text-sm">&larr; Back to Home</a>
			<h1 class="text-4xl font-bold">Profile</h1>
		</div>

		<!-- User Info Card -->
		<div class="bg-surface border border-border p-6 rounded-xl mb-6 shadow-sm">
			{#if data.user}
				<div class="flex items-center justify-between">
					<div>
						<h2 class="text-2xl font-bold">{data.user.username}</h2>
						<p class="text-text-muted">{data.user.email}</p>
						{#if data.user.isAdmin}
							<span
								class="inline-block mt-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
								>Admin</span
							>
						{/if}
					</div>
					<form method="POST" action="/auth/logout">
						<button
							type="submit"
							class="bg-surface-dim hover:bg-border border border-border px-4 py-2 rounded-lg text-sm transition-colors"
						>
							Logout
						</button>
					</form>
				</div>
			{:else}
				<p class="text-text-muted">You are playing as a guest.</p>
				<p class="text-sm text-text-muted mt-1">
					Create an account to save your stats across devices.
				</p>
				<div class="mt-4 flex gap-4">
					<a
						href="/auth/register"
						class="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-xl font-medium transition-colors"
					>
						Create Account
					</a>
					<a
						href="/auth/login"
						class="bg-surface-dim hover:bg-border border border-border px-6 py-2 rounded-xl font-medium transition-colors"
					>
						Login
					</a>
				</div>
			{/if}
		</div>

		<!-- Stats Overview -->
		<h2 class="text-xl font-bold mb-4">Your Stats</h2>
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
			<div class="bg-surface border border-border p-4 rounded-xl text-center shadow-sm">
				<div class="text-3xl font-bold text-primary">{data.stats.gamesPlayed}</div>
				<div class="text-text-muted text-sm mt-1">Games Played</div>
			</div>
			<div class="bg-surface border border-border p-4 rounded-xl text-center shadow-sm">
				<div class="text-3xl font-bold text-primary">{data.stats.totalScore}</div>
				<div class="text-text-muted text-sm mt-1">Total Score</div>
			</div>
			<div class="bg-surface border border-border p-4 rounded-xl text-center shadow-sm">
				<div class="text-3xl font-bold text-primary">{data.stats.avgScore}</div>
				<div class="text-text-muted text-sm mt-1">Avg Score</div>
			</div>
			<div class="bg-surface border border-border p-4 rounded-xl text-center shadow-sm">
				<div class="text-3xl font-bold text-primary">{data.stats.accuracy}%</div>
				<div class="text-text-muted text-sm mt-1">Overall Accuracy</div>
			</div>
		</div>

		<!-- Accuracy Breakdown -->
		<h2 class="text-xl font-bold mb-4">Accuracy Breakdown</h2>
		<div class="grid grid-cols-3 gap-4 mb-8">
			<div class="bg-surface border border-border p-4 rounded-xl shadow-sm">
				<div class="flex items-center justify-between mb-2">
					<span class="text-sm text-text-muted">Team</span>
					<span class="font-bold">{data.stats.teamAccuracy}%</span>
				</div>
				<div class="h-2 bg-surface-dim rounded-full overflow-hidden">
					<div
						class="h-full bg-primary transition-all"
						style="width: {data.stats.teamAccuracy}%"
					></div>
				</div>
			</div>
			<div class="bg-surface border border-border p-4 rounded-xl shadow-sm">
				<div class="flex items-center justify-between mb-2">
					<span class="text-sm text-text-muted">Year</span>
					<span class="font-bold">{data.stats.yearAccuracy}%</span>
				</div>
				<div class="h-2 bg-surface-dim rounded-full overflow-hidden">
					<div
						class="h-full bg-primary transition-all"
						style="width: {data.stats.yearAccuracy}%"
					></div>
				</div>
			</div>
			<div class="bg-surface border border-border p-4 rounded-xl shadow-sm">
				<div class="flex items-center justify-between mb-2">
					<span class="text-sm text-text-muted">Scorer</span>
					<span class="font-bold">{data.stats.scorerAccuracy}%</span>
				</div>
				<div class="h-2 bg-surface-dim rounded-full overflow-hidden">
					<div
						class="h-full bg-primary transition-all"
						style="width: {data.stats.scorerAccuracy}%"
					></div>
				</div>
			</div>
		</div>

		<!-- Recent Games -->
		{#if data.recentGames.length > 0}
			<h2 class="text-xl font-bold mb-4">Recent Games</h2>
			<div class="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
				<table class="w-full">
					<thead class="bg-surface-dim">
						<tr>
							<th class="text-left px-4 py-3 text-sm font-medium text-text-muted">Date</th>
							<th class="text-center px-4 py-3 text-sm font-medium text-text-muted">R1</th>
							<th class="text-center px-4 py-3 text-sm font-medium text-text-muted">R2</th>
							<th class="text-center px-4 py-3 text-sm font-medium text-text-muted">R3</th>
							<th class="text-right px-4 py-3 text-sm font-medium text-text-muted">Total</th>
						</tr>
					</thead>
					<tbody>
						{#each data.recentGames as game}
							<tr class="border-t border-border">
								<td class="px-4 py-3 text-sm">
									{game.createdAt
										? new Date(game.createdAt).toLocaleDateString()
										: 'Unknown'}
								</td>
								<td class="px-4 py-3 text-sm text-center">{game.round1Score ?? 0}</td>
								<td class="px-4 py-3 text-sm text-center">{game.round2Score ?? 0}</td>
								<td class="px-4 py-3 text-sm text-center">{game.round3Score ?? 0}</td>
								<td class="px-4 py-3 text-sm text-right font-bold">{game.totalScore ?? 0}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="bg-surface border border-border p-8 rounded-xl text-center shadow-sm">
				<p class="text-text-muted">No games played yet.</p>
				<a
					href="/play"
					class="inline-block mt-4 bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-xl font-medium transition-colors"
				>
					Play Today's Game
				</a>
			</div>
		{/if}
	</div>
</div>
