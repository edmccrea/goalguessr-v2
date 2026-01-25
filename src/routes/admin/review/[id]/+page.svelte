<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { GoalAnimation } from '$lib/components/animation';
	import type { AnimationData } from '$lib/server/db/schema';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	let { data, form } = $props();
	let processingAction = $state<'approve' | 'reject' | null>(null);

	$effect(() => {
		if (form?.success) {
			// Redirect back to review list after action
			setTimeout(() => goto('/admin/review'), 1000);
		}
	});
</script>

<div class="min-h-screen p-8">
	<div class="max-w-4xl mx-auto">
		<div class="mb-8">
			<a href="/admin/review" class="group inline-flex items-center gap-1.5 text-text-muted hover:text-primary text-sm mb-2 transition-colors">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:-translate-x-1">
					<path d="M19 12H5M12 19l-7-7 7-7"/>
				</svg>
				Back to Review Queue
			</a>
			<div class="flex items-center gap-3 mt-2">
				<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
						<path d="M12 20h9"/>
						<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
					</svg>
				</div>
				<h1 class="text-3xl font-bold">Review Goal</h1>
			</div>
		</div>

		{#if form?.success}
			<div class="bg-primary/20 border border-primary text-primary p-4 rounded-lg mb-6">
				Goal {form.action} successfully! Redirecting...
			</div>
		{/if}

		{#if form?.error}
			<div class="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
				{form.error}
			</div>
		{/if}

		<div class="bg-surface border border-border rounded-xl overflow-hidden">
			<!-- Goal Info -->
			<div class="p-6 border-b border-border">
				<div class="flex items-start justify-between mb-6">
					<div>
						<div class="flex items-center gap-3 mb-2">
							<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
									<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
									<circle cx="12" cy="7" r="4"/>
								</svg>
							</div>
							<div>
								<h2 class="text-2xl font-bold">{data.goal.scorer}</h2>
								<p class="text-text-muted">{data.goal.team} vs {data.goal.opponent || 'Unknown'}</p>
							</div>
						</div>
					</div>
					<div class="text-right">
						<span class="text-3xl font-bold text-primary">{data.goal.year}</span>
						<div class="mt-2">
							<span class="px-3 py-1.5 rounded-lg text-xs font-medium {data.goal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : data.goal.status === 'approved' ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-500'}">
								{data.goal.status}
							</span>
						</div>
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{#if data.goal.competition}
						<div class="flex items-center gap-3 p-3 bg-background rounded-xl">
							<div class="w-8 h-8 rounded-lg bg-surface flex items-center justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
									<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
									<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
									<path d="M4 22h16"/>
									<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
									<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
									<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
								</svg>
							</div>
							<div>
								<p class="text-xs text-text-muted">Competition</p>
								<p class="font-medium">{data.goal.competition}</p>
							</div>
						</div>
					{/if}
					{#if data.goal.matchContext}
						<div class="flex items-center gap-3 p-3 bg-background rounded-xl">
							<div class="w-8 h-8 rounded-lg bg-surface flex items-center justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
									<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
								</svg>
							</div>
							<div>
								<p class="text-xs text-text-muted">Match Context</p>
								<p class="font-medium">{data.goal.matchContext}</p>
							</div>
						</div>
					{/if}
					<div class="flex items-center gap-3 p-3 bg-background rounded-xl">
						<div class="w-8 h-8 rounded-lg bg-surface flex items-center justify-center">
							{#if data.goal.isInternational}
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
									<circle cx="12" cy="12" r="10"/>
									<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
									<path d="M2 12h20"/>
								</svg>
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
									<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
									<line x1="4" y1="22" x2="4" y2="15"/>
								</svg>
							{/if}
						</div>
						<div>
							<p class="text-xs text-text-muted">Type</p>
							<p class="font-medium">{data.goal.isInternational ? 'International' : 'Club'}</p>
						</div>
					</div>
					{#if data.goal.submittedByUsername}
						<div class="flex items-center gap-3 p-3 bg-background rounded-xl">
							<div class="w-8 h-8 rounded-lg bg-surface flex items-center justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
									<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
									<circle cx="12" cy="7" r="4"/>
								</svg>
							</div>
							<div>
								<p class="text-xs text-text-muted">Submitted by</p>
								<p class="font-medium">{data.goal.submittedByUsername}</p>
							</div>
						</div>
					{/if}
				</div>

				{#if data.goal.videoUrl}
					<div class="mt-4">
						<a
							href={data.goal.videoUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl hover:bg-primary/20 transition-colors font-medium"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="m22 8-6 4 6 4V8Z"/>
								<rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
							</svg>
							View reference video
						</a>
					</div>
				{/if}
			</div>

			<!-- Animation Preview -->
			<div class="p-6 bg-background">
				<div class="flex items-center gap-2 mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
						<polygon points="5 3 19 12 5 21 5 3"/>
					</svg>
					<h3 class="font-semibold">Animation Preview</h3>
				</div>
				<div class="rounded-xl overflow-hidden border border-border">
					<GoalAnimation
						animation={data.goal.animationData as AnimationData}
						autoPlay={true}
					/>
				</div>
			</div>

			<!-- Actions -->
			{#if data.goal.status === 'pending'}
				<div class="p-6 border-t border-border flex gap-4">
					<form method="POST" action="?/approve" use:enhance={() => {
						processingAction = 'approve';
						return async ({ update }) => {
							processingAction = null;
							await update();
						};
					}} class="flex-1">
						<button
							type="submit"
							disabled={processingAction !== null}
							class="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/70 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
						>
							{#if processingAction === 'approve'}
								<Spinner size="md" />
								Approving...
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="20 6 9 17 4 12"/>
								</svg>
								Approve Goal
							{/if}
						</button>
					</form>
					<form method="POST" action="?/reject" use:enhance={() => {
						processingAction = 'reject';
						return async ({ update }) => {
							processingAction = null;
							await update();
						};
					}} class="flex-1">
						<button
							type="submit"
							disabled={processingAction !== null}
							class="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/70 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
						>
							{#if processingAction === 'reject'}
								<Spinner size="md" />
								Rejecting...
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
									<line x1="18" y1="6" x2="6" y2="18"/>
									<line x1="6" y1="6" x2="18" y2="18"/>
								</svg>
								Reject Goal
							{/if}
						</button>
					</form>
				</div>
			{:else}
				<div class="p-6 border-t border-border text-center text-text-muted">
					<div class="flex items-center justify-center gap-2">
						{#if data.goal.status === 'approved'}
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
								<polyline points="20 6 9 17 4 12"/>
							</svg>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500">
								<line x1="18" y1="6" x2="6" y2="18"/>
								<line x1="6" y1="6" x2="18" y2="18"/>
							</svg>
						{/if}
						This goal has already been {data.goal.status}.
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
