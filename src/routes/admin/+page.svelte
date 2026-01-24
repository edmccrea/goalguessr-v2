<script lang="ts">
	let { data } = $props();
</script>

<div class="min-h-screen p-8">
	<div class="max-w-4xl mx-auto">
		<div class="mb-8">
			<a href="/" class="text-text-muted hover:text-primary text-sm">&larr; Back to Home</a>
			<h1 class="text-4xl font-bold mt-2">Admin Dashboard</h1>
		</div>

		<!-- Stats Grid -->
		<div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
			<div class="bg-surface border border-border p-6 rounded-xl shadow-sm">
				<div class="text-3xl font-bold text-yellow-500">{data.stats.pendingReviews}</div>
				<div class="text-text-muted text-sm mt-1">Pending Reviews</div>
			</div>
			<div class="bg-surface border border-border p-6 rounded-xl shadow-sm">
				<div class="text-3xl font-bold text-primary">{data.stats.approvedGoals}</div>
				<div class="text-text-muted text-sm mt-1">Approved Goals</div>
			</div>
			<div class="bg-surface border border-border p-6 rounded-xl shadow-sm">
				<div class="text-3xl font-bold text-text">{data.stats.totalGoals}</div>
				<div class="text-text-muted text-sm mt-1">Total Goals</div>
			</div>
			<div class="bg-surface border border-border p-6 rounded-xl shadow-sm">
				<div class="text-3xl font-bold text-blue-500">{data.stats.totalUsers}</div>
				<div class="text-text-muted text-sm mt-1">Registered Users</div>
			</div>
			<div class="bg-surface border border-border p-6 rounded-xl shadow-sm">
				<div class="text-3xl font-bold text-purple-500">{data.stats.totalGamesPlayed}</div>
				<div class="text-text-muted text-sm mt-1">Games Played</div>
			</div>
			<div class="bg-surface border border-border p-6 rounded-xl shadow-sm">
				<div class="text-3xl font-bold {data.stats.hasTodayGame ? 'text-primary' : 'text-red-500'}">
					{data.stats.hasTodayGame ? 'Yes' : 'No'}
				</div>
				<div class="text-text-muted text-sm mt-1">Today's Game Set</div>
			</div>
		</div>

		<!-- Quick Actions -->
		<h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
			<a
				href="/admin/review"
				class="block bg-surface border border-border p-6 rounded-xl hover:border-primary transition-colors shadow-sm"
			>
				<div class="flex items-center justify-between">
					<div>
						<div class="font-semibold">Review Submissions</div>
						<div class="text-text-muted text-sm">Approve or reject community-submitted goals</div>
					</div>
					{#if data.stats.pendingReviews > 0}
						<div class="bg-yellow-500 text-black text-sm font-bold px-2 py-1 rounded">
							{data.stats.pendingReviews}
						</div>
					{/if}
				</div>
			</a>

			<a
				href="/admin/schedule"
				class="block bg-surface border border-border p-6 rounded-xl hover:border-primary transition-colors shadow-sm"
			>
				<div class="flex items-center justify-between">
					<div>
						<div class="font-semibold">Schedule Daily Games</div>
						<div class="text-text-muted text-sm">Queue goals for upcoming daily games</div>
					</div>
					<div class="text-text-muted text-sm">{data.stats.scheduledGoals} scheduled</div>
				</div>
			</a>

			<a
				href="/admin/goals"
				class="block bg-surface border border-border p-6 rounded-xl hover:border-primary transition-colors shadow-sm"
			>
				<div class="flex items-center justify-between">
					<div>
						<div class="font-semibold">Goal Management</div>
						<div class="text-text-muted text-sm">View, edit, and delete all goals</div>
					</div>
					<div class="text-text-muted text-sm">{data.stats.totalGoals} goals</div>
				</div>
			</a>

			<a
				href="/admin/users"
				class="block bg-surface border border-border p-6 rounded-xl hover:border-primary transition-colors shadow-sm"
			>
				<div class="font-semibold">User Management</div>
				<div class="text-text-muted text-sm">Manage users and admin privileges</div>
			</a>

			<a
				href="/admin/sync"
				class="block bg-surface border border-border p-6 rounded-xl hover:border-primary transition-colors shadow-sm"
			>
				<div class="font-semibold">Sync Teams & Players</div>
				<div class="text-text-muted text-sm">Import data for autocomplete suggestions</div>
			</a>
		</div>

		<!-- Recent Submissions -->
		<h2 class="text-xl font-semibold mb-4">Recent Submissions</h2>
		{#if data.recentSubmissions.length === 0}
			<div class="bg-surface border border-border p-6 rounded-xl text-center">
				<p class="text-text-muted">No goals submitted yet.</p>
			</div>
		{:else}
			<div class="bg-surface border border-border rounded-xl overflow-hidden">
				<table class="w-full">
					<thead class="bg-background">
						<tr>
							<th class="text-left p-4 text-text-muted text-sm font-medium">Goal</th>
							<th class="text-left p-4 text-text-muted text-sm font-medium">Year</th>
							<th class="text-left p-4 text-text-muted text-sm font-medium">Status</th>
							<th class="text-right p-4 text-text-muted text-sm font-medium">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						{#each data.recentSubmissions as submission}
							<tr class="hover:bg-background/50">
								<td class="p-4">
									<div class="font-medium">{submission.scorer}</div>
									<div class="text-text-muted text-sm">{submission.team}</div>
								</td>
								<td class="p-4 text-text-muted">{submission.year}</td>
								<td class="p-4">
									<span class="px-2 py-1 rounded text-xs font-medium {submission.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : submission.status === 'approved' ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-500'}">
										{submission.status}
									</span>
								</td>
								<td class="p-4 text-right">
									<a href="/admin/review/{submission.id}" class="text-primary hover:underline text-sm">
										View
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
