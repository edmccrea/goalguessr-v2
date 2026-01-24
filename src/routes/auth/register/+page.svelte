<script lang="ts">
	import type { ActionData } from './$types';
	import { toast } from 'svelte-sonner';

	let { form }: { form: ActionData } = $props();

	$effect(() => {
		if (form?.error) {
			toast.error(form.error);
		}
	});
</script>

<div class="min-h-screen p-8 flex items-center justify-center">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<a href="/" class="text-text-muted hover:text-primary text-sm">&larr; Back to Home</a>
			<h1 class="text-4xl font-bold mt-2">Create Account</h1>
		</div>

		<form
			method="POST"
			class="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4"
		>
			<div>
				<label for="username" class="block text-sm font-medium mb-1.5">Username</label>
				<input
					type="text"
					id="username"
					name="username"
					value={form?.username ?? ''}
					class="w-full bg-surface-dim border border-border rounded-lg px-4 py-2.5 focus:border-primary focus:outline-none"
					placeholder="Choose a username"
					required
					minlength="3"
				/>
			</div>
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
					minlength="8"
				/>
				<p class="text-text-muted text-xs mt-1">At least 8 characters</p>
			</div>
			<div>
				<label for="confirm" class="block text-sm font-medium mb-1.5">Confirm Password</label>
				<input
					type="password"
					id="confirm"
					name="confirm"
					class="w-full bg-surface-dim border border-border rounded-lg px-4 py-2.5 focus:border-primary focus:outline-none"
					placeholder="********"
					required
					minlength="8"
				/>
			</div>

			<button
				type="submit"
				class="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition-colors"
			>
				Create Account
			</button>
		</form>

		<p class="mt-6 text-center text-text-muted">
			Already have an account?
			<a href="/auth/login" class="text-primary hover:underline">Login</a>
		</p>
	</div>
</div>
