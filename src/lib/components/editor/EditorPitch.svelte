<script lang="ts">
	import Pitch from '../animation/Pitch.svelte';
	import Ball from '../animation/Ball.svelte';
	import FlagSelector from './FlagSelector.svelte';
	import { editorState } from '$lib/editor-state.svelte';

	// Add first player state
	let isAddingFirstPlayer = $state(false);

	function addFirstPlayer(imageUrl?: string) {
		const id = editorState.addPlayer(imageUrl || undefined);
		editorState.selectedPlayerId = id;
		isAddingFirstPlayer = false;
	}

	let svgElement: SVGSVGElement | undefined = $state();
	let draggingId: string | null = $state(null);
	let dragOffset = $state({ x: 0, y: 0 });

	// Drawing event state
	let isDrawingEvent = $state(false);
	let drawStart = $state({ x: 0, y: 0 });
	let drawEnd = $state({ x: 0, y: 0 });
	let drawFromPlayer: string | null = $state(null);
	type GoalZone = 'left_post' | 'center' | 'right_post';
	let snapTarget: { type: 'player'; id: string } | { type: 'goal'; side: 'left' | 'right'; zone: GoalZone } | null = $state(null);

	// Snap configuration
	const SNAP_DISTANCE = 8; // Distance at which snapping kicks in

	const positions = $derived(editorState.currentKeyframe?.positions ?? {});
	const players = $derived(editorState.animation.players);
	const selectedId = $derived(editorState.selectedPlayerId);
	const events = $derived(editorState.animation.events);
	const currentKeyframeTime = $derived(editorState.currentKeyframe?.time ?? 0);
	const ballHolder = $derived(positions.ball?.holder);

	// Get events for current keyframe
	const currentEvents = $derived(
		events.filter((e) => e.time === currentKeyframeTime)
	);

	// Goal positions (both sides of pitch)
	const goalY = 32.5;
	const goalHeight = 12;
	const rightGoalX = 100;
	const leftGoalX = 0;

	// Get Y position for a goal zone
	function getGoalZoneY(zone: GoalZone): number {
		const zoneHeight = goalHeight / 3;
		switch (zone) {
			case 'left_post': return goalY - zoneHeight; // Top third
			case 'right_post': return goalY + zoneHeight; // Bottom third
			default: return goalY; // Center
		}
	}

	// Convert client coordinates to SVG coordinates
	function clientToSvg(clientX: number, clientY: number): { x: number; y: number } {
		if (!svgElement) return { x: 0, y: 0 };

		const rect = svgElement.getBoundingClientRect();
		const viewBox = svgElement.viewBox.baseVal;

		return {
			x: ((clientX - rect.left) / rect.width) * viewBox.width,
			y: ((clientY - rect.top) / rect.height) * viewBox.height
		};
	}

	function handlePointerDown(e: PointerEvent, id: string) {
		e.preventDefault();
		e.stopPropagation();

		const pos = positions[id];
		if (!pos) return;

		const svgPos = clientToSvg(e.clientX, e.clientY);
		dragOffset = { x: svgPos.x - pos.x, y: svgPos.y - pos.y };
		draggingId = id;
		editorState.selectedPlayerId = id === 'ball' ? null : id;

		(e.target as Element).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		const svgPos = clientToSvg(e.clientX, e.clientY);

		// Handle curve dragging
		if (draggingCurve) {
			const event = currentEvents.find(
				(ev) => ev.time === draggingCurve!.time && ev.from === draggingCurve!.from
			);
			if (event) {
				const fromPos = getEventSourcePosition(event);
				const toPos = getEventTargetPosition(event);
				if (fromPos && toPos) {
					const newCurve = getCurveFromControlPoint(
						fromPos.x,
						fromPos.y,
						toPos.x,
						toPos.y,
						svgPos.x,
						svgPos.y
					);
					editorState.updateEventCurve(event.time, event.from, newCurve);
				}
			}
			return;
		}

		// Handle event drawing
		if (isDrawingEvent) {
			// Check for snap targets
			const nearestPlayer = findNearestPlayer(svgPos.x, svgPos.y, drawFromPlayer);
			const nearGoal = isNearGoal(svgPos.x, svgPos.y);

			if (nearestPlayer) {
				// Snap to player
				const playerPos = positions[nearestPlayer.id];
				if (playerPos) {
					snapTarget = { type: 'player', id: nearestPlayer.id };
					drawEnd = { x: playerPos.x, y: playerPos.y };
				}
			} else if (nearGoal) {
				// Snap to goal zone
				snapTarget = { type: 'goal', side: nearGoal.side, zone: nearGoal.zone };
				const targetX = nearGoal.side === 'right' ? rightGoalX : leftGoalX;
				const targetY = getGoalZoneY(nearGoal.zone);
				drawEnd = { x: targetX, y: targetY };
			} else {
				// No snap, follow cursor
				snapTarget = null;
				drawEnd = svgPos;
			}
			return;
		}

		// Handle player/ball dragging
		if (!draggingId) return;

		const newX = svgPos.x - dragOffset.x;
		const newY = svgPos.y - dragOffset.y;

		if (draggingId === 'ball') {
			// Only allow dragging ball when no holder (e.g., after a shot)
			editorState.updateBallPosition(newX, newY, positions.ball?.holder);
		} else {
			// updatePlayerPosition automatically moves the ball if this player has it
			editorState.updatePlayerPosition(draggingId, newX, newY);
		}
	}

	function handlePointerUp(e: PointerEvent) {
		// Handle curve dragging completion
		if (draggingCurve) {
			draggingCurve = null;
			return;
		}

		// Handle event drawing completion
		if (isDrawingEvent && drawFromPlayer) {
			// Use snap target if available, otherwise check position
			if (snapTarget) {
				if (snapTarget.type === 'player') {
					editorState.addEvent('pass', drawFromPlayer, snapTarget.id);
				} else if (snapTarget.type === 'goal') {
					// Format: "side:zone" e.g. "right:center" or "left:left_post"
					editorState.addEvent('shot', drawFromPlayer, `${snapTarget.side}:${snapTarget.zone}`);
				}
			} else {
				// Fallback: check position directly (for edge cases)
				const svgPos = clientToSvg(e.clientX, e.clientY);
				const targetPlayer = findPlayerAtPosition(svgPos.x, svgPos.y);
				if (targetPlayer && targetPlayer !== drawFromPlayer) {
					editorState.addEvent('pass', drawFromPlayer, targetPlayer);
				} else {
					const nearGoalFallback = isNearGoal(svgPos.x, svgPos.y);
					if (nearGoalFallback) {
						editorState.addEvent('shot', drawFromPlayer, `${nearGoalFallback.side}:${nearGoalFallback.zone}`);
					}
				}
			}

			isDrawingEvent = false;
			drawFromPlayer = null;
			snapTarget = null;
		}

		draggingId = null;
	}

	function handlePitchClick(e: MouseEvent) {
		// Deselect when clicking on the pitch background
		const target = e.target as Element;
		if (target.tagName === 'rect') {
			editorState.selectedPlayerId = null;
		}
	}

	// Start drawing an event line from the ball holder
	function startDrawingEvent(e: PointerEvent, playerId: string) {
		e.preventDefault();
		e.stopPropagation();

		const pos = positions[playerId];
		if (!pos) return;

		drawFromPlayer = playerId;
		drawStart = { x: pos.x, y: pos.y };
		drawEnd = clientToSvg(e.clientX, e.clientY);
		isDrawingEvent = true;

		(e.target as Element).setPointerCapture(e.pointerId);
	}

	// Find player at a given position (for final drop)
	function findPlayerAtPosition(x: number, y: number): string | null {
		for (const player of players) {
			const pos = positions[player.id];
			if (pos) {
				const dist = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
				if (dist < 4) {
					return player.id;
				}
			}
		}
		return null;
	}

	// Find nearest player within snap distance (for snapping preview)
	function findNearestPlayer(x: number, y: number, excludeId: string | null): { id: string; dist: number } | null {
		let nearest: { id: string; dist: number } | null = null;
		for (const player of players) {
			if (player.id === excludeId) continue;
			const pos = positions[player.id];
			if (pos) {
				const dist = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
				if (dist < SNAP_DISTANCE && (!nearest || dist < nearest.dist)) {
					nearest = { id: player.id, dist };
				}
			}
		}
		return nearest;
	}

	// Check if position is near goal zone (returns which goal and zone, or null)
	function isNearGoal(x: number, y: number): { side: 'left' | 'right'; zone: GoalZone } | null {
		const inGoalYRange = y > goalY - goalHeight / 2 - 5 && y < goalY + goalHeight / 2 + 5;
		if (!inGoalYRange) return null;

		let side: 'left' | 'right' | null = null;
		if (x > 80) side = 'right';
		else if (x < 20) side = 'left';
		if (!side) return null;

		// Determine zone based on y position (relative to goal)
		const zoneHeight = goalHeight / 3;
		const topZoneEnd = goalY - goalHeight / 2 + zoneHeight;
		const bottomZoneStart = goalY + goalHeight / 2 - zoneHeight;

		let zone: GoalZone;
		if (y < topZoneEnd) {
			zone = 'left_post'; // Top of goal (left post from front view)
		} else if (y > bottomZoneStart) {
			zone = 'right_post'; // Bottom of goal (right post from front view)
		} else {
			zone = 'center';
		}

		return { side, zone };
	}

	// Get position for event target
	function getEventTargetPosition(event: typeof events[0]): { x: number; y: number } | null {
		if (event.type === 'shot') {
			// Shot target format: "side:zone" e.g. "right:center" or just "right" for backwards compatibility
			if (!event.to) return { x: rightGoalX, y: goalY }; // Default

			const parts = event.to.split(':');
			const side = parts[0] as 'left' | 'right';
			const zone = (parts[1] as GoalZone) || 'center';

			const targetX = side === 'left' ? leftGoalX : rightGoalX;
			const targetY = getGoalZoneY(zone);
			return { x: targetX, y: targetY };
		}
		if (event.to) {
			const pos = positions[event.to];
			if (pos) return { x: pos.x, y: pos.y };
		}
		return null;
	}

	// Get position for event source
	function getEventSourcePosition(event: typeof events[0]): { x: number; y: number } | null {
		const pos = positions[event.from];
		if (pos) return { x: pos.x, y: pos.y };
		return null;
	}

	// Curve dragging state
	let draggingCurve: { time: number; from: string } | null = $state(null);

	// Calculate curved path between two points
	function getCurvedPath(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		curve: number = 0
	): string {
		if (curve === 0) {
			return `M ${x1} ${y1} L ${x2} ${y2}`;
		}

		const { x: controlX, y: controlY } = getControlPoint(x1, y1, x2, y2, curve);
		return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
	}

	// Get control point for a curve
	function getControlPoint(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		curve: number
	): { x: number; y: number } {
		const midX = (x1 + x2) / 2;
		const midY = (y1 + y2) / 2;
		const dx = x2 - x1;
		const dy = y2 - y1;
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
	}

	// Calculate curve value from a control point position
	function getCurveFromControlPoint(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		cpX: number,
		cpY: number
	): number {
		const midX = (x1 + x2) / 2;
		const midY = (y1 + y2) / 2;
		const dx = x2 - x1;
		const dy = y2 - y1;
		const len = Math.sqrt(dx * dx + dy * dy);

		if (len === 0) return 0;

		// Perpendicular direction
		const perpX = -dy / len;
		const perpY = dx / len;

		// Project the control point offset onto the perpendicular
		const offsetX = cpX - midX;
		const offsetY = cpY - midY;
		const projectedOffset = offsetX * perpX + offsetY * perpY;

		// Convert back to curve value
		return Math.max(-1, Math.min(1, (projectedOffset / len) * 2));
	}

	// Start dragging a curve control point
	function startDraggingCurve(e: PointerEvent, event: typeof events[0]) {
		e.preventDefault();
		e.stopPropagation();
		draggingCurve = { time: event.time, from: event.from };
		(e.target as Element).setPointerCapture(e.pointerId);
	}

	// Delete an event
	function deleteEvent(event: typeof events[0]) {
		editorState.removeEvent(event.time, event.from);
	}

	// Generate unique clip path ID
	function getClipId(playerId: string): string {
		return `editor-clip-${playerId}`;
	}
