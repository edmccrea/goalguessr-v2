<script lang="ts">
	let { data } = $props();
</script>

<div class="min-h-[calc(100vh-3.5rem)] relative overflow-hidden">
	<!-- Animated background elements -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
		<div class="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
	</div>

	<div class="relative z-10 p-6 md:p-8">
		<div class="max-w-6xl mx-auto">
			<!-- Header -->
			<div class="mb-8">
				<a href="/" class="group inline-flex items-center gap-1.5 text-text-muted hover:text-primary text-sm mb-3 transition-colors">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:-translate-x-1">
						<path d="M19 12H5M12 19l-7-7 7-7"/>
					</svg>
					Back to Home
				</a>
				<div class="flex items-center gap-4">
					<div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
							<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
							<circle cx="12" cy="12" r="3"/>
						</svg>
					</div>
					<div>
						<h1 class="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
						<p class="text-text-muted mt-1">Manage goals, users, and game settings</p>
					</div>
				</div>
			</div>

			<!-- Stats Grid -->
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
				<div class="bg-surface border border-border p-5 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-yellow-500/30 group">
					<div class="flex items-center gap-3 mb-2">
						<div class="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-500">
								<circle cx="12" cy="12" r="10"/>
								<path d="M12 6v6l4 2"/>
							</svg>
						</div>
					</div>
					<div class="text-2xl font-bold text-yellow-500">{data.stats.pendingReviews}</div>
					<div class="text-text-muted text-sm mt-0.5">Pending Reviews</div>
				</div>

				<div class="bg-surface border border-border p-5 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-primary/30 group">
					<div class="flex items-center gap-3 mb-2">
						<div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
								<polyline points="20 6 9 17 4 12"/>
							</svg>
						</div>
					</div>
					<div class="text-2xl font-bold text-primary">{data.stats.approvedGoals}</div>
					<div class="text-text-muted text-sm mt-0.5">Approved Goals</div>
				</div>

				<div class="bg-surface border border-border p-5 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-border group">
					<div class="flex items-center gap-3 mb-2">
						<div class="w-9 h-9 rounded-lg bg-surface-dim flex items-center justify-center group-hover:scale-110 transition-transform">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
								<circle cx="12" cy="12" r="10"/>
								<polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
							</svg>
						</div>
					</div>
					<div class="text-2xl font-bold">{data.stats.totalGoals}</div>
					<div class="text-text-muted text-sm mt-0.5">Total Goals</div>
				</div>

				<div class="bg-surface border border-border p-5 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-blue-500/30 group">
					<div class="flex items-center gap-3 mb-2">
						<div class="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
								<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
								<circle cx="9" cy="7" r="4"/>
								<path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
								<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
							</svg>
						</div>
					</div>
					<div class="text-2xl font-bold text-blue-500">{data.stats.totalUsers}</div>
					<div class="text-text-muted text-sm mt-0.5">Registered Users</div>
				</div>

				<div class="bg-surface border border-border p-5 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-purple-500/30 group">
					<div class="flex items-center gap-3 mb-2">
						<div class="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-500">
								<path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/>
								<path d="M15.5 8.5 19 5.5a2.5 2.5 0 0 0-3.5-3.5L12 5.5 8.5 2A2.5 2.5 0 1 0 5 5.5L8.5 8.5"/>
							</svg>
						</div>
					</div>
					<div class="text-2xl font-bold text-purple-500">{data.stats.totalGamesPlayed}</div>
					<div class="text-text-muted text-sm mt-0.5">Games Played</div>
				</div>

				<div class="bg-surface border border-border p-5 rounded-xl shadow-sm hover:shadow-md transition-all group {data.stats.hasTodayGame ? 'hover:border-primary/30' : 'hover:border-red-500/30'}">
					<div class="flex items-center gap-3 mb-2">
						<div class="w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform {data.stats.hasTodayGame ? 'bg-primary/10' : 'bg-red-500/10'}">
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="{data.stats.hasTodayGame ? 'text-primary' : 'text-red-500'}">
								<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
								<line x1="16" x2="16" y1="2" y2="6"/>
								<line x1="8" x2="8" y1="2" y2="6"/>
								<line x1="3" x2="21" y1="10" y2="10"/>
								<path d="m9 16 2 2 4-4"/>
							</svg>
						</div>
					</div>
					<div class="text-2xl font-bold {data.stats.hasTodayGame ? 'text-primary' : 'text-red-500'}">
						{data.stats.hasTodayGame ? 'Yes' : 'No'}
					</div>
					<div class="text-text-muted text-sm mt-0.5">Today's Game Set</div>
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="mb-8">
				<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
						<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
					</svg>
					Quick Actions
				</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<a
						href="/admin/review"
						class="group bg-surface border border-border p-5 rounded-xl hover:border-yellow-500/50 hover:shadow-lg transition-all"
					>
						<div class="flex items-start gap-4">
							<div class="w-11 h-11 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-500">
									<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
									<circle cx="12" cy="12" r="3"/>
								</svg>
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center justify-between gap-2">
									<div class="font-semibold group-hover:text-yellow-600 transition-colors">Review Submissions</div>
									{#if data.stats.pendingReviews > 0}
										<div class="bg-yellow-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
											{data.stats.pendingReviews}
										</div>
									{/if}
								</div>
								<div class="text-text-muted text-sm mt-1">Approve or reject community-submitted goals</div>
							</div>
						</div>
					</a>

					<a
						href="/admin/schedule"
						class="group bg-surface border border-border p-5 rounded-xl hover:border-primary/50 hover:shadow-lg transition-all"
					>
						<div class="flex items-start gap-4">
							<div class="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
									<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
									<line x1="16" x2="16" y1="2" y2="6"/>
									<line x1="8" x2="8" y1="2" y2="6"/>
									<line x1="3" x2="21" y1="10" y2="10"/>
								</svg>
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center justify-between gap-2">
									<div class="font-semibold group-hover:text-primary transition-colors">Schedule Daily Games</div>
									<span class="text-text-muted text-xs bg-surface-dim px-2 py-1 rounded-full">{data.stats.scheduledGoals} scheduled</span>
								</div>
								<div class="text-text-muted text-sm mt-1">Queue goals for upcoming daily games</div>
							</div>
						</div>
					</a>

					<a
						href="/admin/goals"
						class="group bg-surface border border-border p-5 rounded-xl hover:border-primary/50 hover:shadow-lg transition-all"
					>
						<div class="flex items-start gap-4">
							<div class="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
									<circle cx="12" cy="12" r="10"/>
									<polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
								</svg>
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center justify-between gap-2">
									<div class="font-semibold group-hover:text-primary transition-colors">Goal Management</div>
									<span class="text-text-muted text-xs bg-surface-dim px-2 py-1 rounded-full">{data.stats.totalGoals} goals</span>
								</div>
								<div class="text-text-muted text-sm mt-1">View, edit, and delete all goals</div>
							</div>
						</div>
					</a>

					<a
						href="/admin/users"
						class="group bg-surface border border-border p-5 rounded-xl hover:border-blue-500/50 hover:shadow-lg transition-all"
					>
						<div class="flex items-start gap-4">
							<div class="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
									<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
									<circle cx="9" cy="7" r="4"/>
									<path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
									<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
								</svg>
							</div>
							<div class="flex-1 min-w-0">
								<div class="font-semibold group-hover:text-blue-500 transition-colors">User Management</div>
								<div class="text-text-muted text-sm mt-1">Manage users and admin privileges</div>
							</div>
						</div>
					</a>

					<a
						href="/admin/sync"
						class="group bg-surface border border-border p-5 rounded-xl hover:border-purple-500/50 hover:shadow-lg transition-all"
					>
						<div class="flex items-start gap-4">
							<div class="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-500">
									<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
									<path d="M3 3v5h5"/>
									<path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
									<path d="M16 16h5v5"/>
								</svg>
							</div>
							<div class="flex-1 min-w-0">
								<div class="font-semibold group-hover:text-purple-500 transition-colors">Sync Teams & Players</div>
								<div class="text-text-muted text-sm mt-1">Import data for autocomplete suggestions</div>
							</div>
						</div>
					</a>
				</div>
			</div>

			<!-- Recent Submissions -->
			<div>
				<h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
						<circle cx="12" cy="12" r="10"/>
						<polyline points="12 6 12 12 16 14"/>
					</svg>
					Recent Submissions
				</h2>
				{#if data.recentSubmissions.length === 0}
					<div class="bg-surface border border-border p-8 rounded-xl text-center">
						<div class="w-12 h-12 rounded-xl bg-surface-dim flex items-center justify-center mx-auto mb-3">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
								<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
								<polyline points="14 2 14 8 20 8"/>
							</svg>
						</div>
						<p class="text-text-muted">No goals submitted yet.</p>
					</div>
				{:else}
					<div class="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
						<div class="overflow-x-auto">
							<table class="w-full">
								<thead class="bg-surface-dim/50">
									<tr>
										<th class="text-left p-4 text-text-muted text-sm font-medium">Goal</th>
										<th class="text-left p-4 text-text-muted text-sm font-medium">Year</th>
										<th class="text-left p-4 text-text-muted text-sm font-medium">Status</th>
										<th class="text-right p-4 text-text-muted text-sm font-medium">Actions</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-border">
									{#each data.recentSubmissions as submission}
										<tr class="hover:bg-surface-dim/30 transition-colors">
											<td class="p-4">
												<div class="font-medium">{submission.scorer}</div>
												<div class="text-text-muted text-sm">{submission.team}</div>
											</td>
											<td class="p-4">
												<span class="font-medium text-primary">{submission.year}</span>
											</td>
											<td class="p-4">
												<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium {submission.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' : submission.status === 'approved' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}">
													{#if submission.status === 'pending'}
														<span class="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
													{:else if submission.status === 'approved'}
														<span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
													{:else}
														<span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
													{/if}
													{submission.status}
												</span>
											</td>
											<td class="p-4 text-right">
												<a href="/admin/review/{submission.id}" class="inline-flex items-center gap-1 text-primary hover:text-primary-hover text-sm font-medium transition-colors">
													View
													<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
														<path d="M5 12h14M12 5l7 7-7 7"/>
													</svg>
												</a>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
