<script lang="ts">
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
		maxSuggestions = 8
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
			class="w-full bg-surface border border-border rounded-lg pl-4 pr-10 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
			oninput={handleInput}
			onkeydown={handleKeydown}
			onfocus={handleFocus}
			onblur={handleBlur}
		/>
		<!-- Search icon to indicate autocomplete -->
		<div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
		</div>
	</div>

	{#if isOpen && filteredSuggestions.length > 0}
		<ul
			bind:this={listRef}
			id={listboxId}
			role="listbox"
			class="absolute z-50 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-60 overflow-auto"
		>
			{#each filteredSuggestions as suggestion, index (suggestion.id)}
				<li
					id="{id}-option-{index}"
					role="option"
					aria-selected={highlightedIndex === index}
					tabindex="-1"
					class="px-4 py-2.5 cursor-pointer transition-colors {highlightedIndex === index
						? 'bg-primary-light'
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
					<div class="font-medium text-text">{suggestion.label}</div>
					{#if suggestion.sublabel}
						<div class="text-xs text-text-muted">{suggestion.sublabel}</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
