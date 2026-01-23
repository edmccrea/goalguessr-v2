<script lang="ts">
	interface Props {
		x: number;
		y: number;
		imageUrl?: string;
		hasBall?: boolean;
		size?: number;
	}

	let { x, y, imageUrl, hasBall = false, size = 5 }: Props = $props();

	const radius = $derived(size / 2);
	const clipId = $derived(`player-clip-${x}-${y}-${Math.random().toString(36).slice(2, 7)}`);
</script>

<g transform="translate({x}, {y})">
	<!-- Clip path for circular image -->
	<defs>
		<clipPath id={clipId}>
			<circle cx="0" cy="0" r={radius} />
		</clipPath>
	</defs>

	<!-- Background circle (shows if image fails to load) -->
	<circle cx="0" cy="0" r={radius} fill="#e5e7eb" stroke="white" stroke-width="0.3" />

	<!-- Player image (badge or flag) -->
	{#if imageUrl}
		<image
			href={imageUrl}
			x={-radius}
			y={-radius}
			width={size}
			height={size}
			clip-path="url(#{clipId})"
			preserveAspectRatio="xMidYMid slice"
		/>
	{/if}

	<!-- Border circle -->
	<circle
		cx="0"
		cy="0"
		r={radius}
		fill="none"
		stroke="white"
		stroke-width="0.3"
	/>

	<!-- Ball indicator -->
	{#if hasBall}
		<circle cx="0" cy="0" r={radius + 0.8} fill="none" stroke="#fbbf24" stroke-width="0.25" opacity="0.7" />
	{/if}
</g>
