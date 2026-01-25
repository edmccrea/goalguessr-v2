<script lang="ts">
  import { editorState } from "$lib/editor-state.svelte";
  import Combobox from "$lib/components/Combobox.svelte";
  import { PUBLIC_FEATURE_INTERNATIONAL } from "$env/static/public";

  const showInternational = PUBLIC_FEATURE_INTERNATIONAL === "true";

  interface Props {
    onsubmit: () => void;
    isSubmitting?: boolean;
    submitLabel?: string;
  }

  let {
    onsubmit,
    isSubmitting = false,
    submitLabel = "Submit for Review",
  }: Props = $props();

  const metadata = $derived(editorState.metadata);
  const validation = $derived(editorState.validate());

  // Duplicate check state
  interface DuplicateMatch {
    id: string;
    team: string;
    scorer: string;
    year: number;
    competition: string | null;
    opponent: string | null;
    status: string;
    submittedByUsername: string | null;
  }

  let isCheckingDuplicate = $state(false);
  let duplicateResult = $state<{
    exists: boolean;
    matches: DuplicateMatch[];
    message: string;
  } | null>(null);
  let duplicateError = $state<string | null>(null);

  // Can check for duplicates when team, scorer, and year are filled
  const canCheckDuplicate = $derived(
    metadata.team?.trim() && metadata.scorer?.trim() && metadata.year,
  );

  async function checkForDuplicates() {
    if (!canCheckDuplicate) return;

    isCheckingDuplicate = true;
    duplicateResult = null;
    duplicateError = null;

    try {
      const params = new URLSearchParams({
        team: metadata.team.trim(),
        scorer: metadata.scorer.trim(),
        year: String(metadata.year),
      });

      const res = await fetch(`/api/goals/check-duplicate?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to check for duplicates");
      }

      duplicateResult = data;
    } catch (err) {
      duplicateError =
        err instanceof Error ? err.message : "Failed to check for duplicates";
    } finally {
      isCheckingDuplicate = false;
    }
  }

  // Suggestion state for comboboxes
  interface Suggestion {
    id: string;
    label: string;
    sublabel?: string;
  }

  let teamSuggestions = $state<Suggestion[]>([]);
  let scorerSuggestions = $state<Suggestion[]>([]);
  let opponentSuggestions = $state<Suggestion[]>([]);
  let competitionSuggestions = $state<Suggestion[]>([]);

  async function searchTeams(query: string) {
    try {
      const params = new URLSearchParams({ q: query });
      if (metadata.isInternational) {
        params.set("international", "true");
      } else if (!showInternational) {
        // When international feature is disabled, only show club teams
        params.set("international", "false");
      }
      const res = await fetch(`/api/search/teams?${params}`);
      const data = await res.json();
      teamSuggestions = data.suggestions ?? [];
    } catch {
      teamSuggestions = [];
    }
  }

  async function searchScorers(query: string) {
    try {
      const res = await fetch(
        `/api/search/players?q=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      scorerSuggestions = data.suggestions ?? [];
    } catch {
      scorerSuggestions = [];
    }
  }

  async function searchOpponents(query: string) {
    try {
      const params = new URLSearchParams({ q: query });
      if (metadata.isInternational) {
        params.set("international", "true");
      } else if (!showInternational) {
        // When international feature is disabled, only show club teams
        params.set("international", "false");
      }
      const res = await fetch(`/api/search/teams?${params}`);
      const data = await res.json();
      opponentSuggestions = data.suggestions ?? [];
    } catch {
      opponentSuggestions = [];
    }
  }

  async function searchCompetitions(query: string) {
    try {
      const params = new URLSearchParams({ q: query });
      if (metadata.isInternational) {
        params.set("international", "true");
      } else if (!showInternational) {
        // When international feature is disabled, only show club competitions
        params.set("international", "false");
      }
      const res = await fetch(`/api/search/competitions?${params}`);
      const data = await res.json();
      competitionSuggestions = data.suggestions ?? [];
    } catch {
      competitionSuggestions = [];
    }
  }
</script>

<div
  class="bg-surface border border-border rounded-2xl p-6 space-y-5 shadow-lg"
>
  <!-- Header -->
  <div class="flex items-center gap-3 pb-4 border-b border-border">
    <div
      class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"
    >
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
        class="text-primary"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    </div>
    <div>
      <h2 class="font-bold text-lg">Goal Details</h2>
      <p class="text-text-muted text-xs">
        Fill in the information about this goal
      </p>
    </div>
  </div>

  <!-- Required Fields -->
  <div class="space-y-4">
    <div>
      <label
        for="team"
        class="flex items-center gap-2 text-sm font-medium mb-2"
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
          class="text-text-muted"
        >
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
        Team <span class="text-error">*</span>
      </label>
      <Combobox
        id="team"
        name="team"
        bind:value={metadata.team}
        placeholder="e.g. Manchester United"
        suggestions={teamSuggestions}
        onSearch={searchTeams}
      />
    </div>

    <div>
      <label
        for="year"
        class="flex items-center gap-2 text-sm font-medium mb-2"
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
          class="text-text-muted"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        Year <span class="text-error">*</span>
      </label>
      <input
        type="number"
        id="year"
        bind:value={metadata.year}
        min="1900"
        max={new Date().getFullYear() + 1}
        class="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        placeholder="e.g. 1999"
      />
    </div>

    <div>
      <label
        for="scorer"
        class="flex items-center gap-2 text-sm font-medium mb-2"
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
          class="text-text-muted"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Goalscorer <span class="text-error">*</span>
      </label>
      <Combobox
        id="scorer"
        name="scorer"
        bind:value={metadata.scorer}
        placeholder="e.g. Lionel Messi"
        suggestions={scorerSuggestions}
        onSearch={searchScorers}
      />
    </div>

    <!-- Duplicate Check Section -->
    <div class="pt-3 pb-1">
      <button
        type="button"
        onclick={checkForDuplicates}
        disabled={!canCheckDuplicate || isCheckingDuplicate}
        class="w-full flex items-center justify-center gap-2 bg-surface-dim hover:bg-border/50 border border-border text-text-muted hover:text-text px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if isCheckingDuplicate}
          <svg
            class="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Checking...
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          Check for Existing Goals
        {/if}
      </button>

      {#if duplicateError}
        <div
          class="mt-3 flex items-start gap-2 bg-error-light border border-error/20 rounded-xl p-3 text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-error flex-shrink-0 mt-0.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span class="text-error">{duplicateError}</span>
        </div>
      {/if}

      {#if duplicateResult}
        {#if duplicateResult.exists}
          <div
            class="mt-3 bg-warning/10 border border-warning/30 rounded-xl p-3"
          >
            <div class="flex items-start gap-2 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-warning flex-shrink-0 mt-0.5"
              >
                <path
                  d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"
                />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span class="text-sm font-medium text-warning"
                >{duplicateResult.message}</span
              >
            </div>
            <div class="space-y-2 ml-6">
              {#each duplicateResult.matches as match}
                <div
                  class="text-xs bg-surface rounded-lg p-2 border border-border"
                >
                  <div class="font-medium">
                    {match.team} vs {match.opponent || "Unknown"} ({match.year})
                  </div>
                  <div class="text-text-muted">
                    Scorer: {match.scorer}
                    {#if match.competition}
                      &middot; {match.competition}
                    {/if}
                  </div>
                  <div class="text-text-muted mt-1">
                    Status: <span class="capitalize">{match.status}</span>
                    {#if match.submittedByUsername}
                      &middot; by {match.submittedByUsername}
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
            <p class="text-xs text-text-muted mt-2 ml-6">
              You can still submit if this is a different version of the goal.
            </p>
          </div>
        {:else}
          <div
            class="mt-3 flex items-start gap-2 bg-success/10 border border-success/30 rounded-xl p-3 text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-success flex-shrink-0 mt-0.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span class="text-success">{duplicateResult.message}</span>
          </div>
        {/if}
      {/if}
    </div>

    <div>
      <label
        for="competition"
        class="flex items-center gap-2 text-sm font-medium mb-2"
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
          class="text-text-muted"
        >
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path
            d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"
          />
          <path
            d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"
          />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
        Competition <span class="text-error">*</span>
      </label>
      <Combobox
        id="competition"
        name="competition"
        bind:value={metadata.competition}
        placeholder="e.g. Champions League Final"
        suggestions={competitionSuggestions}
        onSearch={searchCompetitions}
      />
    </div>

    <div>
      <label
        for="opponent"
        class="flex items-center gap-2 text-sm font-medium mb-2"
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
          class="text-text-muted"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        Opponent <span class="text-error">*</span>
      </label>
      <Combobox
        id="opponent"
        name="opponent"
        bind:value={metadata.opponent}
        placeholder="e.g. Bayern Munich"
        suggestions={opponentSuggestions}
        onSearch={searchOpponents}
      />
    </div>

    <div>
      <label
        for="video"
        class="flex items-center gap-2 text-sm font-medium mb-2"
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
          class="text-text-muted"
        >
          <path d="m22 8-6 4 6 4V8Z" />
          <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
        </svg>
        Video URL <span class="text-error">*</span>
      </label>
      <input
        type="url"
        id="video"
        bind:value={metadata.videoUrl}
        class="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        placeholder="https://..."
      />
    </div>
  </div>

  <!-- Optional Fields -->
  <div class="pt-4 border-t border-border space-y-4">
    <div class="text-xs text-text-muted uppercase tracking-wide font-medium">
      Optional Details
    </div>

    <div>
      <label
        for="matchContext"
        class="flex items-center gap-2 text-sm font-medium mb-2"
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
          class="text-text-muted"
        >
          <path
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          />
        </svg>
        Match Context
      </label>
      <textarea
        id="matchContext"
        bind:value={metadata.matchContext}
        rows="2"
        class="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
        placeholder="e.g. 93:20 - Title-winning goal on the final day"
      ></textarea>
    </div>

    {#if showInternational}
      <label
        for="international"
        class="flex items-center gap-3 p-3 bg-surface-dim rounded-xl cursor-pointer hover:bg-border/50 transition-colors"
      >
        <input
          type="checkbox"
          id="international"
          bind:checked={metadata.isInternational}
          class="w-5 h-5 rounded border-border accent-primary cursor-pointer"
        />
        <div class="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-text-muted"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
          <span class="text-sm font-medium">International Match</span>
        </div>
      </label>
    {:else}
      <div class="p-3 bg-surface-dim rounded-xl border border-border/50">
        <div class="flex items-center gap-3">
          <div
            class="w-5 h-5 rounded border border-border bg-surface flex items-center justify-center flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-text-muted"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-text-muted"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
            <span class="text-sm font-medium text-text-muted"
              >International Match</span
            >
            <span
              class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"
              >Coming Soon</span
            >
          </div>
        </div>
        <p class="text-xs text-text-muted mt-2 ml-8">
          We currently only support club football goals. International matches
          (World Cup, Euros, etc.) will be available soon.
        </p>
      </div>
    {/if}
  </div>

  <!-- Validation errors -->
  {#if !validation.valid && validation.errors.length > 0}
    <div
      class="flex items-start gap-3 bg-error-light border border-error/20 rounded-xl p-4"
    >
      <div
        class="w-8 h-8 rounded-lg bg-error/20 flex items-center justify-center flex-shrink-0"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-error"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div>
        <p class="text-sm font-medium text-error mb-1">
          Please fix the following:
        </p>
        <ul class="text-sm text-error/80 list-disc list-inside space-y-0.5">
          {#each validation.errors as error}
            <li>{error}</li>
          {/each}
        </ul>
      </div>
    </div>
  {/if}

  <button
    onclick={onsubmit}
    disabled={!validation.valid || isSubmitting}
    class="group w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0 flex items-center justify-center gap-2"
  >
    {#if isSubmitting}
      <svg
        class="animate-spin h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      Submitting...
    {:else}
      {submitLabel}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="transition-transform group-hover:translate-x-1"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    {/if}
  </button>
</div>
