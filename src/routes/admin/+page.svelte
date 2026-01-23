<script lang="ts">
</script>

<div class="min-h-screen p-8">
	<div class="max-w-3xl mx-auto">
		<div class="mb-8">
			<a href="/" class="text-text-muted hover:text-primary text-sm">&larr; Back to Home</a>
			<h1 class="text-4xl font-bold">Admin Dashboard</h1>
		</div>

		<div class="grid grid-cols-2 gap-6 mb-8">
			<div class="bg-surface border border-border p-6 rounded-xl shadow-sm">
				<div class="text-3xl font-bold text-primary">0</div>
				<div class="text-text-muted text-sm mt-1">Pending Reviews</div>
			</div>
			<div class="bg-surface border border-border p-6 rounded-xl shadow-sm">
				<div class="text-3xl font-bold text-primary">0</div>
				<div class="text-text-muted text-sm mt-1">Total Goals</div>
			</div>
		</div>

		<div class="space-y-4">
			<a
				href="/admin/review"
				class="block bg-surface border border-border p-6 rounded-xl hover:border-primary transition-colors shadow-sm"
			>
				<div class="font-semibold">Review Submissions</div>
				<div class="text-text-muted text-sm">Approve or reject community-submitted goals</div>
			</a>

			<a
				href="/admin/sync"
				class="block bg-surface border border-border p-6 rounded-xl hover:border-primary transition-colors shadow-sm"
			>
				<div class="font-semibold">Sync Teams & Players</div>
				<div class="text-text-muted text-sm">Import teams and players for autocomplete suggestions</div>
			</a>

			<div class="bg-surface border border-border p-6 rounded-xl shadow-sm">
				<div class="font-semibold">Schedule Daily Games</div>
				<div class="text-text-muted text-sm">Queue goals for upcoming daily games</div>
			</div>
		</div>
	</div>
</div>
