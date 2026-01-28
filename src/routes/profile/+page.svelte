<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { fly, scale } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import Skeleton from '$lib/components/ui/Skeleton.svelte';

	let { data }: { data: PageData } = $props();
	let isLoggingOut = $state(false);
	let avatarColor = $state(data.user?.avatarColor ?? null);
	let isSavingColor = $state(false);
	let showColorPicker = $state(false);
	let pickerRef: HTMLDivElement | undefined = $state();

	function handleClickOutside(e: MouseEvent) {
		if (pickerRef && !pickerRef.contains(e.target as Node)) {
			showColorPicker = false;
		}
	}

	const presetColors = [
		{ hex: '#EF4444', name: 'Red' },
		{ hex: '#F97316', name: 'Orange' },
		{ hex: '#EAB308', name: 'Yellow' },
		{ hex: '#22C55E', name: 'Green' },
		{ hex: '#14B8A6', name: 'Teal' },
		{ hex: '#3B82F6', name: 'Blue' },
		{ hex: '#6366F1', name: 'Indigo' },
		{ hex: '#A855F7', name: 'Purple' },
		{ hex: '#EC4899', name: 'Pink' },
		{ hex: '#6B7280', name: 'Gray' }
	];

	async function selectColor(hex: string) {
		if (isSavingColor) return;
		const previous = avatarColor;
		avatarColor = hex;
		isSavingColor = true;
		try {
			const res = await fetch('/api/profile', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ avatarColor: hex })
			});
			if (res.ok) {
				invalidateAll();
			} else {
				avatarColor = previous;
			}
		} catch {
			avatarColor = previous;
		} finally {
			isSavingColor = false;
		}
	}
</script>

<svelte:head>
	<title>Profile | Top Bins Daily</title>
</svelte:head>

