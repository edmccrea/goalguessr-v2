<script lang="ts">
	import type { ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { fly, scale } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	let { form }: { form: ActionData } = $props();
	let isSubmitting = $state(false);

	$effect(() => {
		if (form?.error) {
			toast.error(form.error);
		}
	});
</script>

<svelte:head>
	<title>Login | Top Bins Daily</title>
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
							d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
						/>
					</svg>
				</div>
				<h1 class="text-3xl sm:text-4xl font-bold">Welcome back</h1>
				<p class="text-text-muted mt-2">Sign in to your account</p>
			</div>

			<!-- Form Card -->
			<form
				method="POST"
				class="bg-surface border border-border rounded-2xl p-6 shadow-lg space-y-5"
				in:fly={{ y: 20, duration: 500, delay: 100, easing: cubicOut }}
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						isSubmitting = false;
						await update();
					};
				}}
			>
				<div in:fly={{ y: 10, duration: 400, delay: 150, easing: cubicOut }}>
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

				<div in:fly={{ y: 10, duration: 400, delay: 200, easing: cubicOut }}>
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
						/>
					</div>
				</div>

				<div in:scale={{ start: 0.95, duration: 400, delay: 250, easing: backOut }}>
					<button
						type="submit"
						disabled={isSubmitting}
						class="group w-full bg-primary hover:bg-primary-hover disabled:bg-primary/70 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 disabled:translate-y-0 disabled:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						{#if isSubmitting}
							<Spinner size="md" />
							Signing in...
						{:else}
							Sign In
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
						{/if}
					</button>
				</div>
			</form>

			<!-- Register Link -->
			<div
				class="mt-8 text-center"
				in:fly={{ y: 10, duration: 400, delay: 300, easing: cubicOut }}
			>
				<p class="text-text-muted">
					Don't have an account?
					<a
						href="/auth/register"
						class="text-primary hover:underline font-medium ml-1 inline-flex items-center gap-1 group"
					>
						Create one
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