</script>

<div class="relative w-full aspect-[100/65]">
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<svg
		bind:this={svgElement}
		viewBox="0 0 100 65"
		class="w-full h-full"
		class:cursor-crosshair={!isDrawingEvent}
		preserveAspectRatio="xMidYMid meet"
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointerleave={handlePointerUp}
		onclick={handlePitchClick}
	>
		<Pitch width={100} height={65}>
			<!-- Defs for markers, clips, and filters -->
			<defs>
				{#each players as player (player.id)}
					<clipPath id={getClipId(player.id)}>
						<circle cx="0" cy="0" r="2.5" />
					</clipPath>
				{/each}

				<!-- Glow filter for lines -->
				<filter id="line-glow" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="0.3" result="blur" />
					<feMerge>
						<feMergeNode in="blur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>

				<!-- Arrow marker for passes - sleeker design -->
				<marker id="arrow-pass" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
					<path d="M 0 2 L 8 5 L 0 8" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
				</marker>
				<!-- Arrow marker for shots - sleeker design -->
				<marker id="arrow-shot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
					<path d="M 0 2 L 8 5 L 0 8" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
				</marker>
				<!-- Arrow marker for drawing preview -->
				<marker id="arrow-drawing" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
					<path d="M 0 2 L 8 5 L 0 8" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
				</marker>
			</defs>

			<!-- Event lines for current keyframe -->
			{#each currentEvents as event (event.time + event.from + event.type)}
				{@const fromPos = getEventSourcePosition(event)}
				{@const toPos = getEventTargetPosition(event)}
				{#if fromPos && toPos}
					{@const curve = event.curve ?? 0}
					{@const curvePath = getCurvedPath(fromPos.x, fromPos.y, toPos.x, toPos.y, curve)}
					{@const controlPt = getControlPoint(fromPos.x, fromPos.y, toPos.x, toPos.y, curve)}
					{@const midX = (fromPos.x + toPos.x) / 2}
					{@const midY = (fromPos.y + toPos.y) / 2}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<g class="group">
						<!-- Curved/straight path -->
						<path
							d={curvePath}
							fill="none"
							stroke={event.type === 'shot' ? '#f97316' : '#3b82f6'}
							stroke-width="0.5"
							stroke-linecap="round"
							stroke-dasharray={event.type === 'shot' ? '1.5,1' : 'none'}
							marker-end={event.type === 'shot' ? 'url(#arrow-shot)' : 'url(#arrow-pass)'}
							filter="url(#line-glow)"
							opacity="0.85"
						/>
						<!-- Invisible wider path for easier clicking to delete -->
						<path
							d={curvePath}
							fill="none"
							stroke="transparent"
							stroke-width="3"
							class="cursor-pointer"
							onclick={() => deleteEvent(event)}
						/>
						<!-- Draggable curve control point -->
						<g
							transform="translate({curve === 0 ? midX : controlPt.x}, {curve === 0 ? midY : controlPt.y})"
							class="cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
							onpointerdown={(e) => startDraggingCurve(e, event)}
						>
							<circle cx="0" cy="0" r="1.8" fill="white" stroke={event.type === 'shot' ? '#f97316' : '#3b82f6'} stroke-width="0.3" />
							<circle cx="0" cy="0" r="0.6" fill={event.type === 'shot' ? '#f97316' : '#3b82f6'} />
							<title>Drag to curve the line</title>
						</g>
						<!-- Delete hint -->
						<title>Click line to delete {event.type} • Drag center to curve</title>
					</g>
				{/if}
			{/each}

			<!-- Drawing preview line (straight - user can curve after creating) -->
			{#if isDrawingEvent}
				{@const previewColor = snapTarget?.type === 'goal' ? '#f97316' : snapTarget?.type === 'player' ? '#3b82f6' : '#9ca3af'}
				{@const previewMarker = snapTarget?.type === 'goal' ? 'url(#arrow-shot)' : snapTarget?.type === 'player' ? 'url(#arrow-pass)' : 'url(#arrow-drawing)'}
				<line
					x1={drawStart.x}
					y1={drawStart.y}
					x2={drawEnd.x}
					y2={drawEnd.y}
					stroke={previewColor}
					stroke-width={snapTarget ? '0.6' : '0.4'}
					stroke-linecap="round"
					stroke-dasharray={snapTarget?.type === 'goal' ? '1.5,1' : snapTarget ? 'none' : '1.5,1'}
					marker-end={previewMarker}
					opacity={snapTarget ? '0.85' : '0.5'}
					class="pointer-events-none"
				/>
			{/if}

			<!-- Shot target zone indicators (when drawing) - both goals with 3 zones each -->
			{#if isDrawingEvent}
				{@const zoneHeight = (goalHeight + 6) / 3}
				{@const zones = ['left_post', 'center', 'right_post'] as const}
				{@const zoneLabels = ['', '', '']}

				<!-- Right goal zones -->
				{#each zones as zone, i}
					{@const isActive = snapTarget?.type === 'goal' && snapTarget.side === 'right' && snapTarget.zone === zone}
					<rect
						x="95"
						y={goalY - goalHeight / 2 - 3 + i * zoneHeight}
						width="5"
						height={zoneHeight}
						fill={isActive ? 'rgba(249, 115, 22, 0.5)' : 'rgba(249, 115, 22, 0.1)'}
						stroke="#f97316"
						stroke-width={isActive ? 0.6 : 0.2}
						rx="0.5"
						class="pointer-events-none"
					/>
				{/each}

				<!-- Left goal zones -->
				{#each zones as zone, i}
					{@const isActive = snapTarget?.type === 'goal' && snapTarget.side === 'left' && snapTarget.zone === zone}
					<rect
						x="0"
						y={goalY - goalHeight / 2 - 3 + i * zoneHeight}
						width="5"
						height={zoneHeight}
						fill={isActive ? 'rgba(249, 115, 22, 0.5)' : 'rgba(249, 115, 22, 0.1)'}
						stroke="#f97316"
						stroke-width={isActive ? 0.6 : 0.2}
						rx="0.5"
						class="pointer-events-none"
					/>
				{/each}
			{/if}

			<!-- Players -->
			{#each players as player (player.id)}
				{@const pos = positions[player.id]}
				{@const imageUrl = player.imageUrl}
				{@const playerHasBall = ballHolder === player.id}
				{@const isSnapTarget = snapTarget?.type === 'player' && snapTarget.id === player.id}
				{#if pos}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<g
						transform="translate({pos.x}, {pos.y})"
						class="cursor-grab active:cursor-grabbing"
						onpointerdown={(e) => handlePointerDown(e, player.id)}
					>
						<!-- Snap target highlight -->
						{#if isSnapTarget}
							<circle cx="0" cy="0" r="5" fill="none" stroke="#3b82f6" stroke-width="0.4" stroke-dasharray="1.5,0.5" />
							<circle cx="0" cy="0" r="4" fill="rgba(59, 130, 246, 0.25)" />
						{/if}

						<!-- Selection highlight (outer glow) -->
						{#if selectedId === player.id && !isSnapTarget}
							<circle cx="0" cy="0" r="3.5" fill="rgba(59, 130, 246, 0.3)" />
						{/if}

						<!-- Background circle -->
						<circle cx="0" cy="0" r="2.5" fill="#e5e7eb" />

						<!-- Player image (badge or flag) -->
						{#if imageUrl}
							<image
								href={imageUrl}
								x="-2.5"
								y="-2.5"
								width="5"
								height="5"
								clip-path="url(#{getClipId(player.id)})"
								preserveAspectRatio="xMidYMid slice"
							/>
						{/if}

						<!-- Border - blue for selected, white otherwise -->
						<circle
							cx="0"
							cy="0"
							r="2.5"
							fill="none"
							stroke={selectedId === player.id ? '#3b82f6' : 'white'}
							stroke-width={selectedId === player.id ? 0.5 : 0.3}
						/>

						<!-- Player label (shown if no image) -->
						{#if !imageUrl}
							<text
								x="0"
								y="0.5"
								text-anchor="middle"
								font-size="1.5"
								fill="#374151"
								class="pointer-events-none select-none"
							>
								{player.id.toUpperCase()}
							</text>
						{/if}
					</g>

					<!-- Draw event button for ball holder -->
					{#if playerHasBall}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<g
							transform="translate({pos.x + 3}, {pos.y - 3})"
							class="cursor-crosshair"
							onpointerdown={(e) => startDrawingEvent(e, player.id)}
						>
							<circle cx="0" cy="0" r="1.5" fill="#3b82f6" stroke="white" stroke-width="0.2" />
							<text x="0" y="0.4" text-anchor="middle" font-size="1.2" fill="white" class="pointer-events-none select-none">→</text>
							<title>Drag to draw pass or shot</title>
						</g>
					{/if}
				{/if}
			{/each}

			<!-- Ball -->
			{#if positions.ball}
				{@const ballPos = ballHolder && positions[ballHolder]
					? { x: positions[ballHolder].x + 2.5, y: positions[ballHolder].y + 2 }
					: { x: positions.ball.x, y: positions.ball.y }}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<g
					transform="translate({ballPos.x}, {ballPos.y})"
					class={ballHolder ? 'pointer-events-none' : 'cursor-grab active:cursor-grabbing'}
					onpointerdown={ballHolder ? undefined : (e) => handlePointerDown(e, 'ball')}
				>
					{#if draggingId === 'ball' && !ballHolder}
						<circle cx="0" cy="0" r="1.5" fill="none" stroke="#fbbf24" stroke-width="0.3" />
					{/if}
					<Ball x={0} y={0} />
				</g>
			{/if}
		</Pitch>
	</svg>

	<!-- Empty state overlay -->
	{#if players.length === 0}
		<div
			class="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-xl"
		>
			<div class="flex flex-col items-center gap-4 bg-surface/95 backdrop-blur-sm px-6 py-5 rounded-xl shadow-lg border border-border">
				<div class="flex flex-col items-center gap-1">
					<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
						<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
						<circle cx="9" cy="7" r="4"/>
						<path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
					</svg>
					<p class="text-text font-medium">Add your first player to begin</p>
				</div>

				{#if isAddingFirstPlayer}
					<FlagSelector
						onselect={(url) => addFirstPlayer(url)}
						oncancel={() => (isAddingFirstPlayer = false)}
						allowCustomUrl={false}
					/>
				{:else}
					<button
						onclick={() => (isAddingFirstPlayer = true)}
						class="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow flex items-center gap-2"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
						</svg>
						Add Player
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Legend -->
{#if players.length > 0}
	<div class="flex items-center gap-4 mt-2 text-xs text-text-muted">
		<div class="flex items-center gap-1.5">
			<div class="w-4 h-0.5 bg-blue-500"></div>
			<span>Pass</span>
		</div>
		<div class="flex items-center gap-1.5">
			<div class="w-4 h-0.5 bg-orange-500" style="background: repeating-linear-gradient(90deg, #f97316, #f97316 3px, transparent 3px, transparent 5px);"></div>
			<span>Shot</span>
		</div>
		<span class="text-text-muted/60">• Click line to delete • Hover line to drag curve • Ball holder: drag blue button to draw</span>
	</div>
{/if}
