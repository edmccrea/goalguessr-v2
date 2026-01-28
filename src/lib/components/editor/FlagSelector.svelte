<script lang="ts">
	import { countries, searchCountries, getFlagUrl, type Country } from '$lib/countries';

	interface Props {
		value: string;
		onselect: (url: string) => void;
		oncancel: () => void;
		placeholder?: string;
		allowCustomUrl?: boolean;
	}

	let { value = $bindable(), onselect, oncancel, placeholder = 'Search country...', allowCustomUrl = true }: Props = $props();

	let searchQuery = $state('');
	let showDropdown = $state(true);
	let isCustomUrl = $state(false);
	let selectedIndex = $state(0);

	const filteredCountries = $derived(searchCountries(searchQuery));

	function selectCountry(country: Country) {
		value = getFlagUrl(country.code);
		showDropdown = false;
		onselect(value);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			oncancel();
		} else if (e.key === 'Enter') {
			if (isCustomUrl) {
				onselect(value);
			} else if (filteredCountries.length > 0) {
				selectCountry(filteredCountries[selectedIndex]);
			}
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, filteredCountries.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, 0);
		}
	}

	function toggleCustomUrl() {
		isCustomUrl = !isCustomUrl;
		if (isCustomUrl) {
			searchQuery = '';
			value = '';
		} else {
			value = '';
		}
	}

	// Reset selected index when search query changes
	let prevSearchQuery = '';
	$effect(() => {
		if (searchQuery !== prevSearchQuery) {
			prevSearchQuery = searchQuery;
			selectedIndex = 0;
		}
	});

	// Close on outside click
	let containerEl: HTMLDivElement | undefined = $state();

	function handlePointerDown(e: PointerEvent) {
		if (containerEl && !containerEl.contains(e.target as Node)) {
			oncancel();
		}
	}
</script>

<svelte:window onpointerdown={handlePointerDown} />

<div class="relative" bind:this={containerEl}>
	<div class="flex flex-col gap-2">
		<!-- Mode toggle -->
		{#if allowCustomUrl}
			<div class="flex gap-2 text-xs">
				<button
					type="button"
					onclick={() => { isCustomUrl = false; }}
					class="px-2 py-1 rounded transition-colors"
					class:bg-primary={!isCustomUrl}
					class:text-white={!isCustomUrl}
					class:bg-surface-dim={isCustomUrl}
					class:text-text-muted={isCustomUrl}
				>
					Flag
				</button>
				<button
					type="button"
					onclick={() => { isCustomUrl = true; }}
					class="px-2 py-1 rounded transition-colors"
					class:bg-primary={isCustomUrl}
					class:text-white={isCustomUrl}
					class:bg-surface-dim={!isCustomUrl}
					class:text-text-muted={!isCustomUrl}
				>
					Custom URL
				</button>
			</div>
		{/if}

		{#if isCustomUrl}
			<!-- svelte-ignore a11y_autofocus -->
			<input
				type="text"
				bind:value
				onkeydown={handleKeydown}
				placeholder="Badge/image URL"
				class="w-48 bg-surface border border-border rounded-lg px-2 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
				autofocus
			/>
		{:else}
			<!-- Country search input -->
			<div class="relative">
				<!-- svelte-ignore a11y_autofocus -->
				<input
					type="text"
					bind:value={searchQuery}
					onkeydown={handleKeydown}
					{placeholder}
					class="w-48 bg-surface border border-border rounded-lg pl-2 pr-8 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
					autofocus
				/>
				<!-- Search icon -->
				<div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				</div>

				<!-- Dropdown -->
				{#if showDropdown && filteredCountries.length > 0}
					<div class="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
						{#each filteredCountries.slice(0, 10) as country, i (country.code)}
							<button
								type="button"
								onclick={() => selectCountry(country)}
								class="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left hover:bg-surface-dim transition-colors"
								class:bg-primary-light={i === selectedIndex}
							>
								<img
									src={getFlagUrl(country.code)}
									alt={country.name}
									class="w-6 h-4 object-cover rounded-sm"
								/>
								<span>{country.name}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Preview + actions -->
		<div class="flex items-center gap-2">
			{#if value}
				<img
					src={value}
					alt="Preview"
					class="w-6 h-6 rounded-full object-cover border border-border"
				/>
			{/if}
			<button
				type="button"
				onclick={() => onselect(value)}
				class="bg-primary hover:bg-primary-hover text-white px-3 py-1 rounded text-sm transition-colors"
			>
				{value ? 'Add' : 'Skip'}
			</button>
			<button
				type="button"
				onclick={oncancel}
				class="text-text-muted hover:text-text text-sm transition-colors"
			>
				Cancel
			</button>
		</div>
	</div>
</div>
