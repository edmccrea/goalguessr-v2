<script lang="ts">
	interface Props {
		x: number;
		y: number;
		size?: number;
	}

	let { x, y, size = 1.5 }: Props = $props();
</script>

<g transform="translate({x}, {y})">
	<!-- Ball shadow -->
	<ellipse cx="0.2" cy="0.2" rx={size / 2} ry={size / 3} fill="rgba(0,0,0,0.2)" />

	<!-- Ball -->
	<circle cx="0" cy="0" r={size / 2} fill="white" stroke="#333" stroke-width="0.1" />

	<!-- Ball pattern (simplified pentagon) -->
	<circle cx="0" cy="0" r={size / 4} fill="#333" />
</g>
