<script lang="ts">
	import type { PageData } from './$types';
	import { fly, fade, scale } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';
	import Skeleton from '$lib/components/ui/Skeleton.svelte';

	let { data }: { data: PageData } = $props();
	let activeTab = $state<'daily' | 'alltime'>('daily');
</script>

<svelte:head>
	<title>Leaderboard | Top Bins Daily</title>
	<meta name="description" content="See who tops the leaderboard on Top Bins Daily. Compare scores and compete with football fans worldwide." />
	<meta property="og:title" content="Leaderboard | Top Bins Daily" />
	<meta property="og:description" content="See who tops the leaderboard on Top Bins Daily. Compare scores and compete with football fans worldwide." />
	<meta name="twitter:title" content="Leaderboard | Top Bins Daily" />
	<meta name="twitter:description" content="See who tops the leaderboard on Top Bins Daily. Compare scores and compete with football fans worldwide." />
</svelte:head>

<div class="relative min-h-screen overflow-hidden">
	<!-- Animated background elements -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div
			class="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
		></div>
		<div
			class="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
			style="animation-delay: 1s"
		></div>
	</div>

	<div class="relative z-10 py-12 px-6">
		<div class="max-w-4xl mx-auto">
			<!-- Header -->
			<div class="mb-10" in:fly={{ y: -20, duration: 500, easing: cubicOut }}>
				<a
					href="/"
					class="inline-flex items-center gap-2 text-text-muted hover:text-primary text-sm font-medium transition-colors mb-4 group"
				>
					<svg
						class="w-4 h-4 transition-transform group-hover:-translate-x-1"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
					Back to Home
				</a>
				<div class="flex items-center gap-4">
					<div
						class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg shadow-primary/25"
					>
						<svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
							/>
						</svg>
					</div>
					<div>
						<h1 class="text-3xl sm:text-4xl font-bold">Leaderboard</h1>
						<p class="text-text-muted mt-1">See how you stack up against other players</p>
					</div>
				</div>
			</div>

			<!-- Tab Switcher -->
			<div
				class="mb-8"
				in:fly={{ y: 20, duration: 500, delay: 100, easing: cubicOut }}
			>
				<div
					class="inline-flex rounded-xl overflow-hidden border border-border bg-surface shadow-sm p-1"
				>
					<button
						onclick={() => (activeTab = 'daily')}
						class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all {activeTab ===
						'daily'
							? 'bg-primary text-white shadow-sm'
							: 'text-text-muted hover:text-text hover:bg-surface-dim'}"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
						Today
					</button>
					<button
						onclick={() => (activeTab = 'alltime')}
						class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all {activeTab ===
						'alltime'
							? 'bg-primary text-white shadow-sm'
							: 'text-text-muted hover:text-text hover:bg-surface-dim'}"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
							/>
						</svg>
						All Time
					</button>
				</div>
			</div>

			<!-- Daily Leaderboard -->
			{#if activeTab === 'daily'}
				<div
					class="bg-surface border border-border rounded-2xl overflow-hidden shadow-lg"
					in:fly={{ y: 20, duration: 500, delay: 200, easing: cubicOut }}
				>
					{#await data.dailyLeaderboard}
						<!-- Skeleton loading state -->
						<div class="px-6 py-4 bg-surface-dim border-b border-border">
							<div class="flex items-center justify-between">
								<div>
									<span
										class="inline-flex items-center gap-2 text-primary font-medium text-xs uppercase tracking-wide"
									>
										<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										Daily Challenge
									</span>
									<p class="text-sm text-text-muted mt-1">Scores for {data.todayDate}</p>
								</div>
								<Skeleton class="h-6 w-20 rounded-full" />
							</div>
						</div>
						<div class="hidden sm:block">
							<table class="w-full">
								<thead class="bg-surface-dim/50">
									<tr>
										<th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide">Rank</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide">Player</th>
										<th class="px-6 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wide">R1</th>
										<th class="px-6 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wide">R2</th>
										<th class="px-6 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wide">R3</th>
										<th class="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wide">Total</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-border">
									{#each [0, 1, 2, 3, 4] as i}
										<tr>
											<td class="px-6 py-4"><Skeleton class="w-8 h-8 rounded-lg" /></td>
											<td class="px-6 py-4"><Skeleton class="h-5 w-32 rounded" /></td>
											<td class="px-6 py-4 text-center"><Skeleton class="h-5 w-8 mx-auto rounded" /></td>
											<td class="px-6 py-4 text-center"><Skeleton class="h-5 w-8 mx-auto rounded" /></td>
											<td class="px-6 py-4 text-center"><Skeleton class="h-5 w-8 mx-auto rounded" /></td>
											<td class="px-6 py-4 text-right"><Skeleton class="h-6 w-12 ml-auto rounded" /></td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						<!-- Mobile skeleton -->
						<div class="sm:hidden divide-y divide-border">
							{#each [0, 1, 2, 3, 4] as i}
								<div class="p-4">
									<div class="flex items-center gap-3">
										<Skeleton class="w-10 h-10 rounded-xl" />
										<div class="flex-1">
											<Skeleton class="h-5 w-24 mb-1 rounded" />
											<Skeleton class="h-3 w-16 rounded" />
										</div>
										<div class="text-right">
											<Skeleton class="h-6 w-12 mb-1 rounded" />
											<Skeleton class="h-3 w-10 rounded" />
										</div>
									</div>
								</div>
							{/each}
						</div>
					{:then dailyLeaderboard}
						<div class="px-6 py-4 bg-surface-dim border-b border-border">
							<div class="flex items-center justify-between">
								<div>
									<span
										class="inline-flex items-center gap-2 text-primary font-medium text-xs uppercase tracking-wide"
									>
										<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										Daily Challenge
									</span>
									<p class="text-sm text-text-muted mt-1">Scores for {data.todayDate}</p>
								</div>
								<div
									class="text-xs text-text-muted bg-surface px-3 py-1.5 rounded-full border border-border"
								>
									{dailyLeaderboard.length} player{dailyLeaderboard.length !== 1
										? 's'
										: ''}
								</div>
							</div>
						</div>

					{#if dailyLeaderboard.length === 0}
						<div class="px-6 py-16 text-center">
							<div
								class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-dim flex items-center justify-center"
							>
								<svg
									class="w-8 h-8 text-text-muted"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<p class="text-text-muted font-medium">No scores yet today</p>
							<p class="text-sm text-text-muted mt-1">Be the first to play!</p>
							<a
								href="/play"
								class="inline-flex items-center gap-2 mt-6 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
							>
								Play Now
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 7l5 5m0 0l-5 5m5-5H6"
									/>
								</svg>
							</a>
						</div>
					{:else}
						<!-- Desktop Table -->
						<div class="hidden sm:block">
							<table class="w-full">
								<thead class="bg-surface-dim/50">
									<tr>
										<th
											class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide"
											>Rank</th
										>
										<th
											class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide"
											>Player</th
										>
										<th
											class="px-6 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wide"
											>R1</th
										>
										<th
											class="px-6 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wide"
											>R2</th
										>
										<th
											class="px-6 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wide"
											>R3</th
										>
										<th
											class="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wide"
											>Total</th
										>
									</tr>
								</thead>
								<tbody class="divide-y divide-border">
									{#each dailyLeaderboard as entry, idx}
										<tr
											class="hover:bg-surface-dim/50 transition-colors"
											in:fly={{ y: 10, duration: 300, delay: 250 + idx * 50, easing: cubicOut }}
										>
											<td class="px-6 py-4">
												{#if entry.rank === 1}
													<div
														class="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-sm"
													>
														<svg
															class="w-4 h-4 text-white"
															fill="currentColor"
															viewBox="0 0 20 20"
														>
															<path
																d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
															/>
														</svg>
													</div>
												{:else if entry.rank === 2}
													<div
														class="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-sm"
													>
														<span class="text-sm font-bold text-white">2</span>
													</div>
												{:else if entry.rank === 3}
													<div
														class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-sm"
													>
														<span class="text-sm font-bold text-white">3</span>
													</div>
												{:else}
													<div
														class="w-8 h-8 rounded-lg bg-surface-dim flex items-center justify-center"
													>
														<span class="text-sm font-medium text-text-muted">{entry.rank}</span>
													</div>
												{/if}
											</td>
											<td class="px-6 py-4">
												<span class="font-semibold">{entry.username}</span>
											</td>
											<td class="px-6 py-4 text-center">
												<span class="text-text-muted tabular-nums">{entry.round1Score}</span>
											</td>
											<td class="px-6 py-4 text-center">
												<span class="text-text-muted tabular-nums">{entry.round2Score}</span>
											</td>
											<td class="px-6 py-4 text-center">
												<span class="text-text-muted tabular-nums">{entry.round3Score}</span>
											</td>
											<td class="px-6 py-4 text-right">
												<span class="font-bold text-primary text-lg tabular-nums"
													>{entry.totalScore}</span
												>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>

						<!-- Mobile Cards -->
						<div class="sm:hidden divide-y divide-border">
							{#each dailyLeaderboard as entry, idx}
								<div
									class="p-4 hover:bg-surface-dim/50 transition-colors"
									in:fly={{ y: 10, duration: 300, delay: 250 + idx * 50, easing: cubicOut }}
								>
									<div class="flex items-center gap-3">
										{#if entry.rank === 1}
											<div
												class="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-sm"
											>
												<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
													<path
														d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
													/>
												</svg>
											</div>
										{:else if entry.rank === 2}
											<div
												class="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-sm"
											>
												<span class="font-bold text-white">2</span>
											</div>
										{:else if entry.rank === 3}
											<div
												class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-sm"
											>
												<span class="font-bold text-white">3</span>
											</div>
										{:else}
											<div
												class="w-10 h-10 rounded-xl bg-surface-dim flex items-center justify-center"
											>
												<span class="font-medium text-text-muted">{entry.rank}</span>
											</div>
										{/if}
										<div class="flex-1 min-w-0">
											<div class="font-semibold truncate">{entry.username}</div>
											<div class="text-xs text-text-muted">
												{entry.round1Score} + {entry.round2Score} + {entry.round3Score}
											</div>
										</div>
										<div class="text-right">
											<div class="text-xl font-bold text-primary tabular-nums">
												{entry.totalScore}
											</div>
											<div class="text-xs text-text-muted">points</div>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
					{/await}
				</div>
			{:else}
				<!-- All Time Leaderboard -->
				<div
					class="bg-surface border border-border rounded-2xl overflow-hidden shadow-lg"
					in:fly={{ y: 20, duration: 500, delay: 200, easing: cubicOut }}
				>
					{#await data.allTimeLeaderboard}
						<!-- Skeleton loading state -->
						<div class="px-6 py-4 bg-surface-dim border-b border-border">
							<div class="flex items-center justify-between">
								<div>
									<span
										class="inline-flex items-center gap-2 text-primary font-medium text-xs uppercase tracking-wide"
									>
										<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
											/>
										</svg>
										All Time Rankings
									</span>
									<p class="text-sm text-text-muted mt-1">Registered players only</p>
								</div>
								<Skeleton class="h-6 w-20 rounded-full" />
							</div>
						</div>
						<div class="hidden sm:block">
							<table class="w-full">
								<thead class="bg-surface-dim/50">
									<tr>
										<th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide">Rank</th>
										<th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide">Player</th>
										<th class="px-6 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wide">Games</th>
										<th class="px-6 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wide">Avg</th>
										<th class="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wide">Total</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-border">
									{#each [0, 1, 2, 3, 4] as i}
										<tr>
											<td class="px-6 py-4"><Skeleton class="w-8 h-8 rounded-lg" /></td>
											<td class="px-6 py-4"><Skeleton class="h-5 w-32 rounded" /></td>
											<td class="px-6 py-4 text-center"><Skeleton class="h-6 w-12 mx-auto rounded-full" /></td>
											<td class="px-6 py-4 text-center"><Skeleton class="h-5 w-10 mx-auto rounded" /></td>
											<td class="px-6 py-4 text-right"><Skeleton class="h-6 w-14 ml-auto rounded" /></td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						<!-- Mobile skeleton -->
						<div class="sm:hidden divide-y divide-border">
							{#each [0, 1, 2, 3, 4] as i}
								<div class="p-4">
									<div class="flex items-center gap-3">
										<Skeleton class="w-10 h-10 rounded-xl" />
										<div class="flex-1">
											<Skeleton class="h-5 w-24 mb-1 rounded" />
											<Skeleton class="h-3 w-20 rounded" />
										</div>
										<div class="text-right">
											<Skeleton class="h-6 w-12 mb-1 rounded" />
											<Skeleton class="h-3 w-10 rounded" />
										</div>
									</div>
								</div>
							{/each}
						</div>
					{:then allTimeLeaderboard}
						<div class="px-6 py-4 bg-surface-dim border-b border-border">
							<div class="flex items-center justify-between">
								<div>
									<span
										class="inline-flex items-center gap-2 text-primary font-medium text-xs uppercase tracking-wide"
									>
										<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
											/>
										</svg>
										All Time Rankings
									</span>
									<p class="text-sm text-text-muted mt-1">Registered players only</p>
								</div>
								<div
									class="text-xs text-text-muted bg-surface px-3 py-1.5 rounded-full border border-border"
								>
									{allTimeLeaderboard.length} player{allTimeLeaderboard.length !== 1
										? 's'
										: ''}
								</div>
							</div>
						</div>

					{#if allTimeLeaderboard.length === 0}
						<div class="px-6 py-16 text-center">
							<div
								class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-dim flex items-center justify-center"
							>
								<svg
									class="w-8 h-8 text-text-muted"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
							</div>
							<p class="text-text-muted font-medium">No registered players yet</p>
							<p class="text-sm text-text-muted mt-1">
								Create an account to appear on the all-time leaderboard
							</p>
							<a
								href="/auth/register"
								class="inline-flex items-center gap-2 mt-6 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
							>
								Register Now
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 7l5 5m0 0l-5 5m5-5H6"
									/>
								</svg>
							</a>
						</div>
					{:else}
						<!-- Desktop Table -->
						<div class="hidden sm:block">
							<table class="w-full">
								<thead class="bg-surface-dim/50">
									<tr>
										<th
											class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide"
											>Rank</th
										>
										<th
											class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide"
											>Player</th
										>
										<th
											class="px-6 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wide"
											>Games</th
										>
										<th
											class="px-6 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wide"
											>Avg</th
										>
										<th
											class="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wide"
											>Total</th
										>
									</tr>
								</thead>
								<tbody class="divide-y divide-border">
									{#each allTimeLeaderboard as entry, idx}
										<tr
											class="hover:bg-surface-dim/50 transition-colors"
											in:fly={{ y: 10, duration: 300, delay: 250 + idx * 50, easing: cubicOut }}
										>
											<td class="px-6 py-4">
												{#if entry.rank === 1}
													<div
														class="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-sm"
													>
														<svg
															class="w-4 h-4 text-white"
															fill="currentColor"
															viewBox="0 0 20 20"
														>
															<path
																d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
															/>
														</svg>
													</div>
												{:else if entry.rank === 2}
													<div
														class="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-sm"
													>
														<span class="text-sm font-bold text-white">2</span>
													</div>
												{:else if entry.rank === 3}
													<div
														class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-sm"
													>
														<span class="text-sm font-bold text-white">3</span>
													</div>
												{:else}
													<div
														class="w-8 h-8 rounded-lg bg-surface-dim flex items-center justify-center"
													>
														<span class="text-sm font-medium text-text-muted">{entry.rank}</span>
													</div>
												{/if}
											</td>
											<td class="px-6 py-4">
												<span class="font-semibold">{entry.username}</span>
											</td>
											<td class="px-6 py-4 text-center">
												<span
													class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-dim text-sm text-text-muted"
												>
													<svg
														class="w-3.5 h-3.5"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
														/>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
														/>
													</svg>
													{entry.gamesPlayed}
												</span>
											</td>
											<td class="px-6 py-4 text-center">
												<span class="text-text-muted tabular-nums">{entry.averageScore}</span>
											</td>
											<td class="px-6 py-4 text-right">
												<span class="font-bold text-primary text-lg tabular-nums"
													>{entry.totalScore}</span
												>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>

						<!-- Mobile Cards -->
						<div class="sm:hidden divide-y divide-border">
							{#each allTimeLeaderboard as entry, idx}
								<div
									class="p-4 hover:bg-surface-dim/50 transition-colors"
									in:fly={{ y: 10, duration: 300, delay: 250 + idx * 50, easing: cubicOut }}
								>
									<div class="flex items-center gap-3">
										{#if entry.rank === 1}
											<div
												class="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-sm"
											>
												<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
													<path
														d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
													/>
												</svg>
											</div>
										{:else if entry.rank === 2}
											<div
												class="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-sm"
											>
												<span class="font-bold text-white">2</span>
											</div>
										{:else if entry.rank === 3}
											<div
												class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-sm"
											>
												<span class="font-bold text-white">3</span>
											</div>
										{:else}
											<div
												class="w-10 h-10 rounded-xl bg-surface-dim flex items-center justify-center"
											>
												<span class="font-medium text-text-muted">{entry.rank}</span>
											</div>
										{/if}
										<div class="flex-1 min-w-0">
											<div class="font-semibold truncate">{entry.username}</div>
											<div class="text-xs text-text-muted">
												{entry.gamesPlayed} games · {entry.averageScore} avg
											</div>
										</div>
										<div class="text-right">
											<div class="text-xl font-bold text-primary tabular-nums">
												{entry.totalScore}
											</div>
											<div class="text-xs text-text-muted">points</div>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
					{/await}
				</div>
			{/if}
		</div>
	</div>
</div>
