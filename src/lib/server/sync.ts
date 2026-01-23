import { db } from './db';
import { teams, teamAliases, players, playerAliases, playerTeams, syncLogs } from './db/schema';
import { eq } from 'drizzle-orm';

function generateId(): string {
	return crypto.randomUUID();
}

// Sample data for testing without API
const SAMPLE_TEAMS = [
	{
		name: 'Manchester United',
		shortName: 'Man Utd',
		code: 'MUN',
		country: 'England',
		aliases: ['man u', 'manu', 'mufc', 'red devils', 'united']
	},
	{
		name: 'Manchester City',
		shortName: 'Man City',
		code: 'MCI',
		country: 'England',
		aliases: ['city', 'mcfc', 'cityzens']
	},
	{
		name: 'Liverpool',
		shortName: 'Liverpool',
		code: 'LIV',
		country: 'England',
		aliases: ['lfc', 'reds', 'pool']
	},
	{
		name: 'Chelsea',
		shortName: 'Chelsea',
		code: 'CHE',
		country: 'England',
		aliases: ['cfc', 'blues']
	},
	{
		name: 'Arsenal',
		shortName: 'Arsenal',
		code: 'ARS',
		country: 'England',
		aliases: ['gunners', 'afc']
	},
	{
		name: 'Tottenham Hotspur',
		shortName: 'Spurs',
		code: 'TOT',
		country: 'England',
		aliases: ['tottenham', 'spurs', 'thfc']
	},
	{
		name: 'Real Madrid',
		shortName: 'Real Madrid',
		code: 'RMA',
		country: 'Spain',
		aliases: ['real', 'rmcf', 'los blancos']
	},
	{
		name: 'Barcelona',
		shortName: 'Barcelona',
		code: 'BAR',
		country: 'Spain',
		aliases: ['barca', 'fcb', 'blaugrana']
	},
	{
		name: 'Bayern Munich',
		shortName: 'Bayern',
		code: 'BAY',
		country: 'Germany',
		aliases: ['bayern', 'bayern munchen', 'fcb munich']
	},
	{
		name: 'Juventus',
		shortName: 'Juventus',
		code: 'JUV',
		country: 'Italy',
		aliases: ['juve', 'old lady']
	},
	{
		name: 'AC Milan',
		shortName: 'Milan',
		code: 'ACM',
		country: 'Italy',
		aliases: ['milan', 'rossoneri']
	},
	{
		name: 'Inter Milan',
		shortName: 'Inter',
		code: 'INT',
		country: 'Italy',
		aliases: ['inter', 'internazionale']
	},
	{
		name: 'Paris Saint-Germain',
		shortName: 'PSG',
		code: 'PSG',
		country: 'France',
		aliases: ['psg', 'paris', 'paris sg']
	},
	{
		name: 'Borussia Dortmund',
		shortName: 'Dortmund',
		code: 'BVB',
		country: 'Germany',
		aliases: ['dortmund', 'bvb']
	},
	// National teams
	{
		name: 'Argentina',
		shortName: 'Argentina',
		code: 'ARG',
		country: 'Argentina',
		isNationalTeam: true,
		aliases: ['albiceleste']
	},
	{
		name: 'Brazil',
		shortName: 'Brazil',
		code: 'BRA',
		country: 'Brazil',
		isNationalTeam: true,
		aliases: ['brasil', 'selecao']
	},
	{
		name: 'Germany',
		shortName: 'Germany',
		code: 'GER',
		country: 'Germany',
		isNationalTeam: true,
		aliases: ['deutschland', 'die mannschaft']
	},
	{
		name: 'France',
		shortName: 'France',
		code: 'FRA',
		country: 'France',
		isNationalTeam: true,
		aliases: ['les bleus']
	},
	{
		name: 'England',
		shortName: 'England',
		code: 'ENG',
		country: 'England',
		isNationalTeam: true,
		aliases: ['three lions']
	},
	{
		name: 'Spain',
		shortName: 'Spain',
		code: 'ESP',
		country: 'Spain',
		isNationalTeam: true,
		aliases: ['la roja']
	},
	{
		name: 'Italy',
		shortName: 'Italy',
		code: 'ITA',
		country: 'Italy',
		isNationalTeam: true,
		aliases: ['azzurri']
	},
	{
		name: 'Netherlands',
		shortName: 'Netherlands',
		code: 'NED',
		country: 'Netherlands',
		isNationalTeam: true,
		aliases: ['holland', 'dutch', 'oranje']
	},
	{
		name: 'Portugal',
		shortName: 'Portugal',
		code: 'POR',
		country: 'Portugal',
		isNationalTeam: true,
		aliases: []
	}
];

