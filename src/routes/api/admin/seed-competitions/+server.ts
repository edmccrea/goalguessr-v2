import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { competitions } from '$lib/server/db/schema';

const competitionData = [
	// Major International Tournaments
	{ name: 'FIFA World Cup', shortName: 'World Cup', type: 'international' as const, country: null, isInternational: true },
	{ name: 'FIFA World Cup Final', shortName: 'WC Final', type: 'international' as const, country: null, isInternational: true },
	{ name: 'UEFA European Championship', shortName: 'Euros', type: 'international' as const, country: null, isInternational: true },
	{ name: 'Copa America', shortName: 'Copa America', type: 'international' as const, country: null, isInternational: true },
	{ name: 'Africa Cup of Nations', shortName: 'AFCON', type: 'international' as const, country: null, isInternational: true },
	{ name: 'AFC Asian Cup', shortName: 'Asian Cup', type: 'international' as const, country: null, isInternational: true },
	{ name: 'CONCACAF Gold Cup', shortName: 'Gold Cup', type: 'international' as const, country: null, isInternational: true },
	{ name: 'UEFA Nations League', shortName: 'Nations League', type: 'international' as const, country: null, isInternational: true },
	{ name: 'Olympic Games', shortName: 'Olympics', type: 'international' as const, country: null, isInternational: true },
	{ name: 'FIFA Confederations Cup', shortName: 'Confed Cup', type: 'international' as const, country: null, isInternational: true },
	{ name: 'World Cup Qualifier', shortName: 'WC Qualifier', type: 'international' as const, country: null, isInternational: true },
	{ name: 'Euro Qualifier', shortName: 'Euro Qualifier', type: 'international' as const, country: null, isInternational: true },
	{ name: 'International Friendly', shortName: 'Friendly', type: 'international' as const, country: null, isInternational: true },

	// European Club Competitions
	{ name: 'UEFA Champions League', shortName: 'UCL', type: 'cup' as const, country: 'Europe', isInternational: false },
	{ name: 'UEFA Champions League Final', shortName: 'UCL Final', type: 'cup' as const, country: 'Europe', isInternational: false },
	{ name: 'UEFA Europa League', shortName: 'UEL', type: 'cup' as const, country: 'Europe', isInternational: false },
	{ name: 'UEFA Europa League Final', shortName: 'UEL Final', type: 'cup' as const, country: 'Europe', isInternational: false },
	{ name: 'UEFA Conference League', shortName: 'UECL', type: 'cup' as const, country: 'Europe', isInternational: false },
	{ name: 'UEFA Super Cup', shortName: 'Super Cup', type: 'cup' as const, country: 'Europe', isInternational: false },
	{ name: 'European Cup', shortName: 'European Cup', type: 'cup' as const, country: 'Europe', isInternational: false },
	{ name: 'UEFA Cup', shortName: 'UEFA Cup', type: 'cup' as const, country: 'Europe', isInternational: false },
	{ name: 'Cup Winners Cup', shortName: 'CWC', type: 'cup' as const, country: 'Europe', isInternational: false },

	// England
	{ name: 'Premier League', shortName: 'PL', type: 'league' as const, country: 'England', isInternational: false },
	{ name: 'FA Cup', shortName: 'FA Cup', type: 'cup' as const, country: 'England', isInternational: false },
	{ name: 'FA Cup Final', shortName: 'FA Cup Final', type: 'cup' as const, country: 'England', isInternational: false },
	{ name: 'EFL Cup', shortName: 'League Cup', type: 'cup' as const, country: 'England', isInternational: false },
	{ name: 'EFL Cup Final', shortName: 'League Cup Final', type: 'cup' as const, country: 'England', isInternational: false },
	{ name: 'Community Shield', shortName: 'Community Shield', type: 'cup' as const, country: 'England', isInternational: false },
	{ name: 'Championship', shortName: 'Championship', type: 'league' as const, country: 'England', isInternational: false },
	{ name: 'First Division', shortName: 'First Division', type: 'league' as const, country: 'England', isInternational: false },

	// Spain
	{ name: 'La Liga', shortName: 'La Liga', type: 'league' as const, country: 'Spain', isInternational: false },
	{ name: 'Copa del Rey', shortName: 'Copa del Rey', type: 'cup' as const, country: 'Spain', isInternational: false },
	{ name: 'Copa del Rey Final', shortName: 'Copa del Rey Final', type: 'cup' as const, country: 'Spain', isInternational: false },
	{ name: 'Supercopa de Espana', shortName: 'Supercopa', type: 'cup' as const, country: 'Spain', isInternational: false },

	// Germany
	{ name: 'Bundesliga', shortName: 'Bundesliga', type: 'league' as const, country: 'Germany', isInternational: false },
	{ name: 'DFB-Pokal', shortName: 'DFB-Pokal', type: 'cup' as const, country: 'Germany', isInternational: false },
	{ name: 'DFB-Pokal Final', shortName: 'Pokal Final', type: 'cup' as const, country: 'Germany', isInternational: false },
	{ name: 'DFL-Supercup', shortName: 'Supercup', type: 'cup' as const, country: 'Germany', isInternational: false },

	// Italy
	{ name: 'Serie A', shortName: 'Serie A', type: 'league' as const, country: 'Italy', isInternational: false },
	{ name: 'Coppa Italia', shortName: 'Coppa Italia', type: 'cup' as const, country: 'Italy', isInternational: false },
	{ name: 'Coppa Italia Final', shortName: 'Coppa Final', type: 'cup' as const, country: 'Italy', isInternational: false },
	{ name: 'Supercoppa Italiana', shortName: 'Supercoppa', type: 'cup' as const, country: 'Italy', isInternational: false },

	// France
	{ name: 'Ligue 1', shortName: 'Ligue 1', type: 'league' as const, country: 'France', isInternational: false },
	{ name: 'Coupe de France', shortName: 'Coupe de France', type: 'cup' as const, country: 'France', isInternational: false },
	{ name: 'Coupe de la Ligue', shortName: 'Coupe de la Ligue', type: 'cup' as const, country: 'France', isInternational: false },
	{ name: 'Trophee des Champions', shortName: 'Trophee', type: 'cup' as const, country: 'France', isInternational: false },

	// Netherlands
	{ name: 'Eredivisie', shortName: 'Eredivisie', type: 'league' as const, country: 'Netherlands', isInternational: false },
	{ name: 'KNVB Cup', shortName: 'KNVB Cup', type: 'cup' as const, country: 'Netherlands', isInternational: false },

	// Portugal
	{ name: 'Primeira Liga', shortName: 'Liga Portugal', type: 'league' as const, country: 'Portugal', isInternational: false },
	{ name: 'Taca de Portugal', shortName: 'Taca', type: 'cup' as const, country: 'Portugal', isInternational: false },

	// Scotland
	{ name: 'Scottish Premiership', shortName: 'SPFL', type: 'league' as const, country: 'Scotland', isInternational: false },
	{ name: 'Scottish Cup', shortName: 'Scottish Cup', type: 'cup' as const, country: 'Scotland', isInternational: false },
	{ name: 'Scottish League Cup', shortName: 'League Cup', type: 'cup' as const, country: 'Scotland', isInternational: false },

	// South America
	{ name: 'Copa Libertadores', shortName: 'Libertadores', type: 'cup' as const, country: 'South America', isInternational: false },
	{ name: 'Copa Libertadores Final', shortName: 'Libertadores Final', type: 'cup' as const, country: 'South America', isInternational: false },
	{ name: 'Copa Sudamericana', shortName: 'Sudamericana', type: 'cup' as const, country: 'South America', isInternational: false },
	{ name: 'Recopa Sudamericana', shortName: 'Recopa', type: 'cup' as const, country: 'South America', isInternational: false },

	// Brazil
	{ name: 'Brasileirao', shortName: 'Brasileirao', type: 'league' as const, country: 'Brazil', isInternational: false },
	{ name: 'Copa do Brasil', shortName: 'Copa do Brasil', type: 'cup' as const, country: 'Brazil', isInternational: false },

	// Argentina
	{ name: 'Liga Profesional', shortName: 'Liga Argentina', type: 'league' as const, country: 'Argentina', isInternational: false },
	{ name: 'Copa Argentina', shortName: 'Copa Argentina', type: 'cup' as const, country: 'Argentina', isInternational: false },

	// World Club Competitions
	{ name: 'FIFA Club World Cup', shortName: 'Club WC', type: 'cup' as const, country: null, isInternational: false },
	{ name: 'Intercontinental Cup', shortName: 'Intercontinental', type: 'cup' as const, country: null, isInternational: false },

	// Other Major Leagues
	{ name: 'MLS', shortName: 'MLS', type: 'league' as const, country: 'USA', isInternational: false },
	{ name: 'MLS Cup', shortName: 'MLS Cup', type: 'cup' as const, country: 'USA', isInternational: false },
	{ name: 'Saudi Pro League', shortName: 'SPL', type: 'league' as const, country: 'Saudi Arabia', isInternational: false },
	{ name: 'J1 League', shortName: 'J-League', type: 'league' as const, country: 'Japan', isInternational: false },
	{ name: 'A-League', shortName: 'A-League', type: 'league' as const, country: 'Australia', isInternational: false },
	{ name: 'Turkish Super Lig', shortName: 'Super Lig', type: 'league' as const, country: 'Turkey', isInternational: false },
	{ name: 'Russian Premier League', shortName: 'RPL', type: 'league' as const, country: 'Russia', isInternational: false },
	{ name: 'Belgian Pro League', shortName: 'Pro League', type: 'league' as const, country: 'Belgium', isInternational: false },
	{ name: 'Swiss Super League', shortName: 'Super League', type: 'league' as const, country: 'Switzerland', isInternational: false },
	{ name: 'Austrian Bundesliga', shortName: 'Austrian BL', type: 'league' as const, country: 'Austria', isInternational: false },
	{ name: 'Ukrainian Premier League', shortName: 'UPL', type: 'league' as const, country: 'Ukraine', isInternational: false },
	{ name: 'Greek Super League', shortName: 'Super League', type: 'league' as const, country: 'Greece', isInternational: false },
	{ name: 'Danish Superliga', shortName: 'Superliga', type: 'league' as const, country: 'Denmark', isInternational: false },
	{ name: 'Norwegian Eliteserien', shortName: 'Eliteserien', type: 'league' as const, country: 'Norway', isInternational: false },
	{ name: 'Swedish Allsvenskan', shortName: 'Allsvenskan', type: 'league' as const, country: 'Sweden', isInternational: false },
	{ name: 'Liga MX', shortName: 'Liga MX', type: 'league' as const, country: 'Mexico', isInternational: false },
	{ name: 'Chinese Super League', shortName: 'CSL', type: 'league' as const, country: 'China', isInternational: false },
	{ name: 'K League 1', shortName: 'K League', type: 'league' as const, country: 'South Korea', isInternational: false }
];

export const POST: RequestHandler = async () => {
	try {
		let inserted = 0;

		for (const comp of competitionData) {
			const id = crypto.randomUUID();
			try {
				await db.insert(competitions).values({
					id,
					name: comp.name,
					shortName: comp.shortName,
					type: comp.type,
					country: comp.country,
					isInternational: comp.isInternational
				});
				inserted++;
			} catch {
				// Skip duplicates
			}
		}

		return json({ success: true, inserted, total: competitionData.length });
	} catch (error) {
		console.error('Seed competitions error:', error);
		return json({ success: false, error: String(error) }, { status: 500 });
	}
};
