<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	let { data, form } = $props();

	let searchQuery = $state('');

	$effect(() => {
		if (form?.success) {
			toast.success(`Admin privileges ${form.action} successfully`);
		} else if (form?.error) {
			toast.error(form.error);
		}
	});

	const filteredUsers = $derived(
		data.users.filter((user) => {
			const query = searchQuery.toLowerCase();
			return (
				user.username?.toLowerCase().includes(query) ||
				user.email?.toLowerCase().includes(query)
			);
		})
	);

	function formatDate(date: Date | null): string {
		if (!date) return 'Unknown';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	const totalGamesPlayed = $derived(data.users.reduce((sum, u) => sum + u.gamesPlayed, 0));
	const totalScore = $derived(data.users.reduce((sum, u) => sum + u.totalScore, 0));
	const adminCount = $derived(data.users.filter((u) => u.isAdmin).length);
</script>

<svelte:head>
	<title>Users | Top Bins Daily</title>
</svelte:head>

<div class="min-h-[calc(100vh-3.5rem)] relative overflow-hidden">
	<!-- Animated background elements -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
		<div class="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
	</div>

	<div class="relative z-10 p-6 md:p-8">
		<div class="max-w-7xl mx-auto">
			<!-- Header -->
			<div class="mb-8">
				<a href="/admin" class="group inline-flex items-center gap-1.5 text-text-muted hover:text-primary text-sm mb-3 transition-colors">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:-translate-x-1">
						<path d="M19 12H5M12 19l-7-7 7-7"/>
					</svg>
					Back to Admin
				</a>
				<div class="flex items-center gap-4">
					<div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
							<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
							<circle cx="9" cy="7" r="4"/>
							<path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
							<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
						</svg>
					</div>
					<div>
						<h1 class="text-3xl md:text-4xl font-bold">User Management</h1>
						<p class="text-text-muted mt-1">{data.users.length} registered user{data.users.length !== 1 ? 's' : ''}</p>
					</div>
				</div>
			</div>

			<!-- Stats -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<div class="bg-surface border border-border p-5 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-primary/30 group">
					<div class="flex items-center gap-3 mb-2">
						<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
								<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
								<circle cx="12" cy="12" r="3"/>
							</svg>
						</div>
					</div>
					<div class="text-3xl font-bold text-primary">{adminCount}</div>
					<div class="text-text-muted text-sm mt-0.5">Admin{adminCount !== 1 ? 's' : ''}</div>
				</div>

				<div class="bg-surface border border-border p-5 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-purple-500/30 group">
					<div class="flex items-center gap-3 mb-2">
						<div class="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-500">
								<path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/>
								<path d="M15.5 8.5 19 5.5a2.5 2.5 0 0 0-3.5-3.5L12 5.5 8.5 2A2.5 2.5 0 1 0 5 5.5L8.5 8.5"/>
							</svg>
						</div>
					</div>
					<div class="text-3xl font-bold text-purple-500">{totalGamesPlayed.toLocaleString()}</div>
					<div class="text-text-muted text-sm mt-0.5">Total Games Played</div>
				</div>

				<div class="bg-surface border border-border p-5 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-yellow-500/30 group">
					<div class="flex items-center gap-3 mb-2">
						<div class="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-500">
								<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
								<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
								<path d="M4 22h16"/>
								<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
								<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
								<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
							</svg>
						</div>
					</div>
					<div class="text-3xl font-bold text-yellow-500">{totalScore.toLocaleString()}</div>
					<div class="text-text-muted text-sm mt-0.5">Combined Score</div>
				</div>
			</div>

			<!-- Search -->
			<div class="mb-6">
				<div class="relative max-w-md">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
						<circle cx="11" cy="11" r="8"/>
						<path d="m21 21-4.3-4.3"/>
					</svg>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search by username or email..."
						class="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
					/>
				</div>
			</div>

			{#if filteredUsers.length === 0}
				<div class="bg-surface border border-border p-12 rounded-xl text-center">
					<div class="w-16 h-16 rounded-xl bg-surface-dim flex items-center justify-center mx-auto mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
							<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
							<circle cx="9" cy="7" r="4"/>
							<path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
							<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
						</svg>
					</div>
					<p class="text-text-muted text-lg">
						{searchQuery ? 'No users match your search.' : 'No registered users yet.'}
					</p>
					{#if searchQuery}
						<button
							type="button"
							onclick={() => searchQuery = ''}
							class="mt-4 text-primary hover:text-primary-hover font-medium transition-colors"
						>
							Clear search
						</button>
					{/if}
				</div>
			{:else}
				<div class="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
					<div class="overflow-x-auto">
						<table class="w-full">
							<thead class="bg-surface-dim/50">
								<tr>
									<th class="text-left p-4 text-text-muted text-sm font-medium">User</th>
									<th class="text-left p-4 text-text-muted text-sm font-medium hidden md:table-cell">Joined</th>
									<th class="text-center p-4 text-text-muted text-sm font-medium">Games</th>
									<th class="text-center p-4 text-text-muted text-sm font-medium hidden sm:table-cell">Total Score</th>
									<th class="text-center p-4 text-text-muted text-sm font-medium hidden lg:table-cell">Avg Score</th>
									<th class="text-center p-4 text-text-muted text-sm font-medium">Role</th>
									<th class="text-right p-4 text-text-muted text-sm font-medium">Actions</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-border">
								{#each filteredUsers as user}
									<tr class="hover:bg-surface-dim/30 transition-colors">
										<td class="p-4">
											<div class="flex items-center gap-3">
												<div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-hover text-white flex items-center justify-center text-sm font-semibold uppercase shadow-sm">
													{user.username?.charAt(0) ?? '?'}
												</div>
												<div>
													<div class="font-medium">{user.username || 'No username'}</div>
													<div class="text-text-muted text-sm">{user.email}</div>
												</div>
											</div>
										</td>
										<td class="p-4 text-text-muted text-sm hidden md:table-cell">
											{formatDate(user.createdAt)}
										</td>
										<td class="p-4 text-center">
											<span class="font-medium">{user.gamesPlayed}</span>
										</td>
										<td class="p-4 text-center font-semibold hidden sm:table-cell">
											{user.totalScore.toLocaleString()}
										</td>
										<td class="p-4 text-center text-text-muted hidden lg:table-cell">
											{user.averageScore}
										</td>
										<td class="p-4 text-center">
											{#if user.isAdmin}
												<span class="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
													<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
														<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
														<circle cx="12" cy="12" r="3"/>
													</svg>
													Admin
												</span>
											{:else}
												<span class="text-text-muted text-xs">User</span>
											{/if}
										</td>
										<td class="p-4 text-right">
											<form method="POST" action="?/toggleAdmin" use:enhance class="inline">
												<input type="hidden" name="userId" value={user.id} />
												<button
													type="submit"
													class="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors {user.isAdmin ? 'text-red-500 hover:text-red-600 hover:bg-red-500/5' : 'text-primary hover:text-primary-hover hover:bg-primary/5'}"
												>
													{#if user.isAdmin}
														<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
															<path d="M18 6 6 18M6 6l12 12"/>
														</svg>
														Remove Admin
													{:else}
														<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
															<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
															<circle cx="9" cy="7" r="4"/>
															<line x1="19" y1="8" x2="19" y2="14"/>
															<line x1="22" y1="11" x2="16" y2="11"/>
														</svg>
														Make Admin
													{/if}
												</button>
											</form>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>

				<div class="mt-4 text-text-muted text-sm">
					Showing {filteredUsers.length} of {data.users.length} users
				</div>
			{/if}
		</div>
	</div>
</div>
