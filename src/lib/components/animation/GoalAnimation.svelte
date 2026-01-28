<script lang="ts">
	import Pitch from './Pitch.svelte';
	import PlayerIcon from './PlayerIcon.svelte';
	import Ball from './Ball.svelte';
	import PassLine from './PassLine.svelte';
	import type { AnimationData } from '$lib/server/db/schema';

	interface Props {
		animation: AnimationData;
		autoPlay?: boolean;
		loop?: boolean;
		endPauseMs?: number; // Pause at end before looping (ms)
		onComplete?: () => void;
	}

	let { animation, autoPlay = true, loop = true, endPauseMs = 1500, onComplete }: Props = $props();

	let currentTime = $state(0);
	let isPlaying = $state(false);
	let isPausedAtEnd = $state(false);
	let animationFrame: number | null = null;
	let initialized = false;

	// Initialize playing state from prop on mount
	$effect(() => {
		if (!initialized) {
			isPlaying = autoPlay;
			initialized = true;
		}
	});
	let lastTimestamp: number | null = null;

	// Find current and next keyframes based on time
	function getKeyframePair(time: number) {
		const keyframes = animation.keyframes;
		let prevKeyframe = keyframes[0];
		let nextKeyframe = keyframes[0];

		for (let i = 0; i < keyframes.length; i++) {
			if (keyframes[i].time <= time) {
				prevKeyframe = keyframes[i];
				nextKeyframe = keyframes[i + 1] || keyframes[i];
			}
		}

		return { prevKeyframe, nextKeyframe };
	}

	// Interpolate position between two keyframes
	function interpolatePosition(
		prevPos: { x: number; y: number },
		nextPos: { x: number; y: number },
		progress: number
	) {
		// Ease in-out for smoother motion
		const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
		return {
			x: prevPos.x + (nextPos.x - prevPos.x) * ease,
			y: prevPos.y + (nextPos.y - prevPos.y) * ease
		};
	}

	// Visual time clamped to animation duration (for when paused at end)
	const visualTime = $derived(Math.min(currentTime, animation.duration));

	// Timeline progress that smoothly returns to 0 during end pause
	const timelineProgress = $derived.by(() => {
		if (!loop) {
			// No looping - just show normal progress
			return visualTime / animation.duration;
		}

		if (currentTime <= animation.duration) {
			// Normal playback
			return currentTime / animation.duration;
		}

		// End pause phase - quickly animate from 100% back to 0%
		const resetDuration = 400; // ms - how long the reset animation takes
		const pauseElapsed = currentTime - animation.duration;
		const resetProgress = Math.min(1, pauseElapsed / resetDuration);
		return 1 - resetProgress;
	});

	// Get interpolated positions for all entities at current time
	const interpolatedPositions = $derived.by(() => {
		const { prevKeyframe, nextKeyframe } = getKeyframePair(visualTime);

		if (prevKeyframe === nextKeyframe) {
			return prevKeyframe.positions;
		}

		const duration = nextKeyframe.time - prevKeyframe.time;
		const elapsed = visualTime - prevKeyframe.time;
		const progress = Math.min(1, Math.max(0, duration > 0 ? elapsed / duration : 0));

		const result: Record<string, { x: number; y: number; holder?: string }> = {};

		for (const [key, prevPos] of Object.entries(prevKeyframe.positions)) {
			const nextPos = nextKeyframe.positions[key] || prevPos;
			result[key] = {
				...interpolatePosition(prevPos, nextPos, progress),
				holder: nextPos.holder
			};
		}

		return result;
	});

	// Goal positions for shots (derived to stay reactive to animation prop changes)
	const rightGoalX = $derived(animation.pitch.width);
	const leftGoalX = 0;
	const goalCenterY = $derived(animation.pitch.height / 2);
	const goalHeight = 12;

	// Parse shot target from event.to (format: "side:zone" e.g., "left:center")
	function getShotTarget(event: AnimationData['events'][0]): { x: number; y: number } {
		if (!event.to) {
			// Default to right goal center for backwards compatibility
			return { x: rightGoalX, y: goalCenterY };
		}

		const parts = event.to.split(':');
		const side = parts[0];
		const zone = parts[1] || 'center';

		const x = side === 'left' ? leftGoalX : rightGoalX;

		// Calculate Y based on zone
		const zoneHeight = goalHeight / 3;
		let y: number;
		switch (zone) {
			case 'left_post':
				y = goalCenterY - zoneHeight;
				break;
			case 'right_post':
				y = goalCenterY + zoneHeight;
				break;
			default:
				y = goalCenterY;
		}

		return { x, y };
	}

	// Event duration for animation
	const eventDuration = 500; // ms

	// Get active events (passes/shots currently in progress)
	const activeEvents = $derived.by(() => {
		return animation.events.filter((event) => {
			return visualTime >= event.time && visualTime < event.time + eventDuration;
		});
	});

	// Calculate point on quadratic bezier curve
	function getPointOnCurve(
		t: number,
		x1: number,
		y1: number,
		cpX: number,
		cpY: number,
		x2: number,
		y2: number
	) {
		const oneMinusT = 1 - t;
		return {
			x: oneMinusT * oneMinusT * x1 + 2 * oneMinusT * t * cpX + t * t * x2,
			y: oneMinusT * oneMinusT * y1 + 2 * oneMinusT * t * cpY + t * t * y2
		};
	}

	// Get control point for curved path
	function getControlPoint(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		curve: number
	): { x: number; y: number } {
		const midX = (x1 + x2) / 2;
		const midY = (y1 + y2) / 2;

		if (curve === 0) return { x: midX, y: midY };

		const dx = x2 - x1;
		const dy = y2 - y1;
		const len = Math.sqrt(dx * dx + dy * dy);

		if (len === 0) return { x: midX, y: midY };

		const perpX = -dy / len;
		const perpY = dx / len;
		const offset = len * curve * 0.5;

		return {
			x: midX + perpX * offset,
			y: midY + perpY * offset
		};
	}

	// Calculate ball position during events (passes/shots)
	const ballEventPosition = $derived.by(() => {
		for (const event of animation.events) {
			const eventStart = event.time;
			const eventEnd = event.time + eventDuration;

			if (visualTime >= eventStart && visualTime < eventEnd) {
				const progress = (visualTime - eventStart) / eventDuration;
				const fromPos = interpolatedPositions[event.from];

				if (!fromPos) continue;

				let toPos: { x: number; y: number };
				if (event.type === 'shot') {
					toPos = getShotTarget(event);
				} else if (event.to && interpolatedPositions[event.to]) {
					toPos = interpolatedPositions[event.to];
				} else {
					continue;
				}

				// Ease the progress
				const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

				// Get curve value (default to 0 for straight line)
				const curve = event.curve ?? 0;

				if (curve === 0) {
					// Straight line
					return {
						x: fromPos.x + (toPos.x - fromPos.x) * ease,
						y: fromPos.y + (toPos.y - fromPos.y) * ease,
						isMoving: true
					};
				} else {
					// Follow curved path
					const cp = getControlPoint(fromPos.x, fromPos.y, toPos.x, toPos.y, curve);
					const pos = getPointOnCurve(ease, fromPos.x, fromPos.y, cp.x, cp.y, toPos.x, toPos.y);
					return {
						x: pos.x,
						y: pos.y,
						isMoving: true
					};
				}
			}
		}
		return null;
	});

	// Calculate ball state based on completed events
	// Returns { holder, inGoal, goalPosition } - holder is the player ID, inGoal means ball is in goal after shot
	const dynamicBallState = $derived.by(() => {
		// Start with first player
		let holder: string | undefined = animation.players[0]?.id;
		let inGoal = false;
		let goalPosition: { x: number; y: number } | null = null;

		// Check all events that have COMPLETED (time + duration <= visualTime)
		for (const event of animation.events) {
			const eventEnd = event.time + eventDuration;
			if (eventEnd > visualTime) continue; // Event hasn't completed yet

			if (event.type === 'pass' && event.to) {
				holder = event.to;
				inGoal = false;
				goalPosition = null;
			} else if (event.type === 'shot') {
				holder = undefined;
				inGoal = true; // Ball is in the goal after shot completes
				goalPosition = getShotTarget(event);
			}
		}

		return { holder, inGoal, goalPosition };
	});

	// Get ball holder (null if ball is in motion or in goal)
	const ballHolder = $derived(ballEventPosition ? null : dynamicBallState.holder);
	const ballInGoal = $derived(!ballEventPosition && dynamicBallState.inGoal);

	// Total animation time including end pause
	const totalDuration = $derived(animation.duration + (loop ? endPauseMs : 0));

	// Animation loop
	function animate(timestamp: number) {
		if (!isPlaying) return;

		if (lastTimestamp === null) {
			lastTimestamp = timestamp;
		}

		const deltaMs = timestamp - lastTimestamp;
		lastTimestamp = timestamp;

		currentTime += deltaMs;

		// Check if we're in the end pause phase
		if (currentTime >= animation.duration && currentTime < totalDuration) {
			isPausedAtEnd = true;
			// Keep currentTime advancing but clamp visual position to end
		} else if (currentTime >= totalDuration) {
			if (loop) {
				currentTime = 0;
				isPausedAtEnd = false;
			} else {
				isPlaying = false;
				currentTime = animation.duration;
				onComplete?.();
			}
		} else {
			isPausedAtEnd = false;
		}

		animationFrame = requestAnimationFrame(animate);
	}

	$effect(() => {
		if (isPlaying) {
			lastTimestamp = null;
			animationFrame = requestAnimationFrame(animate);
		}

		return () => {
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
			}
		};
	});

	export function play() {
		isPlaying = true;
	}

	export function pause() {
		isPlaying = false;
	}

	export function reset() {
		currentTime = 0;
		isPlaying = false;
		isPausedAtEnd = false;
	}

	export function seek(time: number) {
		currentTime = Math.min(animation.duration, Math.max(0, time));
		isPausedAtEnd = false;
	}
