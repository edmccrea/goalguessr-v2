<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	let { data, form } = $props();

	let searchQuery = $state('');
	let statusFilter = $state<'all' | 'pending' | 'approved' | 'rejected'>('all');
	let deleteConfirmId = $state<string | null>(null);
	let processingGoal = $state<{ id: string; action: 'approve' | 'reject' | 'delete' } | null>(null);

	$effect(() => {
		if (form?.success) {
			toast.success(`Goal ${form.action} successfully`);
			deleteConfirmId = null;
		} else if (form?.error) {
			toast.error(form.error);
		}
	});

	const filteredGoals = $derived(
		data.goals.filter((goal) => {
			const query = searchQuery.toLowerCase();
			const matchesSearch =
				goal.scorer?.toLowerCase().includes(query) ||
				goal.team?.toLowerCase().includes(query) ||
				goal.opponent?.toLowerCase().includes(query) ||
				goal.competition?.toLowerCase().includes(query) ||
				goal.year?.toString().includes(query);

			const matchesStatus = statusFilter === 'all' || goal.status === statusFilter;

			return matchesSearch && matchesStatus;
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
</script>

<div class="min-h-[calc(100vh-3.5rem)] relative overflow-hidden">
	<!-- Animated background elements -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
		<div class="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
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
					<div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
							<circle cx="12" cy="12" r="10"/>
							<polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
						</svg>
					</div>
					<div>
						<h1 class="text-3xl md:text-4xl font-bold">Goal Management</h1>
						<p class="text-text-muted mt-1">{data.counts.total} total goal{data.counts.total !== 1 ? 's' : ''} in the database</p>
					</div>
				</div>
			</div>

			<!-- Stats Filter Cards -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				<button
					type="button"
					onclick={() => statusFilter = 'all'}
					class="group bg-surface border p-4 rounded-xl text-left transition-all hover:shadow-md {statusFilter === 'all' ? 'border-primary shadow-md' : 'border-border hover:border-primary/30'}"
				>
					<div class="flex items-center gap-3 mb-1">
						<div class="w-8 h-8 rounded-lg bg-surface-dim flex items-center justify-center group-hover:scale-110 transition-transform">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
								<rect width="7" height="7" x="3" y="3" rx="1"/>
								<rect width="7" height="7" x="14" y="3" rx="1"/>
								<rect width="7" height="7" x="14" y="14" rx="1"/>
								<rect width="7" height="7" x="3" y="14" rx="1"/>
							</svg>
						</div>
					</div>
					<div class="text-2xl font-bold">{data.counts.total}</div>
					<div class="text-text-muted text-sm">Total</div>
				</button>

				<button
					type="button"
					onclick={() => statusFilter = 'pending'}
					class="group bg-surface border p-4 rounded-xl text-left transition-all hover:shadow-md {statusFilter === 'pending' ? 'border-yellow-500 shadow-md' : 'border-border hover:border-yellow-500/30'}"
				>
					<div class="flex items-center gap-3 mb-1">
						<div class="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-500">
								<circle cx="12" cy="12" r="10"/>
								<path d="M12 6v6l4 2"/>
							</svg>
						</div>
					</div>
					<div class="text-2xl font-bold text-yellow-500">{data.counts.pending}</div>
					<div class="text-text-muted text-sm">Pending</div>
				</button>

				<button
					type="button"
					onclick={() => statusFilter = 'approved'}
					class="group bg-surface border p-4 rounded-xl text-left transition-all hover:shadow-md {statusFilter === 'approved' ? 'border-primary shadow-md' : 'border-border hover:border-primary/30'}"
				>
					<div class="flex items-center gap-3 mb-1">
						<div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
								<polyline points="20 6 9 17 4 12"/>
							</svg>
						</div>
					</div>
					<div class="text-2xl font-bold text-primary">{data.counts.approved}</div>
					<div class="text-text-muted text-sm">Approved</div>
				</button>

				<button
					type="button"
					onclick={() => statusFilter = 'rejected'}
					class="group bg-surface border p-4 rounded-xl text-left transition-all hover:shadow-md {statusFilter === 'rejected' ? 'border-red-500 shadow-md' : 'border-border hover:border-red-500/30'}"
				>
					<div class="flex items-center gap-3 mb-1">
						<div class="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500">
								<path d="M18 6 6 18M6 6l12 12"/>
							</svg>
						</div>
					</div>
					<div class="text-2xl font-bold text-red-500">{data.counts.rejected}</div>
					<div class="text-text-muted text-sm">Rejected</div>
				</button>
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
						placeholder="Search by scorer, team, opponent, competition, or year..."
						class="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
					/>
				</div>
			</div>

			{#if filteredGoals.length === 0}
				<div class="bg-surface border border-border p-12 rounded-xl text-center">
					<div class="w-16 h-16 rounded-xl bg-surface-dim flex items-center justify-center mx-auto mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
							<circle cx="11" cy="11" r="8"/>
							<path d="m21 21-4.3-4.3"/>
						</svg>
					</div>
					<p class="text-text-muted text-lg">
						{searchQuery || statusFilter !== 'all' ? 'No goals match your filters.' : 'No goals yet.'}
					</p>
					{#if searchQuery || statusFilter !== 'all'}
						<button
							type="button"
							onclick={() => { searchQuery = ''; statusFilter = 'all'; }}
							class="mt-4 text-primary hover:text-primary-hover font-medium transition-colors"
						>
							Clear filters
						</button>
					{/if}
				</div>
			{:else}
				<div class="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
					<div class="overflow-x-auto">
						<table class="w-full">
							<thead class="bg-surface-dim/50">
								<tr>
									<th class="text-left p-4 text-text-muted text-sm font-medium">Goal</th>
									<th class="text-left p-4 text-text-muted text-sm font-medium">Year</th>
									<th class="text-left p-4 text-text-muted text-sm font-medium hidden md:table-cell">Competition</th>
									<th class="text-left p-4 text-text-muted text-sm font-medium hidden lg:table-cell">Submitted</th>
									<th class="text-center p-4 text-text-muted text-sm font-medium">Status</th>
									<th class="text-right p-4 text-text-muted text-sm font-medium">Actions</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-border">
								{#each filteredGoals as goal (goal.id)}
									<tr class="hover:bg-surface-dim/30 transition-colors">
										<td class="p-4">
											<div class="font-medium">{goal.scorer}</div>
											<div class="text-text-muted text-sm">
												{goal.team} vs {goal.opponent || 'Unknown'}
											</div>
										</td>
										<td class="p-4">
											<span class="font-semibold text-primary">{goal.year}</span>
										</td>
										<td class="p-4 text-text-muted text-sm hidden md:table-cell">
											<div class="flex items-center gap-2">
												{goal.competition || '-'}
												{#if goal.isInternational}
													<span class="inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 text-xs px-2 py-0.5 rounded-full">
														<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
															<circle cx="12" cy="12" r="10"/>
															<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
															<path d="M2 12h20"/>
														</svg>
														Int'l
													</span>
												{/if}
											</div>
										</td>
										<td class="p-4 hidden lg:table-cell">
											<div class="text-sm font-medium">{goal.submittedByUsername || 'Unknown'}</div>
											<div class="text-text-muted text-xs">{formatDate(goal.createdAt)}</div>
										</td>
										<td class="p-4 text-center">
											<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
												{goal.status === 'approved' ? 'bg-primary/10 text-primary' : ''}
												{goal.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' : ''}
												{goal.status === 'rejected' ? 'bg-red-500/10 text-red-500' : ''}
											">
												{#if goal.status === 'pending'}
													<span class="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
												{:else if goal.status === 'approved'}
													<span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
												{:else}
													<span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
												{/if}
												{goal.status}
											</span>
										</td>
										<td class="p-4 text-right">
											<div class="flex items-center justify-end gap-1">
												<a
													href="/admin/editor/{goal.id}"
													class="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover font-medium px-2 py-1 rounded-lg hover:bg-primary/5 transition-colors"
												>
													<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
														<path d="M12 20h9"/>
														<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
													</svg>
													Edit
												</a>

												{#if goal.status !== 'approved'}
													<form method="POST" action="?/updateStatus" use:enhance={() => {
														processingGoal = { id: goal.id, action: 'approve' };
														return async ({ update }) => {
															processingGoal = null;
															await update();
														};
													}} class="inline">
														<input type="hidden" name="goalId" value={goal.id} />
														<input type="hidden" name="status" value="approved" />
														<button type="submit" disabled={processingGoal !== null} class="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover disabled:text-primary/50 font-medium px-2 py-1 rounded-lg hover:bg-primary/5 disabled:hover:bg-transparent transition-colors disabled:cursor-not-allowed">
															{#if processingGoal?.id === goal.id && processingGoal?.action === 'approve'}
																<Spinner size="sm" />
															{:else}
																<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
																	<polyline points="20 6 9 17 4 12"/>
																</svg>
															{/if}
															Approve
														</button>
													</form>
												{/if}

												{#if goal.status !== 'rejected'}
													<form method="POST" action="?/updateStatus" use:enhance={() => {
														processingGoal = { id: goal.id, action: 'reject' };
														return async ({ update }) => {
															processingGoal = null;
															await update();
														};
													}} class="inline">
														<input type="hidden" name="goalId" value={goal.id} />
														<input type="hidden" name="status" value="rejected" />
														<button type="submit" disabled={processingGoal !== null} class="inline-flex items-center gap-1 text-sm text-yellow-600 hover:text-yellow-700 disabled:text-yellow-600/50 font-medium px-2 py-1 rounded-lg hover:bg-yellow-500/5 disabled:hover:bg-transparent transition-colors disabled:cursor-not-allowed">
															{#if processingGoal?.id === goal.id && processingGoal?.action === 'reject'}
																<Spinner size="sm" />
															{:else}
																<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
																	<circle cx="12" cy="12" r="10"/>
																	<path d="m15 9-6 6M9 9l6 6"/>
																</svg>
															{/if}
															Reject
														</button>
													</form>
												{/if}

												{#if deleteConfirmId === goal.id}
													<form method="POST" action="?/delete" use:enhance={() => {
														processingGoal = { id: goal.id, action: 'delete' };
														return async ({ update }) => {
															processingGoal = null;
															await update();
														};
													}} class="inline">
														<input type="hidden" name="goalId" value={goal.id} />
														<button type="submit" disabled={processingGoal !== null} class="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-600 font-bold px-2 py-1 rounded-lg bg-red-500/10 transition-colors disabled:cursor-not-allowed">
															{#if processingGoal?.id === goal.id && processingGoal?.action === 'delete'}
																<Spinner size="sm" />
																Deleting...
															{:else}
																Confirm?
															{/if}
														</button>
													</form>
													<button
														type="button"
														onclick={() => deleteConfirmId = null}
														disabled={processingGoal !== null}
														class="text-sm text-text-muted hover:text-text px-2 py-1 rounded-lg hover:bg-surface-dim transition-colors disabled:cursor-not-allowed"
													>
														Cancel
													</button>
												{:else}
													<button
														type="button"
														onclick={() => deleteConfirmId = goal.id}
														disabled={processingGoal !== null}
														class="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-600 disabled:text-red-500/50 font-medium px-2 py-1 rounded-lg hover:bg-red-500/5 disabled:hover:bg-transparent transition-colors disabled:cursor-not-allowed"
													>
														<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
															<path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
														</svg>
														Delete
													</button>
												{/if}
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>

				<div class="mt-4 flex items-center justify-between">
					<div class="text-text-muted text-sm">
						Showing {filteredGoals.length} of {data.counts.total} goals
					</div>
					{#if searchQuery || statusFilter !== 'all'}
						<button
							type="button"
							onclick={() => { searchQuery = ''; statusFilter = 'all'; }}
							class="text-primary hover:text-primary-hover text-sm font-medium transition-colors"
						>
							Clear filters
						</button>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