<svelte:document onclick={handleClickOutside} />

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
								d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
							/>
						</svg>
					</div>
					<div>
						<h1 class="text-3xl sm:text-4xl font-bold">Profile</h1>
						<p class="text-text-muted mt-1">Your account and stats</p>
					</div>
				</div>
			</div>

			<!-- User Info Card -->
			<div
				class="bg-surface border border-border p-6 rounded-2xl mb-8 shadow-lg"
				in:fly={{ y: 20, duration: 500, delay: 100, easing: cubicOut }}
			>
				{#if data.user}
					<div class="flex items-start justify-between gap-4 flex-wrap">
						<div class="flex items-center gap-4">
							<div class="relative" bind:this={pickerRef}>
								<button
									type="button"
									onclick={() => (showColorPicker = !showColorPicker)}
									class="w-16 h-16 rounded-2xl flex items-center justify-center cursor-pointer transition-all hover:ring-2 hover:ring-primary/40 hover:ring-offset-2 hover:ring-offset-surface {avatarColor ? '' : 'bg-gradient-to-br from-primary/20 to-primary/10'}"
									style={avatarColor ? `background-color: ${avatarColor}` : ''}
									title="Change avatar color"
								>
									<span class="text-2xl font-bold {avatarColor ? 'text-white' : 'text-primary'}"
										>{data.user.username.charAt(0).toUpperCase()}</span
									>
								</button>
								{#if showColorPicker}
									<div
										class="absolute top-full left-0 mt-2 w-[220px] p-3 bg-surface border border-border rounded-xl shadow-xl z-50"
										transition:scale={{ start: 0.95, duration: 150, easing: cubicOut }}
									>
										<div class="flex items-center gap-2 mb-2">
											<span class="text-xs font-medium text-text-muted">Avatar Color</span>
											{#if isSavingColor}
												<Spinner size="sm" />
											{/if}
										</div>
										<div class="grid grid-cols-5 gap-2">
											{#each presetColors as color}
												<button
													type="button"
													onclick={() => selectColor(color.hex)}
													class="w-9 h-9 rounded-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface {avatarColor === color.hex ? 'ring-2 ring-white scale-110' : ''}"
													style="background-color: {color.hex}"
													title={color.name}
													disabled={isSavingColor}
												></button>
											{/each}
										</div>
									</div>
								{/if}
							</div>
							<div>
								<div class="flex items-center gap-2 flex-wrap">
									<h2 class="text-2xl font-bold">{data.user.username}</h2>
									{#if data.user.isAdmin}
										<span
											class="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full"
										>
											<svg
												class="w-3 h-3"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
												/>
											</svg>
											Admin
										</span>
									{/if}
								</div>
								<p class="text-text-muted mt-1">{data.user.email}</p>
							</div>
						</div>
						<form method="POST" action="/auth/logout" use:enhance={() => {
							isLoggingOut = true;
							return async ({ update }) => {
								await update();
							};
						}}>
							<button
								type="submit"
								disabled={isLoggingOut}
								class="group flex items-center gap-2 bg-surface-dim hover:bg-border disabled:bg-surface-dim border border-border px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:border-error/30 hover:text-error disabled:cursor-not-allowed disabled:opacity-70"
							>
								{#if isLoggingOut}
									<Spinner size="sm" />
									Logging out...
								{:else}
									<svg
										class="w-4 h-4 transition-transform group-hover:translate-x-0.5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
										/>
									</svg>
									Logout
								{/if}
							</button>
						</form>
					</div>
				{:else}
					<div class="text-center py-4">
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
						<p class="text-text-muted font-medium">You are playing as a guest</p>
						<p class="text-sm text-text-muted mt-1">
							Create an account to save your stats across devices
						</p>
						<div class="mt-6 flex justify-center gap-4 flex-wrap">
							<a
								href="/auth/register"
								class="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
									/>
								</svg>
								Create Account
							</a>
							<a
								href="/auth/login"
								class="group flex items-center gap-2 bg-surface hover:bg-surface-dim border border-border px-6 py-3 rounded-xl font-medium transition-all hover:border-primary/30"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
									/>
								</svg>
								Login
							</a>
						</div>
					</div>
				{/if}
			</div>

			<!-- Stats Overview -->
			<div class="mb-8" in:fly={{ y: 20, duration: 500, delay: 200, easing: cubicOut }}>
				<div class="flex items-center gap-2 mb-5">
					<span
						class="inline-flex items-center gap-2 text-primary font-medium text-xs uppercase tracking-wide"
					>
						<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
							/>
						</svg>
						Your Stats
					</span>
				</div>
				{#await data.stats}
					<!-- Skeleton loading state -->
					<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
						{#each [0, 1, 2, 3] as i}
							<div class="bg-surface border border-border p-5 rounded-2xl shadow-lg">
								<div class="flex items-center gap-2 mb-3">
									<Skeleton class="w-8 h-8 rounded-lg" />
								</div>
								<Skeleton class="h-10 w-20 rounded mb-1" />
								<Skeleton class="h-3 w-16 rounded" />
							</div>
						{/each}
					</div>
				{:then stats}
					<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
						{#each [{ value: stats.gamesPlayed, label: 'Games Played', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }, { value: stats.totalScore, label: 'Total Score', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' }, { value: stats.avgScore, label: 'Avg Score', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' }, { value: stats.accuracy + '%', label: 'Overall Accuracy', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }] as stat, idx}
							<div
								class="bg-surface border border-border p-5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
								in:scale={{ start: 0.95, duration: 400, delay: 250 + idx * 75, easing: backOut }}
							>
								<div class="flex items-center gap-2 mb-3">
									<div
										class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
									>
										<svg
											class="w-4 h-4 text-primary"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d={stat.icon}
											/>
										</svg>
									</div>
								</div>
								<div class="text-3xl sm:text-4xl font-bold text-primary tabular-nums">
									{stat.value}
								</div>
								<div class="text-text-muted text-xs uppercase tracking-wide mt-1">{stat.label}</div>
							</div>
						{/each}
					</div>
				{/await}
			</div>

			<!-- Accuracy Breakdown -->
			<div class="mb-8" in:fly={{ y: 20, duration: 500, delay: 300, easing: cubicOut }}>
				<div class="flex items-center gap-2 mb-5">
					<span
						class="inline-flex items-center gap-2 text-primary font-medium text-xs uppercase tracking-wide"
					>
						<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
							/>
						</svg>
						Accuracy Breakdown
					</span>
				</div>
				{#await data.stats}
					<!-- Skeleton loading state -->
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{#each [0, 1, 2] as i}
							<div class="bg-surface border border-border p-5 rounded-2xl shadow-lg">
								<div class="flex items-center justify-between mb-4">
									<div class="flex items-center gap-2">
										<Skeleton class="w-8 h-8 rounded-lg" />
										<Skeleton class="h-4 w-12 rounded" />
									</div>
									<Skeleton class="h-6 w-12 rounded" />
								</div>
								<Skeleton class="h-2.5 w-full rounded-full" />
							</div>
						{/each}
					</div>
				{:then stats}
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{#each [{ label: 'Team', value: stats.teamAccuracy, color: 'primary', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' }, { label: 'Year', value: stats.yearAccuracy, color: 'warning', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }, { label: 'Scorer', value: stats.scorerAccuracy, color: 'success', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' }] as stat, idx}
							<div
								class="bg-surface border border-border p-5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
								in:scale={{ start: 0.95, duration: 400, delay: 400 + idx * 75, easing: backOut }}
							>
								<div class="flex items-center justify-between mb-4">
									<div class="flex items-center gap-2">
										<div
											class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 {stat.color === 'primary' ? 'bg-primary/10' : stat.color === 'warning' ? 'bg-warning/10' : 'bg-success/10'}"
										>
											<svg
												class="w-4 h-4 {stat.color === 'primary' ? 'text-primary' : stat.color === 'warning' ? 'text-warning' : 'text-success'}"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d={stat.icon}
												/>
											</svg>
										</div>
										<span class="text-sm font-medium text-text-muted">{stat.label}</span>
									</div>
									<span class="text-xl font-bold tabular-nums">{stat.value}%</span>
								</div>
								<div class="h-2.5 bg-surface-dim rounded-full overflow-hidden">
									<div
										class="h-full rounded-full transition-all duration-500 {stat.color === 'primary' ? 'bg-primary' : stat.color === 'warning' ? 'bg-warning' : 'bg-success'}"
										style="width: {stat.value}%"
									></div>
								</div>
							</div>
						{/each}
					</div>
				{/await}
			</div>

			<!-- Recent Games -->
			<div in:fly={{ y: 20, duration: 500, delay: 400, easing: cubicOut }}>
				<div class="flex items-center gap-2 mb-5">
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
						Recent Games
					</span>
				</div>

				{#await data.recentGames}
					<!-- Skeleton loading state -->
					<div class="bg-surface border border-border rounded-2xl shadow-lg overflow-hidden">
						<div class="hidden sm:block">
							<table class="w-full">
								<thead class="bg-surface-dim/50">
									<tr>
										<th class="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">Date</th>
										<th class="text-center px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">R1</th>
										<th class="text-center px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">R2</th>
										<th class="text-center px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">R3</th>
										<th class="text-right px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">Total</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-border">
									{#each [0, 1, 2, 3, 4] as i}
										<tr>
											<td class="px-6 py-4">
												<div class="flex items-center gap-3">
													<Skeleton class="w-8 h-8 rounded-lg" />
													<Skeleton class="h-5 w-24 rounded" />
												</div>
											</td>
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
					</div>
				{:then recentGames}
				{#if recentGames.length > 0}
					<div class="bg-surface border border-border rounded-2xl shadow-lg overflow-hidden">
						<!-- Desktop Table -->
						<div class="hidden sm:block">
							<table class="w-full">
								<thead class="bg-surface-dim/50">
									<tr>
										<th
											class="text-left px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide"
											>Date</th
										>
										<th
											class="text-center px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide"
											>R1</th
										>
										<th
											class="text-center px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide"
											>R2</th
										>
										<th
											class="text-center px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide"
											>R3</th
										>
										<th
											class="text-right px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide"
											>Total</th
										>
									</tr>
								</thead>
								<tbody class="divide-y divide-border">
									{#each recentGames as game, idx}
										<tr
											class="hover:bg-surface-dim/50 transition-colors"
											in:fly={{ y: 10, duration: 300, delay: 450 + idx * 50, easing: cubicOut }}
										>
											<td class="px-6 py-4">
												<div class="flex items-center gap-3">
													<div
														class="w-8 h-8 rounded-lg bg-surface-dim flex items-center justify-center"
													>
														<svg
															class="w-4 h-4 text-text-muted"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
															/>
														</svg>
													</div>
													<span class="font-medium">
														{game.createdAt
															? new Date(game.createdAt).toLocaleDateString('en-US', {
																	month: 'short',
																	day: 'numeric',
																	year: 'numeric'
																})
															: 'Unknown'}
													</span>
												</div>
											</td>
											<td class="px-6 py-4 text-center">
												<span class="text-text-muted tabular-nums">{game.round1Score ?? 0}</span>
											</td>
											<td class="px-6 py-4 text-center">
												<span class="text-text-muted tabular-nums">{game.round2Score ?? 0}</span>
											</td>
											<td class="px-6 py-4 text-center">
												<span class="text-text-muted tabular-nums">{game.round3Score ?? 0}</span>
											</td>
											<td class="px-6 py-4 text-right">
												<span class="font-bold text-primary text-lg tabular-nums"
													>{game.totalScore ?? 0}</span
												>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>

						<!-- Mobile Cards -->
						<div class="sm:hidden divide-y divide-border">
							{#each recentGames as game, idx}
								<div
									class="p-4 hover:bg-surface-dim/50 transition-colors"
									in:fly={{ y: 10, duration: 300, delay: 450 + idx * 50, easing: cubicOut }}
								>
									<div class="flex items-center gap-3">
										<div class="w-10 h-10 rounded-xl bg-surface-dim flex items-center justify-center">
											<svg
												class="w-5 h-5 text-text-muted"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
												/>
											</svg>
										</div>
										<div class="flex-1 min-w-0">
											<div class="font-medium">
												{game.createdAt
													? new Date(game.createdAt).toLocaleDateString('en-US', {
															month: 'short',
															day: 'numeric',
															year: 'numeric'
														})
													: 'Unknown'}
											</div>
											<div class="text-xs text-text-muted">
												{game.round1Score ?? 0} + {game.round2Score ?? 0} + {game.round3Score ?? 0}
											</div>
										</div>
										<div class="text-right">
											<div class="text-xl font-bold text-primary tabular-nums">
												{game.totalScore ?? 0}
											</div>
											<div class="text-xs text-text-muted">points</div>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<div
						class="bg-surface border border-border p-12 rounded-2xl text-center shadow-lg"
						in:scale={{ start: 0.95, duration: 400, delay: 450, easing: backOut }}
					>
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
									d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<p class="text-text-muted font-medium">No games played yet</p>
						<p class="text-sm text-text-muted mt-1">Play your first game to see your history</p>
						<a
							href="/play"
							class="inline-flex items-center gap-2 mt-6 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
						>
							Play Today's Game
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
				{/if}
				{/await}
			</div>

			<!-- Your Submissions -->
			{#if data.user}
				<div class="mt-8" in:fly={{ y: 20, duration: 500, delay: 500, easing: cubicOut }}>
					<div class="flex items-center justify-between mb-5">
						<span class="inline-flex items-center gap-2 text-primary font-medium text-xs uppercase tracking-wide">
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							Your Submissions
						</span>
						<a
							href="/submissions"
							class="text-sm text-primary hover:text-primary-hover transition-colors font-medium"
						>
							View all
						</a>
					</div>

					{#await data.recentSubmissions}
						<!-- Skeleton loading state -->
						<div class="bg-surface border border-border rounded-2xl shadow-lg overflow-hidden">
							<div class="divide-y divide-border">
								{#each [0, 1, 2] as i}
									<div class="p-4 flex items-center gap-4">
										<Skeleton class="w-10 h-10 rounded-xl" />
										<div class="flex-1">
											<Skeleton class="h-5 w-32 mb-1 rounded" />
											<Skeleton class="h-3 w-24 rounded" />
										</div>
										<Skeleton class="h-6 w-16 rounded-full" />
									</div>
								{/each}
							</div>
						</div>
					{:then recentSubmissions}
						{#if recentSubmissions.length > 0}
							<div class="bg-surface border border-border rounded-2xl shadow-lg overflow-hidden">
								<div class="divide-y divide-border">
									{#each recentSubmissions as submission, idx}
										<div
											class="p-4 hover:bg-surface-dim/50 transition-colors"
											in:fly={{ y: 10, duration: 300, delay: 550 + idx * 50, easing: cubicOut }}
										>
											<div class="flex items-center gap-4">
												<div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
													<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<circle cx="12" cy="12" r="10" stroke-width="2"/>
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3" />
													</svg>
												</div>
												<div class="flex-1 min-w-0">
													<div class="flex items-center gap-2 flex-wrap">
														<span class="font-medium">{submission.scorer}</span>
														<span class="text-primary font-semibold">{submission.year}</span>
													</div>
													<p class="text-sm text-text-muted truncate">{submission.team}</p>
												</div>
												<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 {submission.status === 'approved' ? 'bg-primary/10 text-primary' : submission.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}">
													<span class="w-1.5 h-1.5 rounded-full {submission.status === 'approved' ? 'bg-primary' : submission.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}"></span>
													{submission.status}
												</span>
											</div>
											{#if submission.status === 'rejected' && submission.rejectionReason}
												<div class="mt-3 ml-14 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
													<p class="text-xs text-red-500 font-medium mb-1">Rejection Reason</p>
													<p class="text-sm text-text-muted">{submission.rejectionReason}</p>
												</div>
											{/if}
										</div>
									{/each}
								</div>
							</div>
						{:else}
							<div
								class="bg-surface border border-border p-8 rounded-2xl text-center shadow-lg"
								in:scale={{ start: 0.95, duration: 400, delay: 550, easing: backOut }}
							>
								<div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-surface-dim flex items-center justify-center">
									<svg class="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
								</div>
								<p class="text-text-muted font-medium text-sm">No submissions yet</p>
								<a
									href="/editor"
									class="inline-flex items-center gap-2 mt-4 text-primary hover:text-primary-hover text-sm font-medium transition-colors"
								>
									Create your first goal
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
									</svg>
								</a>
							</div>
						{/if}
					{/await}
				</div>
			{/if}
		</div>
	</div>
</div>
