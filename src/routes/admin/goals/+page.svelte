<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	let { data, form } = $props();

	let searchQuery = $state('');
	let statusFilter = $state<'all' | 'pending' | 'approved' | 'rejected'>('all');
	let deleteConfirmId = $state<string | null>(null);

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

<div class="min-h-screen p-8">
	<div class="max-w-7xl mx-auto">
		<div class="mb-8">
			<a href="/admin" class="text-text-muted hover:text-primary text-sm">&larr; Back to Admin</a>
			<h1 class="text-4xl font-bold mt-2">Goal Management</h1>
			<p class="text-text-muted mt-2">{data.counts.total} total goal{data.counts.total !== 1 ? 's' : ''}</p>
		</div>

		<!-- Stats -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
			<button
				type="button"
				onclick={() => statusFilter = 'all'}
				class="bg-surface border border-border p-4 rounded-xl text-left transition-colors {statusFilter === 'all' ? 'border-primary' : ''}"
			>
				<div class="text-2xl font-bold">{data.counts.total}</div>
				<div class="text-text-muted text-sm">Total</div>
			</button>
			<button
				type="button"
				onclick={() => statusFilter = 'pending'}
				class="bg-surface border border-border p-4 rounded-xl text-left transition-colors {statusFilter === 'pending' ? 'border-yellow-500' : ''}"
			>
				<div class="text-2xl font-bold text-yellow-500">{data.counts.pending}</div>
				<div class="text-text-muted text-sm">Pending</div>
			</button>
			<button
				type="button"
				onclick={() => statusFilter = 'approved'}
				class="bg-surface border border-border p-4 rounded-xl text-left transition-colors {statusFilter === 'approved' ? 'border-primary' : ''}"
			>
				<div class="text-2xl font-bold text-primary">{data.counts.approved}</div>
				<div class="text-text-muted text-sm">Approved</div>
			</button>
			<button
				type="button"
				onclick={() => statusFilter = 'rejected'}
				class="bg-surface border border-border p-4 rounded-xl text-left transition-colors {statusFilter === 'rejected' ? 'border-red-500' : ''}"
			>
				<div class="text-2xl font-bold text-red-500">{data.counts.rejected}</div>
				<div class="text-text-muted text-sm">Rejected</div>
			</button>
		</div>

		<!-- Search -->
		<div class="mb-6">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search by scorer, team, opponent, competition, or year..."
				class="w-full max-w-md bg-surface border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
			/>
		</div>

		{#if filteredGoals.length === 0}
			<div class="bg-surface border border-border p-8 rounded-xl text-center">
				<p class="text-text-muted">
					{searchQuery || statusFilter !== 'all' ? 'No goals match your filters.' : 'No goals yet.'}
				</p>
			</div>
		{:else}
			<div class="bg-surface border border-border rounded-xl overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-background">
							<tr>
								<th class="text-left p-4 text-text-muted text-sm font-medium">Goal</th>
								<th class="text-left p-4 text-text-muted text-sm font-medium">Year</th>
								<th class="text-left p-4 text-text-muted text-sm font-medium">Competition</th>
								<th class="text-left p-4 text-text-muted text-sm font-medium">Submitted</th>
								<th class="text-center p-4 text-text-muted text-sm font-medium">Status</th>
								<th class="text-right p-4 text-text-muted text-sm font-medium">Actions</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border">
							{#each filteredGoals as goal (goal.id)}
								<tr class="hover:bg-background/50">
									<td class="p-4">
										<div class="font-medium">{goal.scorer}</div>
										<div class="text-text-muted text-sm">
											{goal.team} vs {goal.opponent || 'Unknown'}
										</div>
									</td>
									<td class="p-4 font-medium text-primary">{goal.year}</td>
									<td class="p-4 text-text-muted text-sm">
										{goal.competition || '-'}
										{#if goal.isInternational}
											<span class="ml-1 text-xs">(Int'l)</span>
										{/if}
									</td>
									<td class="p-4">
										<div class="text-sm">{goal.submittedByUsername || 'Unknown'}</div>
										<div class="text-text-muted text-xs">{formatDate(goal.createdAt)}</div>
									</td>
									<td class="p-4 text-center">
										<span class="px-2 py-1 rounded text-xs font-medium
											{goal.status === 'approved' ? 'bg-primary/20 text-primary' : ''}
											{goal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : ''}
											{goal.status === 'rejected' ? 'bg-red-500/20 text-red-500' : ''}
										">
											{goal.status}
										</span>
									</td>
									<td class="p-4 text-right">
										<div class="flex items-center justify-end gap-2">
											<a
												href="/admin/editor/{goal.id}"
												class="text-sm text-primary hover:underline"
											>
												Edit
											</a>

											{#if goal.status !== 'approved'}
												<form method="POST" action="?/updateStatus" use:enhance class="inline">
													<input type="hidden" name="goalId" value={goal.id} />
													<input type="hidden" name="status" value="approved" />
													<button type="submit" class="text-sm text-primary hover:underline">
														Approve
													</button>
												</form>
											{/if}

											{#if goal.status !== 'rejected'}
												<form method="POST" action="?/updateStatus" use:enhance class="inline">
													<input type="hidden" name="goalId" value={goal.id} />
													<input type="hidden" name="status" value="rejected" />
													<button type="submit" class="text-sm text-yellow-500 hover:underline">
														Reject
													</button>
												</form>
											{/if}

											{#if deleteConfirmId === goal.id}
												<form method="POST" action="?/delete" use:enhance class="inline">
													<input type="hidden" name="goalId" value={goal.id} />
													<button type="submit" class="text-sm text-red-500 hover:underline font-bold">
														Confirm?
													</button>
												</form>
												<button
													type="button"
													onclick={() => deleteConfirmId = null}
													class="text-sm text-text-muted hover:underline"
												>
													Cancel
												</button>
											{:else}
												<button
													type="button"
													onclick={() => deleteConfirmId = goal.id}
													class="text-sm text-red-500 hover:underline"
												>
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

			<div class="mt-4 text-text-muted text-sm">
				Showing {filteredGoals.length} of {data.counts.total} goals
			</div>
		{/if}
	</div>
</div>
