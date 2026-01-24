<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	let { data, form } = $props();

	$effect(() => {
		if (form?.success) {
			if (form.autoFilled) {
				toast.success('Game created with auto-filled slots!');
			} else {
				toast.success('Schedule updated successfully');
			}
		} else if (form?.error) {
			toast.error(form.error);
		}
	});

	let selectedDate = $state<string | null>(null);
	let selectedPosition = $state<number | null>(null);
	let editingGameId = $state<string | null>(null);
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

	function clearSelection() {
		selectedDate = null;
		selectedPosition = null;
		editingGameId = null;
	}

	function enhanceWithClear() {
		return async ({ result, update }: { result: { type: string }, update: () => Promise<void> }) => {
			if (result.type === 'success') {
				clearSelection();
			}
			await update();
		};
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
							<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
							<line x1="16" x2="16" y1="2" y2="6"/>
							<line x1="8" x2="8" y1="2" y2="6"/>
							<line x1="3" x2="21" y1="10" y2="10"/>
						</svg>
					</div>
					<div>
						<h1 class="text-3xl md:text-4xl font-bold">Schedule Daily Games</h1>
						<p class="text-text-muted mt-1">Queue goals for upcoming daily games</p>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<!-- Schedule Calendar -->
				<div class="lg:col-span-2">
					<div class="flex items-center gap-2 mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
							<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
							<line x1="16" x2="16" y1="2" y2="6"/>
							<line x1="8" x2="8" y1="2" y2="6"/>
							<line x1="3" x2="21" y1="10" y2="10"/>
						</svg>
						<h2 class="text-xl font-semibold">Upcoming 14 Days</h2>
					</div>
					<div class="space-y-4">
						{#each data.schedule as day}
							<div
								class="bg-surface border rounded-xl p-5 shadow-sm transition-all hover:shadow-md {day.isToday ? 'border-primary ring-2 ring-primary/10' : 'border-border'}"
							>
								<div class="flex items-center justify-between mb-4">
									<div>
										<div class="flex items-center gap-2">
											<span class="font-semibold text-lg {day.isToday ? 'text-primary' : ''}">
												{formatDate(day.date)}
											</span>
											{#if day.isToday}
												<span class="text-xs bg-primary text-white px-2.5 py-1 rounded-full font-medium">Today</span>
											{/if}
											{#if day.hasGame}
												{#if day.isToday}
													<span class="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
														<span class="relative flex h-2 w-2">
															<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
															<span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
														</span>
														Live
													</span>
												{:else}
													<span class="text-xs bg-blue-500/10 text-blue-600 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
														<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
															<path d="M12 20h9"/>
															<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
														</svg>
														Editable
													</span>
												{/if}
											{/if}
										</div>
										<div class="text-text-muted text-sm mt-1">
											{#if day.hasGame && day.isToday}
												Game is live
											{:else if day.hasGame}
												Scheduled - click slots to edit
											{:else}
												{day.slots.filter(Boolean).length}/3 slots filled
											{/if}
										</div>
									</div>
									{#if !day.hasGame}
										<form method="POST" action="?/createDailyGame" use:enhance>
											<input type="hidden" name="date" value={day.date} />
											<button
												type="submit"
												class="bg-primary hover:bg-primary-hover text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2"
											>
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<polygon points="5 3 19 12 5 21 5 3"/>
												</svg>
												{day.slots.filter(Boolean).length === 3 ? 'Create Game' : 'Create & Auto-fill'}
											</button>
										</form>
									{:else if !day.isToday && day.slots.filter(Boolean).length < 3}
										<form method="POST" action="?/autoFillGame" use:enhance>
											<input type="hidden" name="gameId" value={day.gameId} />
											<input type="hidden" name="date" value={day.date} />
											<button
												type="submit"
												class="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2"
											>
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
													<path d="m9 12 2 2 4-4"/>
												</svg>
												Auto-fill Empty Slots
											</button>
										</form>
									{/if}
								</div>

								<div class="grid grid-cols-3 gap-3">
									{#each [1, 2, 3] as position}
										{@const slotGoalId = day.slots[position - 1]}
										{@const goalInfo = getGoalInfo(slotGoalId)}
										{@const queueEntry = day.queuedGoals.find((q) => q.position === position)}
										{@const canEdit = !day.isToday}

										<div class="border rounded-xl p-4 text-center min-h-[100px] flex flex-col justify-center transition-all {slotGoalId ? 'bg-primary/5 border-primary/20' : 'bg-surface-dim/50 border-border hover:border-primary/30'}">
											{#if goalInfo}
												<div class="text-sm font-semibold truncate">{goalInfo.scorer}</div>
												<div class="text-xs text-text-muted truncate mt-1">{goalInfo.team}</div>
												<div class="text-xs text-primary font-medium mt-1">{goalInfo.year}</div>
												{#if queueEntry && !day.hasGame}
													<form method="POST" action="?/removeFromQueue" use:enhance={enhanceWithClear} class="mt-2">
														<input type="hidden" name="queueId" value={queueEntry.id} />
														<button type="submit" class="text-xs text-red-500 hover:text-red-600 font-medium transition-colors">
															Remove
														</button>
													</form>
												{:else if day.hasGame && canEdit}
													<div class="mt-2 flex items-center justify-center gap-2">
														<button
															type="button"
															class="text-xs text-primary hover:text-primary-hover font-medium transition-colors"
															onclick={() => {
																selectedDate = day.date;
																selectedPosition = position;
																editingGameId = day.gameId ?? null;
															}}
														>
															Change
														</button>
														<form method="POST" action="?/removeGameSlot" use:enhance={enhanceWithClear} class="inline">
															<input type="hidden" name="gameId" value={day.gameId} />
															<input type="hidden" name="position" value={position} />
															<input type="hidden" name="date" value={day.date} />
															<button type="submit" class="text-xs text-red-500 hover:text-red-600 font-medium transition-colors">
																Remove
															</button>
														</form>
													</div>
												{/if}
											{:else if !day.hasGame}
												<button
													type="button"
													class="text-text-muted hover:text-primary text-sm transition-colors flex flex-col items-center gap-1"
													onclick={() => {
														selectedDate = day.date;
														selectedPosition = position;
														editingGameId = null;
													}}
												>
													<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
														<circle cx="12" cy="12" r="10"/>
														<path d="M12 8v8M8 12h8"/>
													</svg>
													<span>Round {position}</span>
												</button>
											{:else if day.hasGame && canEdit}
												<button
													type="button"
													class="text-text-muted hover:text-primary text-sm transition-colors flex flex-col items-center gap-1"
													onclick={() => {
														selectedDate = day.date;
														selectedPosition = position;
														editingGameId = day.gameId ?? null;
													}}
												>
													<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
														<circle cx="12" cy="12" r="10"/>
														<path d="M12 8v8M8 12h8"/>
													</svg>
													<span>Add Round {position}</span>
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
					<div class="flex items-center gap-2 mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
							<circle cx="12" cy="12" r="10"/>
							<polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
						</svg>
						<h2 class="text-xl font-semibold">Available Goals</h2>
					</div>
					<div class="bg-surface border border-border rounded-xl p-4 shadow-sm sticky top-20">
						<!-- Search -->
						<div class="relative mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
								<circle cx="11" cy="11" r="8"/>
								<path d="m21 21-4.3-4.3"/>
							</svg>
							<input
								type="text"
								bind:value={searchQuery}
								placeholder="Search goals..."
								class="w-full bg-surface-dim border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
							/>
						</div>

						<div class="text-text-muted text-sm mb-3 flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="20 6 9 17 4 12"/>
							</svg>
							{data.availableGoals.length} approved goals
						</div>

						{#if selectedDate && selectedPosition}
							<div class="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
								<div class="text-sm font-medium text-primary flex items-center gap-2">
									{#if editingGameId}
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<path d="M12 20h9"/>
											<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
										</svg>
										Editing {formatDate(selectedDate)} - Round {selectedPosition}
									{:else}
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<circle cx="12" cy="12" r="10"/>
											<path d="M12 8v8M8 12h8"/>
										</svg>
										Adding to {formatDate(selectedDate)} - Round {selectedPosition}
									{/if}
								</div>
								<button
									type="button"
									class="text-xs text-primary/70 hover:text-primary mt-1 transition-colors"
									onclick={() => {
										selectedDate = null;
										selectedPosition = null;
										editingGameId = null;
									}}
								>
									Cancel selection
								</button>
							</div>
						{/if}

						<div class="space-y-2 max-h-[600px] overflow-y-auto pr-1">
							{#each filteredGoals as goal}
								<div class="border border-border rounded-xl p-3 hover:border-primary/30 transition-all {goal.recentlyUsed ? 'opacity-50' : 'hover:shadow-sm'}">
									<div class="flex items-start justify-between gap-2">
										<div class="min-w-0 flex-1">
											<div class="font-medium truncate">{goal.scorer}</div>
											<div class="text-text-muted text-sm truncate">{goal.team}</div>
											<div class="flex items-center gap-2 mt-1">
												<span class="text-primary text-sm font-semibold">{goal.year}</span>
												{#if goal.competition}
													<span class="text-text-muted text-xs truncate">- {goal.competition}</span>
												{/if}
											</div>
										</div>
										{#if goal.recentlyUsed}
											<span class="text-xs text-yellow-600 bg-yellow-500/10 px-2 py-1 rounded-full shrink-0 flex items-center gap-1">
												<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<circle cx="12" cy="12" r="10"/>
													<path d="M12 6v6l4 2"/>
												</svg>
												Recent
											</span>
										{/if}
									</div>

									{#if selectedDate && selectedPosition}
										<form method="POST" action={editingGameId ? "?/updateGameSlot" : "?/scheduleGoal"} use:enhance={enhanceWithClear} class="mt-3">
											<input type="hidden" name="goalId" value={goal.id} />
											<input type="hidden" name="date" value={selectedDate} />
											<input type="hidden" name="position" value={selectedPosition} />
											{#if editingGameId}
												<input type="hidden" name="gameId" value={editingGameId} />
											{/if}
											<button
												type="submit"
												class="w-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5"
											>
												{#if editingGameId}
													<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
														<path d="M12 20h9"/>
														<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
													</svg>
													Update slot
												{:else}
													<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
														<path d="M12 5v14M5 12h14"/>
													</svg>
													Add to schedule
												{/if}
											</button>
										</form>
									{/if}
								</div>
							{/each}

							{#if filteredGoals.length === 0}
								<div class="text-center py-8">
									<div class="w-12 h-12 rounded-xl bg-surface-dim flex items-center justify-center mx-auto mb-3">
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
											<circle cx="11" cy="11" r="8"/>
											<path d="m21 21-4.3-4.3"/>
										</svg>
									</div>
									<p class="text-text-muted">
										{searchQuery ? 'No goals match your search' : 'No approved goals available'}
									</p>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
