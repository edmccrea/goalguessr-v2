<script lang="ts">
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

		<div class="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
			<table class="w-full">
				<thead class="bg-surface-dim">
					<tr>
						<th class="px-6 py-3 text-left text-sm font-medium text-text-muted">#</th>
						<th class="px-6 py-3 text-left text-sm font-medium text-text-muted">Player</th>
						<th class="px-6 py-3 text-right text-sm font-medium text-text-muted">Score</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-t border-border">
						<td colspan="3" class="px-6 py-8 text-center text-text-muted">
							No scores yet. Be the first to play!
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
