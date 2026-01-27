<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';
	import { GoalAnimation } from '$lib/components/animation';
	import type { AnimationData } from '$lib/server/db/schema';

	let { data } = $props();

	let selectedGoal = $state<(typeof data.submissions)[0] | null>(null);
	let showPreview = $state(false);

	function getStatusColor(status: string | null) {
		switch (status) {
			case 'approved':
				return 'bg-primary/10 text-primary';
			case 'rejected':
				return 'bg-red-500/10 text-red-500';
			default:
				return 'bg-yellow-500/10 text-yellow-500';
		}
	}

	function getStatusDot(status: string | null) {
		switch (status) {
			case 'approved':
				return 'bg-primary';
			case 'rejected':
				return 'bg-red-500';
			default:
				return 'bg-yellow-500';
		}
	}

	function formatDate(date: Date | null) {
		if (!date) return 'Unknown';
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>My Submissions | Top Bins Daily</title>
</svelte:head>

<div class="relative min-h-screen overflow-hidden">
	<!-- Animated background elements -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
		<div class="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
	</div>

	<div class="relative z-10 py-12 px-6">
		<div class="max-w-4xl mx-auto">
			<!-- Header -->
			<div class="mb-10" in:fly={{ y: -20, duration: 500, easing: cubicOut }}>
				<a
					href="/profile"
					class="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm font-medium transition-colors mb-4 group"
				>
					<svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
					Back to Profile
				</a>
				<div class="flex items-center gap-4">
					<div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg shadow-primary/25">
						<svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
					</div>
					<div>
						<h1 class="text-3xl sm:text-4xl font-bold">My Submissions</h1>
						<p class="text-text-muted mt-1">{data.submissions.length} goal{data.submissions.length !== 1 ? 's' : ''} submitted</p>
					</div>
				</div>
			</div>

			{#if data.submissions.length === 0}
				<div
					class="bg-surface border border-border p-12 rounded-2xl text-center shadow-lg"
					in:scale={{ start: 0.95, duration: 400, delay: 100, easing: backOut }}
				>
					<div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-dim flex items-center justify-center">
						<svg class="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
					</div>
					<p class="text-text-muted font-medium">No submissions yet</p>
					<p class="text-sm text-text-muted mt-1">Create your first goal animation to see it here</p>
					<a
						href="/editor"
						class="inline-flex items-center gap-2 mt-6 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
					>
						Create a Goal
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</a>
				</div>
			{:else}
				<div class="space-y-4">
					{#each data.submissions as submission, idx}
						<div
							class="bg-surface border border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
							in:fly={{ y: 20, duration: 400, delay: 100 + idx * 50, easing: cubicOut }}
						>
							<div class="p-5">
								<div class="flex items-start justify-between gap-4 flex-wrap">
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-3 mb-1 flex-wrap">
											<h3 class="text-xl font-bold">{submission.scorer}</h3>
											<span class="text-xl font-bold text-primary">{submission.year}</span>
											<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium {getStatusColor(submission.status)}">
												<span class="w-1.5 h-1.5 rounded-full {getStatusDot(submission.status)}"></span>
												{submission.status}
											</span>
										</div>
										<p class="text-text-muted">{submission.team} vs {submission.opponent || '?'}</p>

										<!-- Metadata pills -->
										<div class="flex flex-wrap items-center gap-2 mt-3 text-xs">
											{#if submission.competition}
												<span class="inline-flex items-center gap-1 bg-surface-dim px-2.5 py-1 rounded-full text-text-muted">
													<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
														<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
														<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
														<path d="M4 22h16"/>
														<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
														<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
														<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
													</svg>
													{submission.competition}
												</span>
											{/if}
											<span class="inline-flex items-center gap-1 bg-surface-dim px-2.5 py-1 rounded-full text-text-muted">
												<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
													<line x1="16" y1="2" x2="16" y2="6"/>
													<line x1="8" y1="2" x2="8" y2="6"/>
													<line x1="3" y1="10" x2="21" y2="10"/>
												</svg>
												{formatDate(submission.createdAt)}
											</span>
										</div>
									</div>

									<button
										type="button"
										class="flex-shrink-0 w-32 h-24 rounded-xl overflow-hidden border border-border bg-surface-dim/30 hover:bg-surface-dim/50 transition-colors cursor-pointer"
										onclick={() => { selectedGoal = submission; showPreview = true; }}
									>
										<div class="w-full h-full pointer-events-none">
											<GoalAnimation
												animation={submission.animationData as AnimationData}
												autoPlay={false}
											/>
										</div>
									</button>
								</div>

								<!-- Rejection reason -->
								{#if submission.status === 'rejected' && submission.rejectionReason}
									<div class="mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
										<div class="flex items-start gap-3">
											<div class="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
												<svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
												</svg>
											</div>
											<div>
												<p class="text-sm font-medium text-red-500 mb-1">Rejection Reason</p>
												<p class="text-sm text-text-muted">{submission.rejectionReason}</p>
											</div>
										</div>
									</div>
								{/if}

								<!-- Actions -->
								{#if submission.status === 'rejected'}
									<div class="mt-4 pt-4 border-t border-border">
										<a
											href="/editor?resubmit={submission.id}"
											class="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
											</svg>
											Edit & Resubmit
										</a>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>

				<div class="mt-8 text-center">
					<a
						href="/editor"
						class="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
						Create New Goal
					</a>
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
				<div class="flex items-center gap-3">
					<div class="flex items-baseline gap-3">
						<h3 class="text-xl font-bold">{selectedGoal.scorer}</h3>
						<span class="text-lg font-bold text-primary">{selectedGoal.year}</span>
					</div>
					<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium {getStatusColor(selectedGoal.status)}">
						<span class="w-1.5 h-1.5 rounded-full {getStatusDot(selectedGoal.status)}"></span>
						{selectedGoal.status}
					</span>
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

			<!-- Rejection reason in modal -->
			{#if selectedGoal.status === 'rejected' && selectedGoal.rejectionReason}
				<div class="p-4 border-t border-border">
					<div class="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
						<div class="flex items-start gap-3">
							<div class="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
								<svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
								</svg>
							</div>
							<div>
								<p class="text-sm font-medium text-red-500 mb-1">Rejection Reason</p>
								<p class="text-sm text-text-muted">{selectedGoal.rejectionReason}</p>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Actions -->
			<div class="p-4 border-t border-border flex gap-3 justify-end">
				{#if selectedGoal.status === 'rejected'}
					<a
						href="/editor?resubmit={selectedGoal.id}"
						class="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
						Edit & Resubmit
					</a>
				{/if}
				<button
					type="button"
					onclick={() => { showPreview = false; selectedGoal = null; }}
					class="bg-surface-dim hover:bg-border border border-border font-semibold py-2.5 px-4 rounded-xl transition-colors"
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}
