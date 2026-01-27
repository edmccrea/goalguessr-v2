<script lang="ts">
	import { enhance } from '$app/forms';
	import { GoalAnimation } from '$lib/components/animation';
	import type { AnimationData } from '$lib/server/db/schema';
	import { toast } from 'svelte-sonner';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	let { data, form } = $props();

	let selectedGoal = $state<(typeof data.pendingGoals)[0] | null>(null);
	let showPreview = $state(false);
	let processingGoal = $state<{ id: string; action: 'approve' | 'reject' } | null>(null);
	let showRejectModal = $state(false);
	let rejectingGoal = $state<(typeof data.pendingGoals)[0] | null>(null);
	let rejectionReason = $state('');

	$effect(() => {
		if (form?.success) {
			toast.success(`Goal ${form.action} successfully`);
		}
	});
</script>

<svelte:head>
	<title>Review Queue | Top Bins Daily</title>
</svelte:head>

<div class="min-h-[calc(100vh-3.5rem)] relative overflow-hidden">
	<!-- Animated background elements -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute -top-40 -right-40 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
		<div class="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
	</div>

	<div class="relative z-10 p-6 md:p-8">
		<div class="max-w-6xl mx-auto">
			<!-- Header -->
			<div class="mb-8">
				<a href="/admin" class="group inline-flex items-center gap-1.5 text-text-muted hover:text-primary text-sm mb-3 transition-colors">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:-translate-x-1">
						<path d="M19 12H5M12 19l-7-7 7-7"/>
					</svg>
					Back to Admin
				</a>
				<div class="flex items-center gap-4">
					<div class="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-500">
							<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
							<circle cx="12" cy="12" r="3"/>
						</svg>
					</div>
					<div>
						<h1 class="text-3xl md:text-4xl font-bold">Review Submissions</h1>
						<p class="text-text-muted mt-1">{data.pendingGoals.length} pending review{data.pendingGoals.length !== 1 ? 's' : ''}</p>
					</div>
				</div>
			</div>

			{#if data.pendingGoals.length === 0}
				<div class="bg-surface border border-border p-12 rounded-xl text-center shadow-sm">
					<div class="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
							<polyline points="20 6 9 17 4 12"/>
						</svg>
					</div>
					<p class="text-lg font-medium">No pending submissions to review.</p>
					<p class="text-text-muted text-sm mt-2">All caught up! Check back later for new submissions.</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{#each data.pendingGoals as goal (goal.id)}
						<div class="bg-surface border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
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
										<span class="inline-flex items-center gap-1 bg-surface-dim px-2.5 py-1 rounded-full text-text-muted">
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
									<span class="inline-flex items-center gap-1 bg-surface-dim px-2.5 py-1 rounded-full text-text-muted">
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
										<span class="inline-flex items-center gap-1 bg-surface-dim px-2.5 py-1 rounded-full text-text-muted">
											<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
												<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
											</svg>
											{goal.matchContext}
										</span>
									{/if}
									{#if goal.submittedByUsername}
										<span class="inline-flex items-center gap-1 bg-surface-dim px-2.5 py-1 rounded-full text-text-muted">
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
											class="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors"
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
								class="w-full border-t border-border bg-surface-dim/30 p-3 hover:bg-surface-dim/50 transition-colors cursor-pointer"
								onclick={() => {
									selectedGoal = goal;
									showPreview = true;
								}}
							>
								<div class="h-44 rounded-xl overflow-hidden pointer-events-none border border-border">
									<GoalAnimation
										animation={goal.animationData as AnimationData}
										autoPlay={false}
									/>
								</div>
								<p class="text-xs text-text-muted mt-2 flex items-center justify-center gap-1">
									<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
									</svg>
									Click to expand
								</p>
							</button>

							<!-- Actions -->
							<div class="border-t border-border p-3 flex gap-2">
								<a
									href="/admin/review/{goal.id}"
									class="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
										<circle cx="12" cy="12" r="3"/>
									</svg>
									Review
								</a>
								<button
									type="button"
									onclick={() => { rejectingGoal = goal; showRejectModal = true; }}
									disabled={processingGoal !== null}
									class="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-500/70 text-white font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M18 6 6 18M6 6l12 12"/>
									</svg>
									Reject
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Recently Reviewed -->
			{#if data.recentlyReviewed.length > 0}
				<div class="mt-12">
					<div class="flex items-center gap-2 mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
							<circle cx="12" cy="12" r="10"/>
							<polyline points="12 6 12 12 16 14"/>
						</svg>
						<h2 class="text-xl font-semibold">Recently Reviewed</h2>
					</div>
					<div class="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
						<div class="overflow-x-auto">
							<table class="w-full">
								<thead class="bg-surface-dim/50">
									<tr>
										<th class="text-left p-4 text-text-muted text-sm font-medium">Goal</th>
										<th class="text-left p-4 text-text-muted text-sm font-medium">Year</th>
										<th class="text-left p-4 text-text-muted text-sm font-medium">Status</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-border">
									{#each data.recentlyReviewed as goal}
										<tr class="hover:bg-surface-dim/30 transition-colors">
											<td class="p-4">
												<div class="font-medium">{goal.scorer}</div>
												<div class="text-text-muted text-sm">{goal.team}</div>
											</td>
											<td class="p-4">
												<span class="font-semibold text-primary">{goal.year}</span>
											</td>
											<td class="p-4">
												<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium {goal.status === 'approved' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}">
													{#if goal.status === 'approved'}
														<span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
													{:else}
														<span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
													{/if}
													{goal.status}
												</span>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Full Preview Modal -->
{#if showPreview && selectedGoal}
	<div
		class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 p-4 flex items-center justify-center"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={(e) => { if (e.target === e.currentTarget) { showPreview = false; selectedGoal = null; } }}
		onkeydown={(e) => { if (e.key === 'Escape') { showPreview = false; selectedGoal = null; } }}
	>
		<div class="bg-surface rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden">
			<!-- Header -->
			<div class="p-4 flex items-center justify-between border-b border-border">
				<div class="flex items-baseline gap-3">
					<h3 class="text-xl font-bold">{selectedGoal.scorer}</h3>
					<span class="text-lg font-bold text-primary">{selectedGoal.year}</span>
				</div>
				<div class="flex items-center gap-3">
					<span class="text-text-muted">{selectedGoal.team} vs {selectedGoal.opponent || '?'}</span>
					<button
						type="button"
						onclick={() => { showPreview = false; selectedGoal = null; }}
						class="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-dim transition-colors"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M18 6 6 18M6 6l12 12"/>
						</svg>
					</button>
				</div>
			</div>

			<!-- Animation with aspect ratio container -->
			<div class="p-4 bg-surface-dim/30">
				<div class="aspect-[100/75] max-h-[55vh] mx-auto rounded-xl overflow-hidden border border-border">
					<GoalAnimation
						animation={selectedGoal.animationData as AnimationData}
						autoPlay={true}
					/>
				</div>
			</div>

			<!-- Actions -->
			<div class="p-4 border-t border-border flex gap-3">
				<a
					href="/admin/review/{selectedGoal.id}"
					class="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
						<circle cx="12" cy="12" r="3"/>
					</svg>
					Review
				</a>
				<button
					type="button"
					onclick={() => { rejectingGoal = selectedGoal; showRejectModal = true; showPreview = false; }}
					disabled={processingGoal !== null}
					class="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-500/70 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M18 6 6 18M6 6l12 12"/>
					</svg>
					Reject
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Rejection Modal -->
{#if showRejectModal && rejectingGoal}
	<div
		class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 p-4 flex items-center justify-center"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={(e) => { if (e.target === e.currentTarget && processingGoal === null) { showRejectModal = false; rejectingGoal = null; rejectionReason = ''; } }}
		onkeydown={(e) => { if (e.key === 'Escape' && processingGoal === null) { showRejectModal = false; rejectingGoal = null; rejectionReason = ''; } }}
	>
		<div class="bg-surface rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
			<div class="p-6 border-b border-border">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500">
							<line x1="18" y1="6" x2="6" y2="18"/>
							<line x1="6" y1="6" x2="18" y2="18"/>
						</svg>
					</div>
					<div>
						<h2 class="text-xl font-bold">Reject Goal</h2>
						<p class="text-sm text-text-muted">{rejectingGoal.scorer} - {rejectingGoal.team} ({rejectingGoal.year})</p>
					</div>
				</div>
			</div>

			<form method="POST" action="?/reject" use:enhance={() => {
				processingGoal = { id: rejectingGoal!.id, action: 'reject' };
				return async ({ update }) => {
					processingGoal = null;
					showRejectModal = false;
					rejectingGoal = null;
					rejectionReason = '';
					selectedGoal = null;
					await update();
				};
			}}>
				<input type="hidden" name="goalId" value={rejectingGoal.id} />
				<div class="p-6">
					<label for="rejectionReason" class="block text-sm font-medium mb-2">Rejection Reason</label>
					<textarea
						id="rejectionReason"
						name="rejectionReason"
						bind:value={rejectionReason}
						rows="4"
						class="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
						placeholder="Explain why this goal is being rejected (e.g., animation doesn't match the video, incorrect metadata, duplicate submission...)"
					></textarea>
					<p class="text-xs text-text-muted mt-2">This message will be visible to the user who submitted the goal.</p>
				</div>

				<div class="p-4 border-t border-border flex gap-3">
					<button
						type="button"
						onclick={() => { showRejectModal = false; rejectingGoal = null; rejectionReason = ''; }}
						disabled={processingGoal !== null}
						class="flex-1 bg-surface-dim hover:bg-border border border-border font-semibold py-3 px-4 rounded-xl transition-colors disabled:cursor-not-allowed disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={processingGoal !== null}
						class="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-500/70 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
					>
						{#if processingGoal?.id === rejectingGoal.id && processingGoal?.action === 'reject'}
							<Spinner size="sm" />
							Rejecting...
						{:else}
							Reject Goal
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
