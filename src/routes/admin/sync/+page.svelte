<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	let { data, form } = $props();

	let isSyncing = $state(false);

	$effect(() => {
		if (form?.success) {
			toast.success(form.message);
		} else if (form?.error) {
			toast.error(form.error);
		}
	});
</script>

<svelte:head>
	<title>Sync Data | Goal Guessr</title>
</svelte:head>

<div class="min-h-[calc(100vh-3.5rem)] relative overflow-hidden">
	<!-- Animated background elements -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
		<div class="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
	</div>

	<div class="relative z-10 p-6 md:p-8">
		<div class="max-w-3xl mx-auto">
			<!-- Header -->
			<div class="mb-8">
				<a href="/admin" class="group inline-flex items-center gap-1.5 text-text-muted hover:text-primary text-sm mb-3 transition-colors">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:-translate-x-1">
						<path d="M19 12H5M12 19l-7-7 7-7"/>
					</svg>
					Back to Admin
				</a>
				<div class="flex items-center gap-4">
					<div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-500">
							<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
							<path d="M3 3v5h5"/>
							<path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
							<path d="M16 16h5v5"/>
						</svg>
					</div>
					<div>
						<h1 class="text-3xl md:text-4xl font-bold">Data Sync</h1>
						<p class="text-text-muted mt-1">Sync teams and players for autocomplete suggestions</p>
					</div>
				</div>
			</div>

			<!-- Status Cards -->
			<div class="grid grid-cols-2 gap-4 mb-6">
				<div class="bg-surface border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-primary/30 group">
					<div class="flex items-center gap-3 mb-3">
						<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
								<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
								<line x1="4" y1="22" x2="4" y2="15"/>
							</svg>
						</div>
					</div>
					<div class="text-3xl font-bold text-primary">{data.status.teamCount.toLocaleString()}</div>
					<div class="text-text-muted text-sm mt-1">Teams in Database</div>
				</div>

				<div class="bg-surface border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-blue-500/30 group">
					<div class="flex items-center gap-3 mb-3">
						<div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
								<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
								<circle cx="9" cy="7" r="4"/>
								<path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
								<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
							</svg>
						</div>
					</div>
					<div class="text-3xl font-bold text-blue-500">{data.status.playerCount.toLocaleString()}</div>
					<div class="text-text-muted text-sm mt-1">Players in Database</div>
				</div>
			</div>

			<!-- Last Sync Info -->
			{#if data.status.lastSync}
				<div class="bg-surface border border-border p-6 rounded-xl shadow-sm mb-6">
					<div class="flex items-center gap-2 mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
							<circle cx="12" cy="12" r="10"/>
							<polyline points="12 6 12 12 16 14"/>
						</svg>
						<h2 class="font-semibold text-lg">Last Sync</h2>
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div class="bg-surface-dim/50 rounded-lg p-3">
							<div class="text-xs text-text-muted mb-1">Type</div>
							<div class="font-medium capitalize">{data.status.lastSync.syncType}</div>
						</div>
						<div class="bg-surface-dim/50 rounded-lg p-3">
							<div class="text-xs text-text-muted mb-1">Status</div>
							<div class="flex items-center gap-2">
								{#if data.status.lastSync.status === 'completed'}
									<span class="w-2 h-2 rounded-full bg-primary"></span>
									<span class="font-medium text-primary">Completed</span>
								{:else if data.status.lastSync.status === 'failed'}
									<span class="w-2 h-2 rounded-full bg-red-500"></span>
									<span class="font-medium text-red-500">Failed</span>
								{:else}
									<span class="w-2 h-2 rounded-full bg-yellow-500"></span>
									<span class="font-medium text-yellow-600">In Progress</span>
								{/if}
							</div>
						</div>
						<div class="bg-surface-dim/50 rounded-lg p-3">
							<div class="text-xs text-text-muted mb-1">Records Processed</div>
							<div class="font-medium">{(data.status.lastSync.recordsProcessed ?? 0).toLocaleString()}</div>
						</div>
					</div>
					{#if data.status.lastSync.errorMessage}
						<div class="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
							<div class="flex items-start gap-2">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500 shrink-0 mt-0.5">
									<circle cx="12" cy="12" r="10"/>
									<path d="m15 9-6 6M9 9l6 6"/>
								</svg>
								<span class="text-red-500 text-sm">{data.status.lastSync.errorMessage}</span>
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Sync Actions -->
			<div class="bg-surface border border-border p-6 rounded-xl shadow-sm">
				<div class="flex items-center gap-2 mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted">
						<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
					</svg>
					<h2 class="font-semibold text-lg">Sync Actions</h2>
				</div>

				<form
					method="POST"
					action="?/sync"
					use:enhance={() => {
						isSyncing = true;
						return async ({ update }) => {
							isSyncing = false;
							await update();
						};
					}}
				>
					<button
						type="submit"
						disabled={isSyncing}
						class="bg-primary hover:bg-primary-hover disabled:bg-surface-dim disabled:text-text-muted disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md flex items-center gap-2"
					>
						{#if isSyncing}
							<svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
								<path d="M3 3v5h5"/>
								<path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
								<path d="M16 16h5v5"/>
							</svg>
							<span>Syncing...</span>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
								<path d="M3 3v5h5"/>
								<path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
								<path d="M16 16h5v5"/>
							</svg>
							<span>Sync Sample Data</span>
						{/if}
					</button>
				</form>

				<div class="mt-4 flex items-start gap-2 text-text-muted text-sm">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 mt-0.5">
						<circle cx="12" cy="12" r="10"/>
						<path d="M12 16v-4"/>
						<path d="M12 8h.01"/>
					</svg>
					<span>
						This will load sample teams and players for autocomplete suggestions. You can sync external
						API data by configuring the FOOTBALL_API_KEY environment variable.
					</span>
				</div>
			</div>
		</div>
	</div>
</div>
