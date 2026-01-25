<script lang="ts">
  import { page } from "$app/state";
  import { dev } from "$app/environment";
  import { PUBLIC_FEATURE_LEADERBOARD } from "$env/static/public";
  import favicon from "$lib/assets/favicon.svg";

  let user = $derived(page.data.user);
  let mobileMenuOpen = $state(false);
  const showLeaderboard = PUBLIC_FEATURE_LEADERBOARD === "true";

  function isActive(path: string, exact = false) {
    if (exact) return page.url.pathname === path;
    return page.url.pathname.startsWith(path);
  }
</script>

<nav
  class="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50"
>
  <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
    <!-- Logo & Main Nav -->
    <div class="flex items-center gap-8">
      <a href="/" class="group flex items-center gap-2.5">
        <img
          src={favicon}
          alt="Goal Guessr"
          class="w-8 h-8 transition-transform group-hover:scale-105 group-hover:rotate-3"
        />
        <span class="font-bold text-lg text-text">Goal Guessr</span>
      </a>

      <!-- Desktop Nav Links -->
      <div class="hidden sm:flex items-center gap-1">
        <a
          href="/play"
          class="relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors {isActive(
            '/play',
          )
            ? 'text-primary bg-primary/10'
            : 'text-text-muted hover:text-text hover:bg-surface-dim'}"
        >
          Play
        </a>
        {#if showLeaderboard}
          <a
            href="/leaderboard"
            class="relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors {isActive(
              '/leaderboard',
              true,
            )
              ? 'text-primary bg-primary/10'
              : 'text-text-muted hover:text-text hover:bg-surface-dim'}"
          >
            Leaderboard
          </a>
        {/if}
        <a
          href="/editor"
          class="relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors {isActive(
            '/editor',
          )
            ? 'text-primary bg-primary/10'
            : 'text-text-muted hover:text-text hover:bg-surface-dim'}"
        >
          Create
        </a>
      </div>
    </div>

    <!-- Right Side -->
    <div class="flex items-center gap-3">
      {#if user}
        <a
          href="/profile"
          class="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors {isActive(
            '/profile',
            true,
          )
            ? 'bg-primary/10'
            : 'hover:bg-surface-dim'}"
        >
          <div
            class="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-hover text-white flex items-center justify-center text-xs font-semibold uppercase shadow-sm"
          >
            {user.username?.charAt(0) ?? "?"}
          </div>
          <span
            class="hidden sm:inline text-sm font-medium {isActive(
              '/profile',
              true,
            )
              ? 'text-primary'
              : 'text-text-muted'}">{user.username}</span
          >
        </a>
        {#if user.isAdmin}
          <a
            href="/admin"
            class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors {isActive(
              '/admin',
            )
              ? 'text-primary bg-primary/10'
              : 'text-text-muted hover:text-text hover:bg-surface-dim'}"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="opacity-70"
            >
              <path
                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
              />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Admin
          </a>
        {/if}
        {#if dev}
          <a
            href="/play?dev"
            class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors text-warning hover:text-warning hover:bg-warning/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="opacity-70"
            >
              <path
                d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
              />
            </svg>
            Dev
          </a>
        {/if}
      {:else}
        <a
          href="/auth/login"
          class="hidden sm:block text-sm font-medium text-text-muted hover:text-text transition-colors px-3 py-1.5 rounded-md hover:bg-surface-dim"
        >
          Log in
        </a>
        <a
          href="/auth/register"
          class="text-sm font-semibold bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          Sign Up
        </a>
      {/if}

      <!-- Mobile Menu Button -->
      <button
        onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
        class="sm:hidden p-2 text-text-muted hover:text-text hover:bg-surface-dim rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        {#if mobileMenuOpen}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        {/if}
      </button>
    </div>
  </div>

  <!-- Mobile Menu -->
  {#if mobileMenuOpen}
    <div
      class="sm:hidden border-t border-border/50 bg-background/95 backdrop-blur-md"
    >
      <div class="px-4 py-3 space-y-1">
        <a
          href="/play"
          onclick={() => (mobileMenuOpen = false)}
          class="block px-3 py-2 text-sm font-medium rounded-lg transition-colors {isActive(
            '/play',
          )
            ? 'text-primary bg-primary/10'
            : 'text-text-muted hover:text-text hover:bg-surface-dim'}"
        >
          Play
        </a>
        {#if showLeaderboard}
          <a
            href="/leaderboard"
            onclick={() => (mobileMenuOpen = false)}
            class="block px-3 py-2 text-sm font-medium rounded-lg transition-colors {isActive(
              '/leaderboard',
              true,
            )
              ? 'text-primary bg-primary/10'
              : 'text-text-muted hover:text-text hover:bg-surface-dim'}"
          >
            Leaderboard
          </a>
        {/if}
        <a
          href="/editor"
          onclick={() => (mobileMenuOpen = false)}
          class="block px-3 py-2 text-sm font-medium rounded-lg transition-colors {isActive(
            '/editor',
          )
            ? 'text-primary bg-primary/10'
            : 'text-text-muted hover:text-text hover:bg-surface-dim'}"
        >
          Create
        </a>
        {#if user?.isAdmin}
          <a
            href="/admin"
            onclick={() => (mobileMenuOpen = false)}
            class="block px-3 py-2 text-sm font-medium rounded-lg transition-colors {isActive(
              '/admin',
            )
              ? 'text-primary bg-primary/10'
              : 'text-text-muted hover:text-text hover:bg-surface-dim'}"
          >
            Admin
          </a>
        {/if}
        {#if dev}
          <a
            href="/play?dev"
            onclick={() => (mobileMenuOpen = false)}
            class="block px-3 py-2 text-sm font-medium rounded-lg transition-colors text-warning hover:bg-warning/10"
          >
            Dev Tools
          </a>
        {/if}
        {#if !user}
          <div class="pt-2 border-t border-border/50">
            <a
              href="/auth/login"
              onclick={() => (mobileMenuOpen = false)}
              class="block px-3 py-2 text-sm font-medium text-text-muted hover:text-text rounded-lg hover:bg-surface-dim transition-colors"
            >
              Log in
            </a>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</nav>

<!-- Spacer to prevent content from being hidden behind fixed nav -->
<div class="h-14"></div>
