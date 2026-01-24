<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let selectedDate = $state<string | null>(null);
	let selectedPosition = $state<number | null>(null);
	let searchQuery = $state('');

	const filteredGoals = $derived(
		data.availableGoals.filter((goal) => {
			const query = searchQuery.toLowerCase();
			return (
				goal.team.toLowerCase().includes(query) ||
				goal.scorer.toLowerCase().includes(query) ||
				goal.year.toString().includes(query) ||
				(goal.competition?.toLowerCase().includes(query) ?? false)
			);
		})
	);

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr + 'T00:00:00');
		return date.toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		});
	}

	function getGoalInfo(goalId: string | null) {
		if (!goalId) return null;
		return data.availableGoals.find((g) => g.id === goalId);
	}
</script>

<div class="min-h-screen p-8">
	<div class="max-w-6xl mx-auto">
		<div class="mb-8">
			<a href="/admin" class="text-text-muted hover:text-primary text-sm">&larr; Back to Admin</a>
			<h1 class="text-4xl font-bold mt-2">Schedule Daily Games</h1>
			<p class="text-text-muted mt-2">Queue goals for upcoming daily games</p>
		</div>

		{#if form?.success}
			<div class="bg-primary/20 border border-primary text-primary p-4 rounded-lg mb-6">
				{form.autoFilled ? 'Daily game created with auto-filled slots!' : 'Schedule updated successfully!'}
			</div>
		{/if}

		{#if form?.error}
			<div class="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
				{form.error}
			</div>
		{/if}

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Schedule Calendar -->
			<div class="lg:col-span-2">
				<h2 class="text-xl font-semibold mb-4">Upcoming 14 Days</h2>
				<div class="space-y-4">
					{#each data.schedule as day}
						<div
							class="bg-surface border rounded-xl p-4 {day.isToday ? 'border-primary' : 'border-border'}"
						>
							<div class="flex items-center justify-between mb-4">
								<div>
									<div class="font-semibold {day.isToday ? 'text-primary' : ''}">
										{formatDate(day.date)}
										{#if day.isToday}
											<span class="text-xs bg-primary text-background px-2 py-0.5 rounded ml-2">Today</span>
										{/if}
									</div>
									<div class="text-text-muted text-sm">
										{day.hasGame ? 'Game set' : day.slots.filter(Boolean).length + '/3 slots filled'}
									</div>
								</div>
								{#if !day.hasGame}
									<form method="POST" action="?/createDailyGame" use:enhance>
										<input type="hidden" name="date" value={day.date} />
										<button
											type="submit"
											class="bg-primary hover:bg-primary/80 text-background text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
										>
											{day.slots.filter(Boolean).length === 3 ? 'Create Game' : 'Create & Auto-fill'}
										</button>
									</form>
								{/if}
							</div>

							<div class="grid grid-cols-3 gap-2">
								{#each [1, 2, 3] as position}
									{@const slotGoalId = day.slots[position - 1]}
									{@const goalInfo = getGoalInfo(slotGoalId)}
									{@const queueEntry = day.queuedGoals.find((q) => q.position === position)}

									<div class="border border-border rounded-lg p-3 text-center min-h-[80px] flex flex-col justify-center {slotGoalId ? 'bg-primary/10' : 'bg-background'}">
										{#if goalInfo}
											<div class="text-sm font-medium truncate">{goalInfo.scorer}</div>
											<div class="text-xs text-text-muted truncate">{goalInfo.team} ({goalInfo.year})</div>
											{#if queueEntry && !day.hasGame}
												<form method="POST" action="?/removeFromQueue" use:enhance class="mt-2">
													<input type="hidden" name="queueId" value={queueEntry.id} />
													<button type="submit" class="text-xs text-red-500 hover:underline">
														Remove
													</button>
												</form>
											{/if}
										{:else if !day.hasGame}
											<button
												type="button"
												class="text-text-muted hover:text-primary text-sm"
												onclick={() => {
													selectedDate = day.date;
													selectedPosition = position;
												}}
											>
												+ Add Round {position}
											</button>
										{:else}
											<span class="text-text-muted text-sm">Empty</span>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Available Goals -->
			<div>
				<h2 class="text-xl font-semibold mb-4">Available Goals</h2>
				<div class="bg-surface border border-border rounded-xl p-4">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search goals..."
						class="w-full bg-background border border-border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-primary"
					/>

					<div class="text-text-muted text-sm mb-4">
						{data.availableGoals.length} approved goals
					</div>

					<div class="space-y-2 max-h-[600px] overflow-y-auto">
						{#each filteredGoals as goal}
							<div class="border border-border rounded-lg p-3 hover:border-primary transition-colors {goal.recentlyUsed ? 'opacity-50' : ''}">
								<div class="flex items-start justify-between">
									<div class="min-w-0 flex-1">
										<div class="font-medium truncate">{goal.scorer}</div>
										<div class="text-text-muted text-sm truncate">{goal.team} ({goal.year})</div>
										{#if goal.competition}
											<div class="text-text-muted text-xs truncate">{goal.competition}</div>
										{/if}
									</div>
									{#if goal.recentlyUsed}
										<span class="text-xs text-yellow-500 ml-2 shrink-0">Recently used</span>
									{/if}
								</div>

								{#if selectedDate && selectedPosition}
									<form method="POST" action="?/scheduleGoal" use:enhance class="mt-2">
										<input type="hidden" name="goalId" value={goal.id} />
										<input type="hidden" name="date" value={selectedDate} />
										<input type="hidden" name="position" value={selectedPosition} />
										<button
											type="submit"
											class="w-full bg-primary hover:bg-primary/80 text-background text-xs font-semibold py-1.5 px-3 rounded transition-colors"
										>
											Add to {formatDate(selectedDate)} - Round {selectedPosition}
										</button>
									</form>
								{/if}
							</div>
						{/each}

						{#if filteredGoals.length === 0}
							<div class="text-center text-text-muted py-8">
								{searchQuery ? 'No goals match your search' : 'No approved goals available'}
							</div>
						{/if}
					</div>
				</div>

				{#if selectedDate && selectedPosition}
					<button
						type="button"
						class="mt-4 w-full text-center text-text-muted hover:text-primary text-sm"
						onclick={() => {
							selectedDate = null;
							selectedPosition = null;
						}}
					>
						Cancel selection
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>
