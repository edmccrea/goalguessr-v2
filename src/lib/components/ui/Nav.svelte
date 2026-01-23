<script lang="ts">
	import { page } from '$app/state';

	let user = $derived(page.data.user);
</script>

<nav class="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
	<div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
		<div class="flex items-center gap-8">
			<a href="/" class="font-bold text-lg text-primary">Goal Guessr</a>
			<div class="hidden sm:flex items-center gap-6">
				<a
					href="/play"
					class="text-sm text-text-muted hover:text-text transition-colors"
					class:text-text={page.url.pathname.startsWith('/play')}
				>
					Play
				</a>
				<a
					href="/leaderboard"
					class="text-sm text-text-muted hover:text-text transition-colors"
					class:text-text={page.url.pathname === '/leaderboard'}
				>
					Leaderboard
				</a>
				<a
					href="/editor"
					class="text-sm text-text-muted hover:text-text transition-colors"
					class:text-text={page.url.pathname.startsWith('/editor')}
				>
					Create
				</a>
			</div>
		</div>

		<div class="flex items-center gap-4">
			{#if user}
				<a
					href="/profile"
					class="flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors"
					class:text-text={page.url.pathname === '/profile'}
				>
					<div class="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold uppercase">
						{user.username?.charAt(0) ?? '?'}
					</div>
					<span class="hidden sm:inline">{user.username}</span>
				</a>
				{#if user.isAdmin}
					<a
						href="/admin"
						class="text-sm text-text-muted hover:text-text transition-colors"
						class:text-text={page.url.pathname.startsWith('/admin')}
					>
						Admin
					</a>
				{/if}
			{:else}
				<a
					href="/auth/login"
					class="text-sm text-text-muted hover:text-text transition-colors"
					class:text-text={page.url.pathname === '/auth/login'}
				>
					Login
				</a>
				<a
					href="/auth/register"
					class="text-sm bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg transition-colors"
				>
					Sign Up
				</a>
			{/if}
		</div>
	</div>
</nav>

<!-- Spacer to prevent content from being hidden behind fixed nav -->
<div class="h-14"></div>