</script>

<div class="relative group w-full h-full">
	<Pitch width={animation.pitch.width} height={animation.pitch.height}>
		<!-- Pass/shot lines -->
		{#each activeEvents as event (event.time + '-' + event.from)}
			{@const fromPos = interpolatedPositions[event.from]}
			{@const toPos = event.type === 'shot'
				? getShotTarget(event)
				: event.to ? interpolatedPositions[event.to] : null}
			{#if fromPos && toPos}
				<PassLine
					fromX={fromPos.x}
					fromY={fromPos.y}
					toX={toPos.x}
					toY={toPos.y}
					isShot={event.type === 'shot'}
					curve={event.curve ?? 0}
				/>
			{/if}
		{/each}

		<!-- Players -->
		{#each animation.players as player (player.id)}
			{@const pos = interpolatedPositions[player.id]}
			{#if pos}
				<PlayerIcon
					x={pos.x}
					y={pos.y}
					imageUrl={player.imageUrl}
					hasBall={ballHolder === player.id}
				/>
			{/if}
		{/each}

		<!-- Ball -->
		{#if ballEventPosition}
			<!-- Ball is moving during pass/shot -->
			<Ball x={ballEventPosition.x} y={ballEventPosition.y} />
		{:else if ballInGoal && dynamicBallState.goalPosition}
			<!-- Ball is in the goal after a shot -->
			<Ball x={dynamicBallState.goalPosition.x} y={dynamicBallState.goalPosition.y} />
		{:else if ballHolder && interpolatedPositions[ballHolder]}
			<!-- Ball is held by a player - show at player's feet -->
			<Ball x={interpolatedPositions[ballHolder].x + 2} y={interpolatedPositions[ballHolder].y + 1.5} />
		{:else if interpolatedPositions.ball}
			<!-- Ball is free (not held, not in motion) -->
			<Ball x={interpolatedPositions.ball.x} y={interpolatedPositions.ball.y} />
		{/if}
	</Pitch>

	<!-- Playback controls -->
	<div class="absolute bottom-2 left-2 right-2 flex items-center gap-2 bg-black/50 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
		<button
			onclick={() => (isPlaying = !isPlaying)}
			class="text-white px-3 py-1 rounded hover:bg-white/20"
		>
			{isPlaying ? '⏸' : '▶'}
		</button>
		<button
			onclick={() => {
				currentTime = 0;
				isPausedAtEnd = false;
			}}
			class="text-white px-3 py-1 rounded hover:bg-white/20"
		>
			⟲
		</button>
		<div class="flex-1 h-1 bg-white/30 rounded overflow-hidden">
			<div
				class="h-full bg-white"
				style="width: {timelineProgress * 100}%"
			></div>
		</div>
		<span class="text-white text-xs font-mono">
			{(visualTime / 1000).toFixed(1)}s / {(animation.duration / 1000).toFixed(1)}s
		</span>
	</div>
</div>
