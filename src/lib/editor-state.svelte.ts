import type { AnimationData } from '$lib/server/db/schema';

// Default empty animation template
function createEmptyAnimation(): AnimationData {
	return {
		duration: 5000,
		pitch: { width: 100, height: 65 },
		players: [],
		keyframes: [
			{
				time: 0,
				positions: {
					ball: { x: 50, y: 32.5 }
				}
			}
		],
		events: []
	};
}

// Editor state
let animation = $state<AnimationData>(createEmptyAnimation());
let selectedKeyframeIndex = $state<number>(0);
let selectedPlayerId = $state<string | null>(null);
let isPreviewMode = $state<boolean>(false);
let previewTime = $state<number>(0);

// Metadata for the goal (separate from animation data)
let metadata = $state({
	team: '',
	year: new Date().getFullYear(),
	scorer: '',
	competition: '',
	opponent: '',
	matchContext: '',
	videoUrl: '',
	isInternational: false
});

// Derived state
const currentKeyframe = $derived(animation.keyframes[selectedKeyframeIndex]);
const playerCount = $derived(animation.players.length);

// Get the ball holder at a given time based on events
function getBallHolderAtTime(time: number): string | undefined {
	// First player starts with the ball
	let holder: string | undefined = animation.players[0]?.id;

	// Walk through events in order to determine holder at this time
	// Events at the current time represent transitions that happen DURING that keyframe,
	// so the effect only shows in subsequent keyframes (use >= to exclude current time)
	for (const event of animation.events) {
		if (event.time >= time) break;

		if (event.type === 'pass' && event.to) {
			holder = event.to;
		} else if (event.type === 'shot') {
			holder = undefined;
		}
	}

	return holder;
}

// Recalculate ball holders across all keyframes based on events
function recalculateBallHolders() {
	animation.keyframes = animation.keyframes.map((kf) => {
		const holder = getBallHolderAtTime(kf.time);
		const holderPos = holder ? kf.positions[holder] : null;

		return {
			...kf,
			positions: {
				...kf.positions,
				ball: {
					// If there's a holder, ball follows them; otherwise keep current position
					x: holderPos?.x ?? kf.positions.ball?.x ?? 50,
					y: holderPos?.y ?? kf.positions.ball?.y ?? 32.5,
					holder
				}
			}
		};
	});
}

// Add a player
function addPlayer(imageUrl?: string): string {
	const id = `p${animation.players.length + 1}`;
	const isFirstPlayer = animation.players.length === 0;

	animation.players = [...animation.players, { id, imageUrl }];

	// Add initial position for this player in all keyframes
	const defaultPosition = getDefaultPosition(animation.players.length - 1);
	animation.keyframes = animation.keyframes.map((kf) => ({
		...kf,
		positions: {
			...kf.positions,
			[id]: defaultPosition
		}
	}));

	// First player automatically gets the ball
	if (isFirstPlayer) {
		recalculateBallHolders();
	}

	return id;
}

// Get default position - spread players across the attacking half
function getDefaultPosition(index: number): { x: number; y: number } {
	// Spread players in a formation-like pattern on the right side of the pitch
	const positions = [
		{ x: 70, y: 32.5 }, // Center
		{ x: 60, y: 20 }, // Top left
		{ x: 60, y: 45 }, // Bottom left
		{ x: 75, y: 15 }, // Top right
		{ x: 75, y: 50 }, // Bottom right
		{ x: 55, y: 32.5 } // Far left center
	];
	return positions[index % positions.length];
}

// Remove a player
function removePlayer(playerId: string) {
	animation.players = animation.players.filter((p) => p.id !== playerId);

	// Remove from all keyframe positions
	animation.keyframes = animation.keyframes.map((kf) => {
		const { [playerId]: _, ...rest } = kf.positions;
		return { ...kf, positions: rest };
	});

	// Remove events involving this player
	animation.events = animation.events.filter((e) => e.from !== playerId && e.to !== playerId);

	// Recalculate ball holders (first remaining player gets ball, or no holder if no players)
	recalculateBallHolders();

	if (selectedPlayerId === playerId) {
		selectedPlayerId = null;
	}
}

// Set player image URL (badge or flag)
function setPlayerImageUrl(playerId: string, imageUrl: string | undefined) {
	animation.players = animation.players.map((p) =>
		p.id === playerId ? { ...p, imageUrl } : p
	);
}