const SAMPLE_PLAYERS = [
	{
		name: 'Cristiano Ronaldo',
		firstName: 'Cristiano',
		lastName: 'Ronaldo',
		nationality: 'Portugal',
		aliases: ['ronaldo', 'cr7', 'cristiano'],
		teams: ['Manchester United', 'Real Madrid', 'Juventus']
	},
	{
		name: 'Lionel Messi',
		firstName: 'Lionel',
		lastName: 'Messi',
		nationality: 'Argentina',
		aliases: ['messi', 'leo messi', 'la pulga'],
		teams: ['Barcelona', 'Paris Saint-Germain', 'Argentina']
	},
	{
		name: 'Diego Maradona',
		firstName: 'Diego',
		lastName: 'Maradona',
		nationality: 'Argentina',
		aliases: ['maradona', 'el pibe de oro'],
		teams: ['Barcelona', 'Argentina']
	},
	{
		name: 'Pele',
		firstName: 'Edson Arantes',
		lastName: 'Pele',
		nationality: 'Brazil',
		aliases: ['pele', 'o rei', 'edson arantes'],
		teams: ['Brazil']
	},
	{
		name: 'Thierry Henry',
		firstName: 'Thierry',
		lastName: 'Henry',
		nationality: 'France',
		aliases: ['henry', 'titi'],
		teams: ['Arsenal', 'Barcelona', 'France']
	},
	{
		name: 'Zinedine Zidane',
		firstName: 'Zinedine',
		lastName: 'Zidane',
		nationality: 'France',
		aliases: ['zidane', 'zizou'],
		teams: ['Real Madrid', 'Juventus', 'France']
	},
	{
		name: 'Ole Gunnar Solskjaer',
		firstName: 'Ole Gunnar',
		lastName: 'Solskjaer',
		nationality: 'Norway',
		aliases: ['solskjaer', 'ole'],
		teams: ['Manchester United']
	},
	{
		name: 'Steven Gerrard',
		firstName: 'Steven',
		lastName: 'Gerrard',
		nationality: 'England',
		aliases: ['gerrard', 'stevie g'],
		teams: ['Liverpool', 'England']
	},
	{
		name: 'Wayne Rooney',
		firstName: 'Wayne',
		lastName: 'Rooney',
		nationality: 'England',
		aliases: ['rooney', 'wazza'],
		teams: ['Manchester United', 'England']
	},
	{
		name: 'David Beckham',
		firstName: 'David',
		lastName: 'Beckham',
		nationality: 'England',
		aliases: ['beckham', 'becks'],
		teams: ['Manchester United', 'Real Madrid', 'England']
	},
	{
		name: 'Frank Lampard',
		firstName: 'Frank',
		lastName: 'Lampard',
		nationality: 'England',
		aliases: ['lampard', 'lamps'],
		teams: ['Chelsea', 'England']
	},
	{
		name: 'Michael Owen',
		firstName: 'Michael',
		lastName: 'Owen',
		nationality: 'England',
		aliases: ['owen'],
		teams: ['Liverpool', 'Real Madrid', 'Manchester United', 'England']
	},
	{
		name: 'Alan Shearer',
		firstName: 'Alan',
		lastName: 'Shearer',
		nationality: 'England',
		aliases: ['shearer'],
		teams: ['England']
	},
	{
		name: 'Ronaldo Nazario',
		firstName: 'Ronaldo',
		lastName: 'Nazario',
		nationality: 'Brazil',
		aliases: ['ronaldo', 'r9', 'ronaldo brazil', 'ronaldo fenomeno', 'il fenomeno'],
		teams: ['Real Madrid', 'Inter Milan', 'Barcelona', 'Brazil']
	},
	{
		name: 'Roberto Carlos',
		firstName: 'Roberto',
		lastName: 'Carlos',
		nationality: 'Brazil',
		aliases: ['roberto carlos'],
		teams: ['Real Madrid', 'Brazil']
	},
	{
		name: 'Kylian Mbappe',
		firstName: 'Kylian',
		lastName: 'Mbappe',
		nationality: 'France',
		aliases: ['mbappe'],
		teams: ['Paris Saint-Germain', 'Real Madrid', 'France']
	},
	{
		name: 'Erling Haaland',
		firstName: 'Erling',
		lastName: 'Haaland',
		nationality: 'Norway',
		aliases: ['haaland'],
		teams: ['Manchester City', 'Borussia Dortmund']
	}
];

