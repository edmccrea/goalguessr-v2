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

<div class="min-h-screen p-8">
	<div class="max-w-3xl mx-auto">
		<div class="mb-8">
			<a href="/admin" class="text-text-muted hover:text-primary text-sm">&larr; Back to Admin</a>
			<h1 class="text-4xl font-bold">Data Sync</h1>
			<p class="text-text-muted mt-2">Sync teams and players for autocomplete suggestions</p>
		</div>

		<!-- Status Cards -->
		<div class="grid grid-cols-2 gap-6 mb-8">
			<div class="bg-surface border border-border p-6 rounded-xl shadow-sm">
				<div class="text-3xl font-bold text-primary">{data.status.teamCount}</div>
				<div class="text-text-muted text-sm mt-1">Teams in Database</div>
			</div>
			<div class="bg-surface border border-border p-6 rounded-xl shadow-sm">
				<div class="text-3xl font-bold text-primary">{data.status.playerCount}</div>
				<div class="text-text-muted text-sm mt-1">Players in Database</div>
			</div>
		</div>

		<!-- Last Sync Info -->
		{#if data.status.lastSync}
			<div class="bg-surface border border-border p-6 rounded-xl shadow-sm mb-6">
				<h2 class="font-semibold mb-2">Last Sync</h2>
				<div class="text-sm text-text-muted space-y-1">
					<div>Type: {data.status.lastSync.syncType}</div>
					<div>
						Status:
						<span
							class="{data.status.lastSync.status === 'completed'
								? 'text-success'
								: data.status.lastSync.status === 'failed'
									? 'text-error'
									: 'text-warning'}"
						>
							{data.status.lastSync.status}
						</span>
					</div>
					<div>Records: {data.status.lastSync.recordsProcessed}</div>
					{#if data.status.lastSync.errorMessage}
						<div class="text-error">Error: {data.status.lastSync.errorMessage}</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Sync Actions -->
		<div class="bg-surface border border-border p-6 rounded-xl shadow-sm">
			<h2 class="font-semibold mb-4">Sync Actions</h2>

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
					class="bg-primary hover:bg-primary-hover disabled:bg-surface-dim disabled:text-text-muted disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors"
				>
					{isSyncing ? 'Syncing...' : 'Sync Sample Data'}
				</button>
			</form>

			<p class="text-text-muted text-xs mt-4">
				This will load sample teams and players for autocomplete suggestions. You can sync external
				API data by configuring the FOOTBALL_API_KEY environment variable.
			</p>
		</div>
	</div>
</div>
