<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	let { data, form } = $props();

	let searchQuery = $state('');

	$effect(() => {
		if (form?.success) {
			toast.success(`Admin privileges ${form.action} successfully`);
		} else if (form?.error) {
			toast.error(form.error);
		}
	});

	const filteredUsers = $derived(
		data.users.filter((user) => {
			const query = searchQuery.toLowerCase();
			return (
				user.username?.toLowerCase().includes(query) ||
				user.email?.toLowerCase().includes(query)
			);
		})
	);

	function formatDate(date: Date | null): string {
		if (!date) return 'Unknown';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="min-h-screen p-8">
	<div class="max-w-6xl mx-auto">
		<div class="mb-8">
			<a href="/admin" class="text-text-muted hover:text-primary text-sm">&larr; Back to Admin</a>
			<h1 class="text-4xl font-bold mt-2">User Management</h1>
			<p class="text-text-muted mt-2">{data.users.length} registered user{data.users.length !== 1 ? 's' : ''}</p>
		</div>

		<!-- Search -->
		<div class="mb-6">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search by username or email..."
				class="w-full max-w-md bg-surface border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
			/>
		</div>

		{#if filteredUsers.length === 0}
			<div class="bg-surface border border-border p-8 rounded-xl text-center">
				<p class="text-text-muted">
					{searchQuery ? 'No users match your search.' : 'No registered users yet.'}
				</p>
			</div>
		{:else}
			<div class="bg-surface border border-border rounded-xl overflow-hidden">
				<table class="w-full">
					<thead class="bg-background">
						<tr>
							<th class="text-left p-4 text-text-muted text-sm font-medium">User</th>
							<th class="text-left p-4 text-text-muted text-sm font-medium">Joined</th>
							<th class="text-center p-4 text-text-muted text-sm font-medium">Games</th>
							<th class="text-center p-4 text-text-muted text-sm font-medium">Total Score</th>
							<th class="text-center p-4 text-text-muted text-sm font-medium">Avg Score</th>
							<th class="text-center p-4 text-text-muted text-sm font-medium">Role</th>
							<th class="text-right p-4 text-text-muted text-sm font-medium">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						{#each filteredUsers as user}
							<tr class="hover:bg-background/50">
								<td class="p-4">
									<div class="font-medium">{user.username || 'No username'}</div>
									<div class="text-text-muted text-sm">{user.email}</div>
								</td>
								<td class="p-4 text-text-muted text-sm">
									{formatDate(user.createdAt)}
								</td>
								<td class="p-4 text-center">
									{user.gamesPlayed}
								</td>
								<td class="p-4 text-center font-medium">
									{user.totalScore.toLocaleString()}
								</td>
								<td class="p-4 text-center text-text-muted">
									{user.averageScore}
								</td>
								<td class="p-4 text-center">
									{#if user.isAdmin}
										<span class="bg-primary/20 text-primary text-xs font-medium px-2 py-1 rounded">
											Admin
										</span>
									{:else}
										<span class="text-text-muted text-xs">User</span>
									{/if}
								</td>
								<td class="p-4 text-right">
									<form method="POST" action="?/toggleAdmin" use:enhance class="inline">
										<input type="hidden" name="userId" value={user.id} />
										<button
											type="submit"
											class="text-sm hover:underline"
											class:text-red-500={user.isAdmin}
											class:text-primary={!user.isAdmin}
										>
											{user.isAdmin ? 'Remove Admin' : 'Make Admin'}
										</button>
									</form>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Stats Summary -->
			<div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
				<div class="bg-surface border border-border p-6 rounded-xl">
					<div class="text-3xl font-bold text-primary">
						{data.users.filter((u) => u.isAdmin).length}
					</div>
					<div class="text-text-muted text-sm mt-1">Admins</div>
				</div>
				<div class="bg-surface border border-border p-6 rounded-xl">
					<div class="text-3xl font-bold text-text">
						{data.users.reduce((sum, u) => sum + u.gamesPlayed, 0)}
					</div>
					<div class="text-text-muted text-sm mt-1">Total Games Played</div>
				</div>
				<div class="bg-surface border border-border p-6 rounded-xl">
					<div class="text-3xl font-bold text-text">
						{data.users.reduce((sum, u) => sum + u.totalScore, 0).toLocaleString()}
					</div>
					<div class="text-text-muted text-sm mt-1">Combined Score</div>
				</div>
			</div>
		{/if}
	</div>
</div>
