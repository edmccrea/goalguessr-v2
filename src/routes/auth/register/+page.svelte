<script lang="ts">
	import type { ActionData } from './$types';
	import { toast } from 'svelte-sonner';
	import { fly, scale } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';

	let { form }: { form: ActionData } = $props();

	$effect(() => {
		if (form?.error) {
			toast.error(form.error);
		}
	});
</script>

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

	<div class="relative z-10 py-12 px-6 flex items-center justify-center min-h-screen">
		<div class="w-full max-w-md">
			<!-- Header -->
			<div class="mb-8 text-center" in:fly={{ y: -20, duration: 500, easing: cubicOut }}>
				<div
					class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg shadow-primary/25 mx-auto mb-4"
				>
					<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
						/>
					</svg>
				</div>
				<h1 class="text-3xl sm:text-4xl font-bold">Join the game</h1>
				<p class="text-text-muted mt-2">Create your account</p>
			</div>

			<!-- Form Card -->
			<form
				method="POST"
				class="bg-surface border border-border rounded-2xl p-6 shadow-lg space-y-5"
				in:fly={{ y: 20, duration: 500, delay: 100, easing: cubicOut }}
			>
				<div in:fly={{ y: 10, duration: 400, delay: 150, easing: cubicOut }}>
					<label for="username" class="block text-sm font-medium mb-2">Username</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
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
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
						</div>
						<input
							type="text"
							id="username"
							name="username"
							value={form?.username ?? ''}
							class="w-full bg-surface-dim border border-border rounded-xl pl-11 pr-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
							placeholder="Choose a username"
							required
							minlength="3"
						/>
					</div>
				</div>

				<div in:fly={{ y: 10, duration: 400, delay: 200, easing: cubicOut }}>
					<label for="email" class="block text-sm font-medium mb-2">Email</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
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
									d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								/>
							</svg>
						</div>
						<input
							type="email"
							id="email"
							name="email"
							value={form?.email ?? ''}
							class="w-full bg-surface-dim border border-border rounded-xl pl-11 pr-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
							placeholder="you@example.com"
							required
						/>
					</div>
				</div>

				<div in:fly={{ y: 10, duration: 400, delay: 250, easing: cubicOut }}>
					<label for="password" class="block text-sm font-medium mb-2">Password</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
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
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
						</div>
						<input
							type="password"
							id="password"
							name="password"
							class="w-full bg-surface-dim border border-border rounded-xl pl-11 pr-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
							placeholder="••••••••"
							required
							minlength="8"
						/>
					</div>
					<p class="text-text-muted text-xs mt-2 flex items-center gap-1.5">
						<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						At least 8 characters
					</p>
				</div>

				<div in:fly={{ y: 10, duration: 400, delay: 300, easing: cubicOut }}>
					<label for="confirm" class="block text-sm font-medium mb-2">Confirm Password</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
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
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
								/>
							</svg>
						</div>
						<input
							type="password"
							id="confirm"
							name="confirm"
							class="w-full bg-surface-dim border border-border rounded-xl pl-11 pr-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
							placeholder="••••••••"
							required
							minlength="8"
						/>
					</div>
				</div>

				<div in:scale={{ start: 0.95, duration: 400, delay: 350, easing: backOut }}>
					<button
						type="submit"
						class="group w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
					>
						Create Account
						<svg
							class="w-5 h-5 transition-transform group-hover:translate-x-1"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 7l5 5m0 0l-5 5m5-5H6"
							/>
						</svg>
					</button>
				</div>
			</form>

			<!-- Login Link -->
			<div
				class="mt-8 text-center"
				in:fly={{ y: 10, duration: 400, delay: 400, easing: cubicOut }}
			>
				<p class="text-text-muted">
					Already have an account?
					<a
						href="/auth/login"
						class="text-primary hover:underline font-medium ml-1 inline-flex items-center gap-1 group"
					>
						Sign in
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
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</a>
				</p>
			</div>
		</div>
	</div>
</div>
