<script lang="ts">
	import { enhance } from '$app/forms';
	import { GoalAnimation } from '$lib/components/animation';
	import type { AnimationData } from '$lib/server/db/schema';
	import { toast } from 'svelte-sonner';

	let { data, form } = $props();

	let selectedGoal = $state<(typeof data.pendingGoals)[0] | null>(null);
	let showPreview = $state(false);

	$effect(() => {
		if (form?.success) {
			toast.success(`Goal ${form.action} successfully`);
		}
	});
</script>

<div class="min-h-screen p-8">
	<div class="max-w-6xl mx-auto">
		<div class="mb-8">
			<a href="/admin" class="text-text-muted hover:text-primary text-sm">&larr; Back to Admin</a>
			<h1 class="text-4xl font-bold mt-2">Review Submissions</h1>
			<p class="text-text-muted mt-2">{data.pendingGoals.length} pending review{data.pendingGoals.length !== 1 ? 's' : ''}</p>
		</div>

		{#if data.pendingGoals.length === 0}
			<div class="bg-surface border border-border p-8 rounded-xl text-center">
				<div class="text-4xl mb-4">&#x2713;</div>
				<p class="text-text-muted">No pending submissions to review.</p>
				<p class="text-text-muted text-sm mt-2">All caught up!</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{#each data.pendingGoals as goal (goal.id)}
					<div class="bg-surface border border-border rounded-xl overflow-hidden">
						<!-- Goal Header -->
						<div class="p-5">
							<div class="flex items-baseline gap-3 mb-1">
								<h3 class="text-xl font-bold">{goal.scorer}</h3>
								<span class="text-xl font-bold text-primary">{goal.year}</span>
							</div>
							<p class="text-text-muted">{goal.team} vs {goal.opponent || '?'}</p>

							<!-- Metadata as subtle pills -->
							<div class="flex flex-wrap items-center gap-2 mt-3 text-xs">
								{#if goal.competition}
									<span class="inline-flex items-center gap-1 bg-background px-2 py-1 rounded-full text-text-muted">
										<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
											<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
											<path d="M4 22h16"/>
											<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
											<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
											<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
										</svg>
										{goal.competition}
									</span>
								{/if}
								<span class="inline-flex items-center gap-1 bg-background px-2 py-1 rounded-full text-text-muted">
									{#if goal.isInternational}
										<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<circle cx="12" cy="12" r="10"/>
											<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
											<path d="M2 12h20"/>
										</svg>
										International
									{:else}
										<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
											<line x1="4" y1="22" x2="4" y2="15"/>
										</svg>
										Club
									{/if}
								</span>
								{#if goal.matchContext}
									<span class="inline-flex items-center gap-1 bg-background px-2 py-1 rounded-full text-text-muted">
										<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
										</svg>
										{goal.matchContext}
									</span>
								{/if}
								{#if goal.submittedByUsername}
									<span class="inline-flex items-center gap-1 bg-background px-2 py-1 rounded-full text-text-muted">
										<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
											<circle cx="12" cy="7" r="4"/>
										</svg>
										{goal.submittedByUsername}
									</span>
								{/if}
								{#if goal.videoUrl}
									<a
										href={goal.videoUrl}
										target="_blank"
										rel="noopener noreferrer"
										class="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full hover:bg-primary/20 transition-colors"
									>
										<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<path d="m22 8-6 4 6 4V8Z"/>
											<rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
										</svg>
										Video
									</a>
								{/if}
							</div>
						</div>

						<!-- Animation Preview -->
						<button
							type="button"
							class="w-full border-t border-border bg-background p-3 hover:bg-background/80 transition-colors cursor-pointer"
							onclick={() => {
								selectedGoal = goal;
								showPreview = true;
							}}
						>
							<div class="h-44 rounded-lg overflow-hidden pointer-events-none">
								<GoalAnimation
									animation={goal.animationData as AnimationData}
									autoPlay={false}
								/>
							</div>
							<p class="text-xs text-text-muted mt-2">Click to expand</p>
						</button>

						<!-- Actions -->
						<div class="border-t border-border p-3 flex gap-2">
							<form method="POST" action="?/approve" use:enhance class="flex-1">
								<input type="hidden" name="goalId" value={goal.id} />
								<button
									type="submit"
									class="w-full bg-primary hover:bg-primary/80 text-background font-semibold py-2 px-4 rounded-lg transition-colors"
								>
									Approve
								</button>
							</form>
							<form method="POST" action="?/reject" use:enhance class="flex-1">
								<input type="hidden" name="goalId" value={goal.id} />
								<button
									type="submit"
									class="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
								>
									Reject
								</button>
							</form>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Recently Reviewed -->
		{#if data.recentlyReviewed.length > 0}
			<div class="mt-12">
				<h2 class="text-xl font-semibold mb-4">Recently Reviewed</h2>
				<div class="bg-surface border border-border rounded-xl overflow-hidden">
					<table class="w-full">
						<thead class="bg-background">
							<tr>
								<th class="text-left p-4 text-text-muted text-sm font-medium">Goal</th>
								<th class="text-left p-4 text-text-muted text-sm font-medium">Year</th>
								<th class="text-left p-4 text-text-muted text-sm font-medium">Status</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border">
							{#each data.recentlyReviewed as goal}
								<tr>
									<td class="p-4">
										<div class="font-medium">{goal.scorer}</div>
										<div class="text-text-muted text-sm">{goal.team}</div>
									</td>
									<td class="p-4 text-text-muted">{goal.year}</td>
									<td class="p-4">
										<span class="px-2 py-1 rounded text-xs font-medium {goal.status === 'approved' ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-500'}">
											{goal.status}
										</span>
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

<!-- Full Preview Modal -->
{#if showPreview && selectedGoal}
	<div
		class="fixed inset-0 bg-black/80 z-50 p-4 flex items-center justify-center"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={(e) => { if (e.target === e.currentTarget) { showPreview = false; selectedGoal = null; } }}
		onkeydown={(e) => { if (e.key === 'Escape') { showPreview = false; selectedGoal = null; } }}
	>
		<div class="bg-surface rounded-xl max-w-4xl w-full">
			<!-- Header -->
			<div class="p-4 flex items-center justify-between">
				<div class="flex items-baseline gap-3">
					<h3 class="text-xl font-bold">{selectedGoal.scorer}</h3>
					<span class="text-lg font-bold text-primary">{selectedGoal.year}</span>
				</div>
				<div class="flex items-center gap-3">
					<span class="text-text-muted">{selectedGoal.team} vs {selectedGoal.opponent || '?'}</span>
					<button
						type="button"
						onclick={() => { showPreview = false; selectedGoal = null; }}
						class="text-text-muted hover:text-text text-2xl leading-none"
					>
						&times;
					</button>
				</div>
			</div>

			<!-- Animation with aspect ratio container -->
			<div class="px-4">
				<div class="aspect-[100/75] max-h-[55vh] mx-auto">
					<GoalAnimation
						animation={selectedGoal.animationData as AnimationData}
						autoPlay={true}
					/>
				</div>
			</div>

			<!-- Actions -->
			<div class="p-4 flex gap-3">
				<form method="POST" action="?/approve" use:enhance class="flex-1">
					<input type="hidden" name="goalId" value={selectedGoal.id} />
					<button
						type="submit"
						onclick={() => { showPreview = false; selectedGoal = null; }}
						class="w-full bg-primary hover:bg-primary/80 text-background font-semibold py-3 px-4 rounded-lg transition-colors"
					>
						Approve
					</button>
				</form>
				<form method="POST" action="?/reject" use:enhance class="flex-1">
					<input type="hidden" name="goalId" value={selectedGoal.id} />
					<button
						type="submit"
						onclick={() => { showPreview = false; selectedGoal = null; }}
						class="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
					>
						Reject
					</button>
				</form>
			</div>
		</div>
	</div>
{/if}
