<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { GoalAnimation } from '$lib/components/animation';
	import type { AnimationData } from '$lib/server/db/schema';

	let { data, form } = $props();

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
			<a href="/admin/review" class="text-text-muted hover:text-primary text-sm">&larr; Back to Review Queue</a>
			<h1 class="text-4xl font-bold mt-2">Review Goal</h1>
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
				<div class="flex items-start justify-between mb-4">
					<div>
						<h2 class="text-2xl font-bold">{data.goal.scorer}</h2>
						<p class="text-text-muted text-lg">{data.goal.team} vs {data.goal.opponent || 'Unknown'}</p>
					</div>
					<div class="text-right">
						<span class="text-3xl font-bold text-primary">{data.goal.year}</span>
						<div class="mt-1">
							<span class="px-2 py-1 rounded text-xs font-medium {data.goal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : data.goal.status === 'approved' ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-500'}">
								{data.goal.status}
							</span>
						</div>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4 text-sm">
					{#if data.goal.competition}
						<div>
							<span class="text-text-muted">Competition:</span>
							<span class="ml-2">{data.goal.competition}</span>
						</div>
					{/if}
					{#if data.goal.matchContext}
						<div>
							<span class="text-text-muted">Context:</span>
							<span class="ml-2">{data.goal.matchContext}</span>
						</div>
					{/if}
					<div>
						<span class="text-text-muted">Type:</span>
						<span class="ml-2">{data.goal.isInternational ? 'International' : 'Club'}</span>
					</div>
					{#if data.goal.submittedByUsername}
						<div>
							<span class="text-text-muted">Submitted by:</span>
							<span class="ml-2">{data.goal.submittedByUsername}</span>
						</div>
					{/if}
				</div>

				{#if data.goal.videoUrl}
					<div class="mt-4">
						<a
							href={data.goal.videoUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="text-primary hover:underline"
						>
							View reference video &rarr;
						</a>
					</div>
				{/if}
			</div>

			<!-- Animation Preview -->
			<div class="p-6 bg-background">
				<h3 class="font-semibold mb-4">Animation Preview</h3>
				<div class="rounded-lg overflow-hidden border border-border">
					<GoalAnimation
						animation={data.goal.animationData as AnimationData}
						autoPlay={true}
					/>
				</div>
			</div>

			<!-- Actions -->
			{#if data.goal.status === 'pending'}
				<div class="p-6 border-t border-border flex gap-4">
					<form method="POST" action="?/approve" use:enhance class="flex-1">
						<button
							type="submit"
							class="w-full bg-primary hover:bg-primary/80 text-background font-semibold py-3 px-4 rounded-lg transition-colors"
						>
							Approve Goal
						</button>
					</form>
					<form method="POST" action="?/reject" use:enhance class="flex-1">
						<button
							type="submit"
							class="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
						>
							Reject Goal
						</button>
					</form>
				</div>
			{:else}
				<div class="p-6 border-t border-border text-center text-text-muted">
					This goal has already been {data.goal.status}.
				</div>
			{/if}
		</div>
	</div>
</div>
