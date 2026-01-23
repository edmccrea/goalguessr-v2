import type { AnimationData } from '$lib/server/db/schema';

// Sample animation: A club game showing player nationalities as clues
// This represents a passing sequence ending in a goal
export const sampleAnimation: AnimationData = {
	duration: 5000,
	pitch: { width: 100, height: 65 },
	players: [
		{ id: 'p1', imageUrl: 'https://flagcdn.com/w80/fr.png' }, // French player
		{ id: 'p2', imageUrl: 'https://flagcdn.com/w80/br.png' }, // Brazilian player
		{ id: 'p3', imageUrl: 'https://flagcdn.com/w80/ar.png' } // Argentine player
	],
	keyframes: [
		{
			time: 0,
			positions: {
				p1: { x: 50, y: 32 },
				p2: { x: 60, y: 45 },
				p3: { x: 70, y: 32 },
				ball: { x: 50, y: 32, holder: 'p1' }
			}
		},
		{
			time: 1500,
			positions: {
				p1: { x: 55, y: 30 },
				p2: { x: 70, y: 42 },
				p3: { x: 78, y: 30 },
				ball: { x: 70, y: 42, holder: 'p2' }
			}
		},
		{
			time: 3000,
			positions: {
				p1: { x: 60, y: 28 },
				p2: { x: 75, y: 40 },
				p3: { x: 85, y: 32 },
				ball: { x: 85, y: 32, holder: 'p3' }
			}
		},
		{
			time: 4500,
			positions: {
				p1: { x: 65, y: 26 },
				p2: { x: 78, y: 38 },
				p3: { x: 88, y: 32 },
				ball: { x: 99, y: 32 }
			}
		},
		{
			time: 5000,
			positions: {
				p1: { x: 68, y: 25 },
				p2: { x: 80, y: 36 },
				p3: { x: 90, y: 32 },
				ball: { x: 99, y: 32 }
			}
		}
	],
	events: [
		{ time: 1000, type: 'pass', from: 'p1', to: 'p2' },
		{ time: 2500, type: 'pass', from: 'p2', to: 'p3' },
		{ time: 4000, type: 'shot', from: 'p3', result: 'goal' }
	]
};
