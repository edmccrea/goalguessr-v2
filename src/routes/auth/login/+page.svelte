<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="min-h-screen p-8 flex items-center justify-center">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<a href="/" class="text-text-muted hover:text-primary text-sm">&larr; Back to Home</a>
			<h1 class="text-4xl font-bold mt-2">Login</h1>
		</div>

		{#if form?.error}
			<div class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4">
				{form.error}
			</div>
		{/if}

		<form
			method="POST"
			class="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4"
		>
			<div>
				<label for="email" class="block text-sm font-medium mb-1.5">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					value={form?.email ?? ''}
					class="w-full bg-surface-dim border border-border rounded-lg px-4 py-2.5 focus:border-primary focus:outline-none"
					placeholder="you@example.com"
					required
				/>
			</div>
			<div>
				<label for="password" class="block text-sm font-medium mb-1.5">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					class="w-full bg-surface-dim border border-border rounded-lg px-4 py-2.5 focus:border-primary focus:outline-none"
					placeholder="********"
					required
				/>
			</div>

			<button
				type="submit"
				class="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition-colors"
			>
				Login
			</button>
		</form>

		<p class="mt-6 text-center text-text-muted">
			Don't have an account?
			<a href="/auth/register" class="text-primary hover:underline">Register</a>
		</p>
	</div>
</div>
