<script lang="ts">
	interface Props {
		fromX: number;
		fromY: number;
		toX: number;
		toY: number;
		progress?: number; // 0 to 1
		isShot?: boolean;
		curve?: number; // -1 to 1, 0 = straight
	}

	let { fromX, fromY, toX, toY, progress = 1, isShot = false, curve = 0 }: Props = $props();

	// Calculate control point for the curve
	const controlPoint = $derived.by(() => {
		const midX = (fromX + toX) / 2;
		const midY = (fromY + toY) / 2;

		if (curve === 0) return { x: midX, y: midY };

		const dx = toX - fromX;
		const dy = toY - fromY;
		const len = Math.sqrt(dx * dx + dy * dy);
		if (len === 0) return { x: midX, y: midY };

		// Perpendicular direction
		const perpX = -dy / len;
		const perpY = dx / len;

		// Control point offset based on curve value
		const offset = len * curve * 0.5;
		return {
			x: midX + perpX * offset,
			y: midY + perpY * offset
		};
	});

	// Calculate point on quadratic bezier curve at t
	function getPointOnCurve(t: number, p0x: number, p0y: number, p1x: number, p1y: number, p2x: number, p2y: number) {
		const oneMinusT = 1 - t;
		return {
			x: oneMinusT * oneMinusT * p0x + 2 * oneMinusT * t * p1x + t * t * p2x,
			y: oneMinusT * oneMinusT * p0y + 2 * oneMinusT * t * p1y + t * t * p2y
		};
	}

	// Generate path for partial curve up to progress point
	const partialPath = $derived.by(() => {
		if (curve === 0) {
			// Straight line
			const endX = fromX + (toX - fromX) * progress;
			const endY = fromY + (toY - fromY) * progress;
			return `M ${fromX} ${fromY} L ${endX} ${endY}`;
		}

		if (progress >= 1) {
			return `M ${fromX} ${fromY} Q ${controlPoint.x} ${controlPoint.y} ${toX} ${toY}`;
		}

		// For partial progress, draw curve up to that point
		const endPoint = getPointOnCurve(progress, fromX, fromY, controlPoint.x, controlPoint.y, toX, toY);

		// Calculate partial control point using de Casteljau's algorithm
		const cp1x = fromX + progress * (controlPoint.x - fromX);
		const cp1y = fromY + progress * (controlPoint.y - fromY);

		return `M ${fromX} ${fromY} Q ${cp1x} ${cp1y} ${endPoint.x} ${endPoint.y}`;
	});

	const strokeColor = $derived(isShot ? '#fbbf24' : 'rgba(255, 255, 255, 0.5)');
	const strokeWidth = $derived(isShot ? 0.35 : 0.25);
</script>

<path
	d={partialPath}
	fill="none"
	stroke={strokeColor}
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-dasharray={isShot ? 'none' : '0.6,0.4'}
	opacity="0.8"
/>