// Update player position in current keyframe
function updatePlayerPosition(playerId: string, x: number, y: number) {
	const kf = animation.keyframes[selectedKeyframeIndex];
	if (kf) {
		const clampedX = Math.max(0, Math.min(100, x));
		const clampedY = Math.max(0, Math.min(65, y));

		kf.positions[playerId] = {
			...kf.positions[playerId],
			x: clampedX,
			y: clampedY
		};

		// If this player has the ball, move the ball with them
		if (kf.positions.ball?.holder === playerId) {
			kf.positions.ball = {
				...kf.positions.ball,
				x: clampedX,
				y: clampedY
			};
		}
	}
}

// Update ball position (only used when ball has no holder, e.g., after a shot)
function updateBallPosition(x: number, y: number, holder?: string) {
	const kf = animation.keyframes[selectedKeyframeIndex];
	if (kf) {
		kf.positions.ball = {
			x: Math.max(0, Math.min(100, x)),
			y: Math.max(0, Math.min(65, y)),
			holder
		};
	}
}

// Add a keyframe
function addKeyframe(time?: number) {
	const newTime = time ?? animation.duration / 2;

	// Find insert position
	let insertIndex = animation.keyframes.findIndex((kf) => kf.time > newTime);
	if (insertIndex === -1) insertIndex = animation.keyframes.length;

	// Copy positions from previous keyframe
	const prevKf = animation.keyframes[Math.max(0, insertIndex - 1)];
	const newKeyframe = {
		time: newTime,
		positions: JSON.parse(JSON.stringify(prevKf.positions))
	};

	animation.keyframes = [
		...animation.keyframes.slice(0, insertIndex),
		newKeyframe,
		...animation.keyframes.slice(insertIndex)
	];

	// Recalculate ball holders to set correct holder for new keyframe
	recalculateBallHolders();

	selectedKeyframeIndex = insertIndex;
}

// Remove a keyframe (cannot remove first one)
function removeKeyframe(index: number) {
	if (index === 0 || animation.keyframes.length <= 1) return;

	// Get the time BEFORE filtering so we can remove associated events
	const removedTime = animation.keyframes[index]?.time;

	animation.keyframes = animation.keyframes.filter((_, i) => i !== index);

	// Remove events at this keyframe time
	if (removedTime !== undefined) {
		animation.events = animation.events.filter((e) => e.time !== removedTime);
	}

	if (selectedKeyframeIndex >= animation.keyframes.length) {
		selectedKeyframeIndex = animation.keyframes.length - 1;
	}
}

// Update keyframe time
function updateKeyframeTime(index: number, time: number) {
	if (index === 0) return; // First keyframe always at 0

	const oldTime = animation.keyframes[index].time;
	const clampedTime = Math.max(0, Math.min(animation.duration, time));
	animation.keyframes[index].time = clampedTime;

	// Update events that were at the old time to use the new time
	animation.events = animation.events.map((e) =>
		e.time === oldTime ? { ...e, time: clampedTime } : e
	);

	// Re-sort keyframes by time
	const sorted = [...animation.keyframes].sort((a, b) => a.time - b.time);
	const newIndex = sorted.findIndex((kf) => kf === animation.keyframes[index]);
	animation.keyframes = sorted;
	selectedKeyframeIndex = newIndex;

	// Re-sort events by time
	animation.events = [...animation.events].sort((a, b) => a.time - b.time);
}

// Add an event (pass or shot)
function addEvent(type: 'pass' | 'shot', from: string, to?: string) {
	const time = currentKeyframe?.time ?? 0;

	// Remove any existing event at this time from the same player
	animation.events = animation.events.filter((e) => !(e.time === time && e.from === from));

	const event: AnimationData['events'][0] = {
		time,
		type,
		from
	};

	if (type === 'pass' && to) {
		event.to = to;
	} else if (type === 'shot') {
		event.result = 'goal';
		if (to) {
			event.to = to; // Store target goal side and zone (e.g., "left:center")
		}
	}

	animation.events = [...animation.events, event].sort((a, b) => a.time - b.time);

	// Recalculate ball holders based on new event timeline
	recalculateBallHolders();
}

// Remove an event
function removeEvent(time: number, from: string) {
	animation.events = animation.events.filter((e) => !(e.time === time && e.from === from));

	// Recalculate ball holders based on updated event timeline
	recalculateBallHolders();
}