/**
 * Sync sample data to the database for testing
 */
export async function syncSampleData(): Promise<{ teams: number; players: number }> {
	const syncId = generateId();
	await db.insert(syncLogs).values({
		id: syncId,
		syncType: 'sample_data',
		status: 'started'
	});

	try {
		let teamsProcessed = 0;
		let playersProcessed = 0;
		const teamIdMap = new Map<string, string>();

		// Insert teams
		for (const teamData of SAMPLE_TEAMS) {
			const existingTeam = await db
				.select()
				.from(teams)
				.where(eq(teams.name, teamData.name))
				.get();

			let teamId: string;

			if (existingTeam) {
				teamId = existingTeam.id;
			} else {
				teamId = generateId();
				await db.insert(teams).values({
					id: teamId,
					name: teamData.name,
					shortName: teamData.shortName,
					code: teamData.code,
					country: teamData.country,
					isNationalTeam: teamData.isNationalTeam ?? false
				});
				teamsProcessed++;

				// Insert aliases
				for (const alias of teamData.aliases) {
					await db.insert(teamAliases).values({
						id: generateId(),
						teamId,
						alias: alias.toLowerCase()
					});
				}
			}

			teamIdMap.set(teamData.name, teamId);
		}

		// Insert players
		for (const playerData of SAMPLE_PLAYERS) {
			const existingPlayer = await db
				.select()
				.from(players)
				.where(eq(players.name, playerData.name))
				.get();

			let playerId: string;

			if (existingPlayer) {
				playerId = existingPlayer.id;
			} else {
				playerId = generateId();
				await db.insert(players).values({
					id: playerId,
					name: playerData.name,
					firstName: playerData.firstName,
					lastName: playerData.lastName,
					nationality: playerData.nationality
				});
				playersProcessed++;

				// Insert aliases
				for (const alias of playerData.aliases) {
					await db.insert(playerAliases).values({
						id: generateId(),
						playerId,
						alias: alias.toLowerCase()
					});
				}

				// Link to teams
				for (const teamName of playerData.teams) {
					const teamId = teamIdMap.get(teamName);
					if (teamId) {
						await db.insert(playerTeams).values({
							id: generateId(),
							playerId,
							teamId
						});
					}
				}
			}
		}

		await db
			.update(syncLogs)
			.set({
				status: 'completed',
				recordsProcessed: teamsProcessed + playersProcessed
			})
			.where(eq(syncLogs.id, syncId));

		return { teams: teamsProcessed, players: playersProcessed };
	} catch (error) {
		await db
			.update(syncLogs)
			.set({
				status: 'failed',
				errorMessage: String(error)
			})
			.where(eq(syncLogs.id, syncId));
		throw error;
	}
}

/**
 * Get sync status
 */
export async function getSyncStatus() {
	const latestSync = await db
		.select()
		.from(syncLogs)
		.orderBy(syncLogs.createdAt)
		.limit(1)
		.get();

	const teamCount = await db.select().from(teams).all();
	const playerCount = await db.select().from(players).all();

	return {
		lastSync: latestSync,
		teamCount: teamCount.length,
		playerCount: playerCount.length
	};
}
