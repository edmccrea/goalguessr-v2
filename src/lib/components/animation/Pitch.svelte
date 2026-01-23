<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		width?: number;
		height?: number;
		children?: Snippet;
	}

	let { width = 100, height = 65, children }: Props = $props();

	// Pitch dimensions (relative to 100x65 standard)
	const penaltyAreaWidth = 16.5;
	const penaltyAreaDepth = 40.3;
	const goalAreaWidth = 5.5;
	const goalAreaDepth = 18.3;
	const penaltySpotDistance = 11;
	const centerCircleRadius = 9.15;
	const cornerArcRadius = 1;
	const goalWidth = 7.32;
</script>

<svg
	viewBox="0 0 {width} {height}"
	class="w-full h-full"
	preserveAspectRatio="xMidYMid meet"
>
	<!-- Pitch background -->
	<rect x="0" y="0" width={width} height={height} fill="#2d8a4e" />

	<!-- Pitch stripes (mowing pattern) -->
	{#each Array(10) as _, i}
		<rect
			x={i * (width / 10)}
			y="0"
			width={width / 10}
			height={height}
			fill={i % 2 === 0 ? '#2d8a4e' : '#34a058'}
		/>
	{/each}

	<!-- Pitch outline -->
	<rect
		x="1"
		y="1"
		width={width - 2}
		height={height - 2}
		fill="none"
		stroke="white"
		stroke-width="0.3"
	/>

	<!-- Center line -->
	<line x1={width / 2} y1="1" x2={width / 2} y2={height - 1} stroke="white" stroke-width="0.3" />

	<!-- Center circle -->
	<circle cx={width / 2} cy={height / 2} r={centerCircleRadius} fill="none" stroke="white" stroke-width="0.3" />

	<!-- Center spot -->
	<circle cx={width / 2} cy={height / 2} r="0.3" fill="white" />

	<!-- Left penalty area -->
	<rect
		x="1"
		y={(height - penaltyAreaDepth) / 2}
		width={penaltyAreaWidth}
		height={penaltyAreaDepth}
		fill="none"
		stroke="white"
		stroke-width="0.3"
	/>

	<!-- Left goal area -->
	<rect
		x="1"
		y={(height - goalAreaDepth) / 2}
		width={goalAreaWidth}
		height={goalAreaDepth}
		fill="none"
		stroke="white"
		stroke-width="0.3"
	/>

	<!-- Left penalty spot -->
	<circle cx={1 + penaltySpotDistance} cy={height / 2} r="0.3" fill="white" />

	<!-- Left penalty arc -->
	<path
		d="M {1 + penaltyAreaWidth} {height / 2 - 8.5}
		   A {centerCircleRadius} {centerCircleRadius} 0 0 1 {1 + penaltyAreaWidth} {height / 2 + 8.5}"
		fill="none"
		stroke="white"
		stroke-width="0.3"
	/>

	<!-- Left goal -->
	<rect
		x="0"
		y={(height - goalWidth) / 2}
		width="1"
		height={goalWidth}
		fill="none"
		stroke="white"
		stroke-width="0.3"
	/>

	<!-- Right penalty area -->
	<rect
		x={width - 1 - penaltyAreaWidth}
		y={(height - penaltyAreaDepth) / 2}
		width={penaltyAreaWidth}
		height={penaltyAreaDepth}
		fill="none"
		stroke="white"
		stroke-width="0.3"
	/>

	<!-- Right goal area -->
	<rect
		x={width - 1 - goalAreaWidth}
		y={(height - goalAreaDepth) / 2}
		width={goalAreaWidth}
		height={goalAreaDepth}
		fill="none"
		stroke="white"
		stroke-width="0.3"
	/>

	<!-- Right penalty spot -->
	<circle cx={width - 1 - penaltySpotDistance} cy={height / 2} r="0.3" fill="white" />

	<!-- Right penalty arc -->
	<path
		d="M {width - 1 - penaltyAreaWidth} {height / 2 - 8.5}
		   A {centerCircleRadius} {centerCircleRadius} 0 0 0 {width - 1 - penaltyAreaWidth} {height / 2 + 8.5}"
		fill="none"
		stroke="white"
		stroke-width="0.3"
	/>

	<!-- Right goal -->
	<rect
		x={width - 1}
		y={(height - goalWidth) / 2}
		width="1"
		height={goalWidth}
		fill="none"
		stroke="white"
		stroke-width="0.3"
	/>

	<!-- Corner arcs -->
	<path d="M 1 {1 + cornerArcRadius} A {cornerArcRadius} {cornerArcRadius} 0 0 0 {1 + cornerArcRadius} 1" fill="none" stroke="white" stroke-width="0.3" />
	<path d="M {width - 1 - cornerArcRadius} 1 A {cornerArcRadius} {cornerArcRadius} 0 0 0 {width - 1} {1 + cornerArcRadius}" fill="none" stroke="white" stroke-width="0.3" />
	<path d="M 1 {height - 1 - cornerArcRadius} A {cornerArcRadius} {cornerArcRadius} 0 0 1 {1 + cornerArcRadius} {height - 1}" fill="none" stroke="white" stroke-width="0.3" />
	<path d="M {width - 1 - cornerArcRadius} {height - 1} A {cornerArcRadius} {cornerArcRadius} 0 0 1 {width - 1} {height - 1 - cornerArcRadius}" fill="none" stroke="white" stroke-width="0.3" />

	<!-- Child content (players, ball, etc.) -->
	{#if children}
		{@render children()}
	{/if}
</svg>