// Update event curve
function updateEventCurve(time: number, from: string, curve: number) {
	animation.events = animation.events.map((e) =>
		e.time === time && e.from === from ? { ...e, curve } : e
	);
}

// Set animation duration
function setDuration(ms: number) {
	animation.duration = Math.max(1000, Math.min(30000, ms));

	// Clamp keyframe times
	animation.keyframes = animation.keyframes.map((kf) => ({
		...kf,
		time: Math.min(kf.time, animation.duration)
	}));

	// Clamp event times
	animation.events = animation.events.map((e) => ({
		...e,
		time: Math.min(e.time, animation.duration)
	}));
}

// Reset to empty animation
function reset() {
	animation = createEmptyAnimation();
	selectedKeyframeIndex = 0;
	selectedPlayerId = null;
	isPreviewMode = false;
	previewTime = 0;
	metadata = {
		team: '',
		year: new Date().getFullYear(),
		scorer: '',
		competition: '',
		opponent: '',
		matchContext: '',
		videoUrl: '',
		isInternational: false
	};
}

// Load existing animation
function loadAnimation(data: AnimationData) {
	animation = JSON.parse(JSON.stringify(data));
	selectedKeyframeIndex = 0;
	selectedPlayerId = null;
	isPreviewMode = false;
	previewTime = 0;
}

// Load a full goal (animation + metadata) for editing
function loadGoal(goal: {
	team: string;
	year: number;
	scorer: string;
	competition: string | null;
	opponent: string | null;
	matchContext: string | null;
	videoUrl: string | null;
	isInternational: boolean | null;
	animationData: AnimationData;
}) {
	loadAnimation(goal.animationData);
	metadata = {
		team: goal.team,
		year: goal.year,
		scorer: goal.scorer,
		competition: goal.competition ?? '',
		opponent: goal.opponent ?? '',
		matchContext: goal.matchContext ?? '',
		videoUrl: goal.videoUrl ?? '',
		isInternational: goal.isInternational ?? false
	};
}

// Get animation data for saving
function getAnimationData(): AnimationData {
	return JSON.parse(JSON.stringify(animation));
}

// Validate that animation is complete enough to submit
function validate(): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (animation.players.length === 0) {
		errors.push('Add at least one player');
	}

	if (animation.keyframes.length < 2) {
		errors.push('Add at least 2 keyframes');
	}

	if (!animation.events.some((e) => e.type === 'shot')) {
		errors.push('Add a shot event');
	}

	if (!metadata.team.trim()) {
		errors.push('Enter the team name');
	}

	if (!metadata.scorer.trim()) {
		errors.push('Enter the goalscorer name');
	}

	if (metadata.year < 1900 || metadata.year > new Date().getFullYear() + 1) {
		errors.push('Enter a valid year');
	}

	if (!metadata.competition.trim()) {
		errors.push('Enter the competition');
	}

	if (!metadata.opponent.trim()) {
		errors.push('Enter the opponent');
	}

	return {
		valid: errors.length === 0,
		errors
	};
}

// Export editor state and functions
export const editorState = {
	get animation() {
		return animation;
	},
	get selectedKeyframeIndex() {
		return selectedKeyframeIndex;
	},
	set selectedKeyframeIndex(value: number) {
		selectedKeyframeIndex = value;
	},
	get selectedPlayerId() {
		return selectedPlayerId;
	},
	set selectedPlayerId(value: string | null) {
		selectedPlayerId = value;
	},
	get isPreviewMode() {
		return isPreviewMode;
	},
	set isPreviewMode(value: boolean) {
		isPreviewMode = value;
	},
	get previewTime() {
		return previewTime;
	},
	set previewTime(value: number) {
		previewTime = value;
	},
	get metadata() {
		return metadata;
	},
	get currentKeyframe() {
		return currentKeyframe;
	},
	get playerCount() {
		return playerCount;
	},

	// Actions
	addPlayer,
	removePlayer,
	setPlayerImageUrl,
	updatePlayerPosition,
	updateBallPosition,
	addKeyframe,
	removeKeyframe,
	updateKeyframeTime,
	addEvent,
	removeEvent,
	updateEventCurve,
	setDuration,
	reset,
	loadAnimation,
	loadGoal,
	getAnimationData,
	validate
};
