import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { goals } from '../src/lib/server/db/schema';
import type { AnimationData } from '../src/lib/server/db/schema';
import { nanoid } from 'nanoid';

// Use local.db directly for seeding
const client = createClient({
	url: 'file:local.db'
});

const db = drizzle(client);

// Flag URL helper
const flag = (code: string) => `https://flagcdn.com/w80/${code}.png`;

// Famous club goals data
const famousGoals: Array<{
	team: string;
	year: number;
	scorer: string;
	competition: string;
	opponent: string;
	matchContext: string;
	videoUrl: string;
	animationData: AnimationData;
}> = [
	// 1. Aguero vs QPR - 93:20 - Premier League title winner
	// Man City attacking RIGHT to LEFT (second half at Etihad)
	{
		team: 'Manchester City',
		year: 2012,
		scorer: 'Sergio Aguero',
		competition: 'Premier League',
		opponent: 'Queens Park Rangers',
		matchContext: '93rd minute winner to clinch the title on goal difference',
		videoUrl: 'https://www.youtube.com/watch?v=81bv_gF4j5k',
		animationData: {
			duration: 4000,
			pitch: { width: 100, height: 65 },
			players: [
				{ id: 'p1', imageUrl: flag('ar') }, // Aguero
				{ id: 'p2', imageUrl: flag('ba') }, // Dzeko
				{ id: 'p3', imageUrl: flag('it') }  // Balotelli
			],
			keyframes: [
				{
					time: 0,
					positions: {
						p1: { x: 35, y: 32 },
						p2: { x: 20, y: 25 },
						p3: { x: 25, y: 40 },
						ball: { x: 20, y: 25, holder: 'p2' }
					}
				},
				{
					time: 1500,
					positions: {
						p1: { x: 22, y: 32 },
						p2: { x: 18, y: 28 },
						p3: { x: 20, y: 45 },
						ball: { x: 22, y: 32, holder: 'p1' }
					}
				},
				{
					time: 2500,
					positions: {
						p1: { x: 12, y: 35 },
						p2: { x: 15, y: 25 },
						p3: { x: 18, y: 48 },
						ball: { x: 12, y: 35, holder: 'p1' }
					}
				},
				{
					time: 4000,
					positions: {
						p1: { x: 8, y: 38 },
						p2: { x: 12, y: 25 },
						p3: { x: 15, y: 50 },
						ball: { x: 0, y: 35 }
					}
				}
			],
			events: [
				{ time: 0, type: 'pass', from: 'p2', to: 'p1' },
				{ time: 2500, type: 'shot', from: 'p1', to: 'left:center', result: 'goal' }
			]
		}
	},

	// 2. Solskjaer vs Bayern Munich - 1999 UCL Final
	// Man United attacking LEFT to RIGHT at Camp Nou
	{
		team: 'Manchester United',
		year: 1999,
		scorer: 'Ole Gunnar Solskjaer',
		competition: 'UEFA Champions League',
		opponent: 'Bayern Munich',
		matchContext: '93rd minute winner in the Champions League Final',
		videoUrl: 'https://www.youtube.com/watch?v=uf3XZaqa4X4',
		animationData: {
			duration: 3500,
			pitch: { width: 100, height: 65 },
			players: [
				{ id: 'p1', imageUrl: flag('no') }, // Solskjaer
				{ id: 'p2', imageUrl: flag('gb-eng') }, // Beckham
				{ id: 'p3', imageUrl: flag('ie') }  // Sheringham
			],
			keyframes: [
				{
					time: 0,
					positions: {
						p1: { x: 75, y: 38 },
						p2: { x: 95, y: 55 }, // Corner position
						p3: { x: 80, y: 30 },
						ball: { x: 95, y: 55, holder: 'p2' }
					}
				},
				{
					time: 1200,
					positions: {
						p1: { x: 82, y: 35 },
						p2: { x: 92, y: 52 },
						p3: { x: 85, y: 28 },
						ball: { x: 85, y: 28, holder: 'p3' }
					}
				},
				{
					time: 2200,
					positions: {
						p1: { x: 90, y: 33 },
						p2: { x: 88, y: 48 },
						p3: { x: 82, y: 25 },
						ball: { x: 90, y: 33, holder: 'p1' }
					}
				},
				{
					time: 3500,
					positions: {
						p1: { x: 92, y: 34 },
						p2: { x: 85, y: 45 },
						p3: { x: 80, y: 28 },
						ball: { x: 100, y: 32 }
					}
				}
			],
			events: [
				{ time: 0, type: 'pass', from: 'p2', to: 'p3', curve: 0.3 },
				{ time: 1200, type: 'pass', from: 'p3', to: 'p1' },
				{ time: 2200, type: 'shot', from: 'p1', to: 'right:center', result: 'goal' }
			]
		}
	},

	// 3. Steven Gerrard vs Olympiacos - 2004 UCL Group Stage
	// Liverpool attacking RIGHT to LEFT (towards the Kop)
	{
		team: 'Liverpool',
		year: 2004,
		scorer: 'Steven Gerrard',
		competition: 'UEFA Champions League',
		opponent: 'Olympiacos',
		matchContext: 'Last minute goal needed to qualify from group stage',
		videoUrl: 'https://www.youtube.com/watch?v=QkpSvgN3NJk',
		animationData: {
			duration: 3500,
			pitch: { width: 100, height: 65 },
			players: [
				{ id: 'p1', imageUrl: flag('gb-eng') }, // Gerrard
				{ id: 'p2', imageUrl: flag('gb-eng') }, // Mellor
				{ id: 'p3', imageUrl: flag('fi') }  // Riise
			],
			keyframes: [
				{
					time: 0,
					positions: {
						p1: { x: 40, y: 32 },
						p2: { x: 15, y: 28 },
						p3: { x: 25, y: 50 },
						ball: { x: 15, y: 28, holder: 'p2' }
					}
				},
				{
					time: 1500,
					positions: {
						p1: { x: 32, y: 35 },
						p2: { x: 12, y: 25 },
						p3: { x: 22, y: 48 },
						ball: { x: 32, y: 35, holder: 'p1' }
					}
				},
				{
					time: 3500,
					positions: {
						p1: { x: 28, y: 38 },
						p2: { x: 10, y: 22 },
						p3: { x: 18, y: 45 },
						ball: { x: 0, y: 32 }
					}
				}
			],
			events: [
				{ time: 0, type: 'pass', from: 'p2', to: 'p1' },
				{ time: 1500, type: 'shot', from: 'p1', to: 'left:center', result: 'goal' }
			]
		}
	},

	// 4. Demba Ba vs Liverpool - 2014 (Gerrard slip)
	// Chelsea attacking LEFT to RIGHT at Anfield
	{
		team: 'Chelsea',
		year: 2014,
		scorer: 'Demba Ba',
		competition: 'Premier League',
		opponent: 'Liverpool',
		matchContext: 'Capitalizing on Steven Gerrard slip in title race',
		videoUrl: 'https://www.youtube.com/watch?v=reWOtFcmmE4',
		animationData: {
			duration: 4000,
			pitch: { width: 100, height: 65 },
			players: [
				{ id: 'p1', imageUrl: flag('sn') }, // Demba Ba
				{ id: 'p2', imageUrl: flag('gb-eng') }  // Gerrard (slipping)
			],
			keyframes: [
				{
					time: 0,
					positions: {
						p1: { x: 55, y: 32 },
						p2: { x: 48, y: 35 },
						ball: { x: 48, y: 35, holder: 'p2' }
					}
				},
				{
					time: 1000,
					positions: {
						p1: { x: 52, y: 32 },
						p2: { x: 50, y: 38 }, // Slipping
						ball: { x: 52, y: 32, holder: 'p1' }
					}
				},
				{
					time: 2500,
					positions: {
						p1: { x: 78, y: 32 },
						p2: { x: 55, y: 40 },
						ball: { x: 78, y: 32, holder: 'p1' }
					}
				},
				{
					time: 4000,
					positions: {
						p1: { x: 88, y: 35 },
						p2: { x: 65, y: 42 },
						ball: { x: 100, y: 34 }
					}
				}
			],
			events: [
				{ time: 1000, type: 'pass', from: 'p2', to: 'p1' }, // "Pass" = steal
				{ time: 2500, type: 'shot', from: 'p1', to: 'right:right_post', result: 'goal' }
			]
		}
	},

	// 5. Lionel Messi vs Real Madrid - 2017 El Clasico
	// Barcelona attacking RIGHT to LEFT at Bernabeu
	{
		team: 'Barcelona',
		year: 2017,
		scorer: 'Lionel Messi',
		competition: 'La Liga',
		opponent: 'Real Madrid',
		matchContext: '92nd minute winner at the Bernabeu, shirt celebration',
		videoUrl: 'https://www.youtube.com/watch?v=mzyFMVrLqoA',
		animationData: {
			duration: 5000,
			pitch: { width: 100, height: 65 },
			players: [
				{ id: 'p1', imageUrl: flag('ar') }, // Messi
				{ id: 'p2', imageUrl: flag('es') }, // Jordi Alba
				{ id: 'p3', imageUrl: flag('br') }  // Neymar
			],
			keyframes: [
				{
					time: 0,
					positions: {
						p1: { x: 45, y: 32 },
						p2: { x: 30, y: 55 },
						p3: { x: 35, y: 20 },
						ball: { x: 35, y: 20, holder: 'p3' }
					}
				},
				{
					time: 1500,
					positions: {
						p1: { x: 38, y: 35 },
						p2: { x: 25, y: 50 },
						p3: { x: 30, y: 25 },
						ball: { x: 38, y: 35, holder: 'p1' }
					}
				},
				{
					time: 2500,
					positions: {
						p1: { x: 28, y: 38 },
						p2: { x: 18, y: 48 },
						p3: { x: 22, y: 28 },
						ball: { x: 18, y: 48, holder: 'p2' }
					}
				},
				{
					time: 3800,
					positions: {
						p1: { x: 15, y: 35 },
						p2: { x: 12, y: 45 },
						p3: { x: 18, y: 25 },
						ball: { x: 15, y: 35, holder: 'p1' }
					}
				},
				{
					time: 5000,
					positions: {
						p1: { x: 10, y: 36 },
						p2: { x: 10, y: 42 },
						p3: { x: 15, y: 28 },
						ball: { x: 0, y: 34 }
					}
				}
			],
			events: [
				{ time: 0, type: 'pass', from: 'p3', to: 'p1' },
				{ time: 1500, type: 'pass', from: 'p1', to: 'p2' },
				{ time: 2500, type: 'pass', from: 'p2', to: 'p1' },
				{ time: 3800, type: 'shot', from: 'p1', to: 'left:right_post', result: 'goal' }
			]
		}
	},

	// 6. Sergio Ramos header vs Atletico Madrid - 2014 UCL Final
	// Real Madrid attacking LEFT to RIGHT
	{
		team: 'Real Madrid',
		year: 2014,
		scorer: 'Sergio Ramos',
		competition: 'UEFA Champions League',
		opponent: 'Atletico Madrid',
		matchContext: '93rd minute equalizer in Champions League Final, La Decima',
		videoUrl: 'https://www.youtube.com/watch?v=BUdBXfI9Vj8',
		animationData: {
			duration: 3500,
			pitch: { width: 100, height: 65 },
			players: [
				{ id: 'p1', imageUrl: flag('es') }, // Ramos
				{ id: 'p2', imageUrl: flag('hr') }, // Modric (corner taker)
				{ id: 'p3', imageUrl: flag('fr') }  // Benzema
			],
			keyframes: [
				{
					time: 0,
					positions: {
						p1: { x: 82, y: 35 },
						p2: { x: 95, y: 58 }, // Corner
						p3: { x: 78, y: 28 },
						ball: { x: 95, y: 58, holder: 'p2' }
					}
				},
				{
					time: 1800,
					positions: {
						p1: { x: 88, y: 32 },
						p2: { x: 90, y: 50 },
						p3: { x: 82, y: 25 },
						ball: { x: 88, y: 32, holder: 'p1' }
					}
				},
				{
					time: 3500,
					positions: {
						p1: { x: 90, y: 33 },
						p2: { x: 85, y: 45 },
						p3: { x: 80, y: 28 },
						ball: { x: 100, y: 30 }
					}
				}
			],
			events: [
				{ time: 0, type: 'pass', from: 'p2', to: 'p1', curve: 0.4 },
				{ time: 1800, type: 'shot', from: 'p1', to: 'right:left_post', result: 'goal' }
			]
		}
	},

	// 7. Divock Origi vs Barcelona - 2019 UCL Semi (Corner taken quickly)
	// Liverpool attacking RIGHT to LEFT (towards the Kop)
	{
		team: 'Liverpool',
		year: 2019,
		scorer: 'Divock Origi',
		competition: 'UEFA Champions League',
		opponent: 'Barcelona',
		matchContext: 'Corner taken quickly! 4-0 comeback from first leg',
		videoUrl: 'https://www.youtube.com/watch?v=kwqaAg8VZOM',
		animationData: {
			duration: 2500,
			pitch: { width: 100, height: 65 },
			players: [
				{ id: 'p1', imageUrl: flag('be') }, // Origi
				{ id: 'p2', imageUrl: flag('gb-eng') }  // Alexander-Arnold
			],
			keyframes: [
				{
					time: 0,
					positions: {
						p1: { x: 12, y: 38 },
						p2: { x: 5, y: 58 }, // Corner
						ball: { x: 5, y: 58, holder: 'p2' }
					}
				},
				{
					time: 1200,
					positions: {
						p1: { x: 10, y: 35 },
						p2: { x: 8, y: 52 },
						ball: { x: 10, y: 35, holder: 'p1' }
					}
				},
				{
					time: 2500,
					positions: {
						p1: { x: 8, y: 36 },
						p2: { x: 12, y: 48 },
						ball: { x: 0, y: 34 }
					}
				}
			],
			events: [
				{ time: 0, type: 'pass', from: 'p2', to: 'p1' },
				{ time: 1200, type: 'shot', from: 'p1', to: 'left:center', result: 'goal' }
			]
		}
	},

	// 8. Wayne Rooney bicycle kick vs Man City - 2011
	// Man United attacking LEFT to RIGHT at Old Trafford
	{
		team: 'Manchester United',
		year: 2011,
		scorer: 'Wayne Rooney',
		competition: 'Premier League',
		opponent: 'Manchester City',
		matchContext: 'Stunning bicycle kick in Manchester derby',
		videoUrl: 'https://www.youtube.com/watch?v=kS2Qzj6bv_Y',
		animationData: {
			duration: 3000,
			pitch: { width: 100, height: 65 },
			players: [
				{ id: 'p1', imageUrl: flag('gb-eng') }, // Rooney
				{ id: 'p2', imageUrl: flag('pt') }  // Nani (cross)
			],
			keyframes: [
				{
					time: 0,
					positions: {
						p1: { x: 82, y: 32 },
						p2: { x: 90, y: 55 }, // Wide right
						ball: { x: 90, y: 55, holder: 'p2' }
					}
				},
				{
					time: 1500,
					positions: {
						p1: { x: 88, y: 33 },
						p2: { x: 85, y: 50 },
						ball: { x: 88, y: 33, holder: 'p1' }
					}
				},
				{
					time: 3000,
					positions: {
						p1: { x: 90, y: 34 },
						p2: { x: 82, y: 45 },
						ball: { x: 100, y: 30 }
					}
				}
			],
			events: [
				{ time: 0, type: 'pass', from: 'p2', to: 'p1', curve: 0.3 },
				{ time: 1500, type: 'shot', from: 'p1', to: 'right:left_post', result: 'goal' }
			]
		}
	},

	// 9. Thierry Henry vs Liverpool - 2004 (The turn and finish)
	// Arsenal attacking LEFT to RIGHT at Highbury
	{
		team: 'Arsenal',
		year: 2004,
		scorer: 'Thierry Henry',
		competition: 'Premier League',
		opponent: 'Liverpool',
		matchContext: 'Iconic turn and curling finish at Highbury',
		videoUrl: 'https://www.youtube.com/watch?v=yP9vVncHhc0',
		animationData: {
			duration: 4000,
			pitch: { width: 100, height: 65 },
			players: [
				{ id: 'p1', imageUrl: flag('fr') }, // Henry
				{ id: 'p2', imageUrl: flag('nl') }, // Bergkamp
				{ id: 'p3', imageUrl: flag('es') }  // Reyes
			],
			keyframes: [
				{
					time: 0,
					positions: {
						p1: { x: 65, y: 32 },
						p2: { x: 55, y: 25 },
						p3: { x: 70, y: 50 },
						ball: { x: 55, y: 25, holder: 'p2' }
					}
				},
				{
					time: 1200,
					positions: {
						p1: { x: 72, y: 35 },
						p2: { x: 60, y: 28 },
						p3: { x: 75, y: 48 },
						ball: { x: 72, y: 35, holder: 'p1' }
					}
				},
				{
					time: 2200,
					positions: {
						p1: { x: 78, y: 38 },
						p2: { x: 68, y: 30 },
						p3: { x: 80, y: 45 },
						ball: { x: 78, y: 38, holder: 'p1' }
					}
				},
				{
					time: 4000,
					positions: {
						p1: { x: 82, y: 40 },
						p2: { x: 75, y: 32 },
						p3: { x: 85, y: 42 },
						ball: { x: 100, y: 28 }
					}
				}
			],
			events: [
				{ time: 0, type: 'pass', from: 'p2', to: 'p1' },
				{ time: 2200, type: 'shot', from: 'p1', to: 'right:left_post', result: 'goal', curve: -0.3 }
			]
		}
	},

	// 10. Robin van Persie volley vs Charlton - 2006
	// Arsenal attacking RIGHT to LEFT at Highbury (other end)
	{
		team: 'Arsenal',
		year: 2006,
		scorer: 'Robin van Persie',
		competition: 'Premier League',
		opponent: 'Charlton Athletic',
		matchContext: 'Stunning volley in the last season at Highbury',
		videoUrl: 'https://www.youtube.com/watch?v=ai3mTF5N1G8',
		animationData: {
			duration: 3500,
			pitch: { width: 100, height: 65 },
			players: [
				{ id: 'p1', imageUrl: flag('nl') }, // Van Persie
				{ id: 'p2', imageUrl: flag('fr') }  // Henry (cross)
			],
			keyframes: [
				{
					time: 0,
					positions: {
						p1: { x: 28, y: 32 },
						p2: { x: 12, y: 52 }, // Wide left
						ball: { x: 12, y: 52, holder: 'p2' }
					}
				},
				{
					time: 1800,
					positions: {
						p1: { x: 22, y: 35 },
						p2: { x: 15, y: 48 },
						ball: { x: 22, y: 35, holder: 'p1' }
					}
				},
				{
					time: 3500,
					positions: {
						p1: { x: 18, y: 36 },
						p2: { x: 20, y: 42 },
						ball: { x: 0, y: 28 }
					}
				}
			],
			events: [
				{ time: 0, type: 'pass', from: 'p2', to: 'p1', curve: 0.3 },
				{ time: 1800, type: 'shot', from: 'p1', to: 'left:left_post', result: 'goal' }
			]
		}
	}
];

async function seedGoals() {
	console.log('Seeding famous goals...');

	for (const goal of famousGoals) {
		const id = nanoid();
		await db.insert(goals).values({
			id,
			team: goal.team,
			year: goal.year,
			scorer: goal.scorer,
			competition: goal.competition,
			opponent: goal.opponent,
			matchContext: goal.matchContext,
			videoUrl: goal.videoUrl,
			isInternational: false,
			animationData: goal.animationData,
			status: 'approved'
		});
		console.log(`✓ Added: ${goal.scorer} vs ${goal.opponent} (${goal.year})`);
	}

	console.log('\nDone! Added 10 famous club goals.');
}

seedGoals().catch(console.error);
