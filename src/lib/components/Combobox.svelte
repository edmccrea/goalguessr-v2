<script lang="ts">
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	interface Suggestion {
		id: string;
		label: string;
		sublabel?: string;
	}

	interface Props {
		id: string;
		name: string;
		value: string;
		placeholder?: string;
		disabled?: boolean;
		suggestions?: Suggestion[];
		onSearch?: (query: string) => void;
		minChars?: number;
		maxSuggestions?: number;
		isLoading?: boolean;
	}

	let {
		id,
		name,
		value = $bindable(''),
		placeholder = '',
		disabled = false,
		suggestions = [],
		onSearch,
		minChars = 2,
		maxSuggestions = 8,
		isLoading = false
	}: Props = $props();

	let isOpen = $state(false);
	let highlightedIndex = $state(-1);
	let justSelected = $state(false);
	let inputRef: HTMLInputElement | undefined = $state();
	let listRef: HTMLUListElement | undefined = $state();
	let searchTimeout: ReturnType<typeof setTimeout>;

	const listboxId = $derived(`${id}-listbox`);

	const filteredSuggestions = $derived(suggestions.slice(0, maxSuggestions));

	function handleInput(e: Event) {
		const query = (e.target as HTMLInputElement).value;
		value = query;
		highlightedIndex = -1;

		clearTimeout(searchTimeout);
		if (query.length >= minChars) {
			searchTimeout = setTimeout(() => {
				onSearch?.(query);
				isOpen = true;
			}, 200);
		} else {
			isOpen = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen && e.key !== 'ArrowDown') return;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				if (!isOpen && value.length >= minChars) {
					isOpen = true;
				} else {
					highlightedIndex = Math.min(highlightedIndex + 1, filteredSuggestions.length - 1);
				}
				break;
			case 'ArrowUp':
				e.preventDefault();
				highlightedIndex = Math.max(highlightedIndex - 1, -1);
				break;
			case 'Enter':
				if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
					e.preventDefault();
					selectSuggestion(filteredSuggestions[highlightedIndex]);
				}
				break;
			case 'Escape':
				isOpen = false;
				highlightedIndex = -1;
				break;
			case 'Tab':
				isOpen = false;
				highlightedIndex = -1;
				break;
		}
	}

	function selectSuggestion(suggestion: Suggestion) {
		value = suggestion.label;
		isOpen = false;
		highlightedIndex = -1;
		justSelected = true;
		inputRef?.focus();
	}

	function handleFocus() {
		// Don't reopen if we just selected a suggestion
		if (justSelected) {
			justSelected = false;
			return;
		}
		if (value.length >= minChars && suggestions.length > 0) {
			isOpen = true;
		}
	}

	function handleBlur(e: FocusEvent) {
		// Delay closing to allow click on suggestion
		setTimeout(() => {
			const relatedTarget = e.relatedTarget as HTMLElement | null;
			if (!listRef?.contains(relatedTarget)) {
				isOpen = false;
				highlightedIndex = -1;
			}
		}, 150);
	}
</script>

<div class="relative">
	<div class="relative">
		<input
			bind:this={inputRef}
			type="text"
			{id}
			{name}
			{value}
			{placeholder}
			{disabled}
			autocomplete="off"
			role="combobox"
			aria-autocomplete="list"
			aria-expanded={isOpen}
			aria-controls={listboxId}
			aria-activedescendant={highlightedIndex >= 0 ? `${id}-option-${highlightedIndex}` : undefined}
			class="w-full bg-surface border border-border rounded-xl pl-4 pr-10 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
			oninput={handleInput}
			onkeydown={handleKeydown}
			onfocus={handleFocus}
			onblur={handleBlur}
		/>
		<!-- Search/loading icon -->
		<div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
			{#if isLoading}
				<svg class="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
			{:else}
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			{/if}
		</div>
	</div>

	{#if isOpen && filteredSuggestions.length > 0}
		<ul
			bind:this={listRef}
			id={listboxId}
			role="listbox"
			class="absolute z-50 w-full mt-2 bg-surface border border-border rounded-xl shadow-xl max-h-64 overflow-auto"
			transition:scale={{ duration: 150, start: 0.95, easing: cubicOut }}
		>
			{#each filteredSuggestions as suggestion, index (suggestion.id)}
				<li
					id="{id}-option-{index}"
					role="option"
					aria-selected={highlightedIndex === index}
					tabindex="-1"
					class="px-4 py-3 cursor-pointer transition-colors first:rounded-t-xl last:rounded-b-xl {highlightedIndex === index
						? 'bg-primary/10 text-primary'
						: 'hover:bg-surface-dim'}"
					onclick={() => selectSuggestion(suggestion)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							selectSuggestion(suggestion);
						}
					}}
					onmouseenter={() => (highlightedIndex = index)}
				>
					<div class="flex items-center justify-between gap-2">
						<div class="font-medium text-text truncate">{suggestion.label}</div>
						{#if highlightedIndex === index}
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary flex-shrink-0">
								<polyline points="9 10 4 15 9 20"/>
								<path d="M20 4v7a4 4 0 0 1-4 4H4"/>
							</svg>
						{/if}
					</div>
					{#if suggestion.sublabel}
						<div class="text-xs text-text-muted mt-0.5 truncate">{suggestion.sublabel}</div>
					{/if}
				</li>
			{/each}
		</ul>
	{:else if isOpen && value.length >= minChars && !isLoading}
		<div
			class="absolute z-50 w-full mt-2 bg-surface border border-border rounded-xl shadow-xl p-4 text-center text-text-muted text-sm"
			transition:scale={{ duration: 150, start: 0.95, easing: cubicOut }}
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-2 opacity-50">
				<circle cx="11" cy="11" r="8"/>
				<path d="m21 21-4.3-4.3"/>
			</svg>
			No results found
		</div>
	{/if}
</div>
