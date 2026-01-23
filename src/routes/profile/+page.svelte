<script lang="ts">
</script>

<div class="min-h-screen p-8">
	<div class="max-w-3xl mx-auto">
		<div class="mb-8">
			<a href="/" class="text-text-muted hover:text-primary text-sm">&larr; Back to Home</a>
			<h1 class="text-4xl font-bold">Profile</h1>
		</div>

		<div class="bg-surface border border-border p-6 rounded-xl mb-6 shadow-sm">
			<p class="text-text-muted">You are playing as a guest.</p>
			<div class="mt-4 flex gap-4">
				<a
					href="/auth/register"
					class="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-xl font-medium transition-colors"
				>
					Create Account
				</a>
				<a
					href="/auth/login"
					class="bg-surface-dim hover:bg-border border border-border px-6 py-2 rounded-xl font-medium transition-colors"
				>
					Login
				</a>
			</div>
		</div>

		<div class="grid grid-cols-3 gap-6 mb-8">
			<div class="bg-surface border border-border p-6 rounded-xl text-center shadow-sm">
				<div class="text-3xl font-bold text-primary">0</div>
				<div class="text-text-muted text-sm mt-1">Games Played</div>
			</div>
			<div class="bg-surface border border-border p-6 rounded-xl text-center shadow-sm">
				<div class="text-3xl font-bold text-primary">0</div>
				<div class="text-text-muted text-sm mt-1">Total Score</div>
			</div>
			<div class="bg-surface border border-border p-6 rounded-xl text-center shadow-sm">
				<div class="text-3xl font-bold text-primary">0%</div>
				<div class="text-text-muted text-sm mt-1">Accuracy</div>
			</div>
		</div>
	</div>
</div>
