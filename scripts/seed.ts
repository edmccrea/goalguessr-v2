/**
 * Database Seeding Script
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * This script populates the database with teams and players data.
 * It's idempotent - running it multiple times won't create duplicates.
 *
 * For production, set DATABASE_URL and DATABASE_AUTH_TOKEN environment variables.
 */

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import {
	teams,
	teamAliases,
	players,
	playerAliases,
	playerTeams,
	syncLogs,
	competitions
} from '../src/lib/server/db/schema';

// Database connection
const client = createClient({
	url: process.env.DATABASE_URL ?? 'file:local.db',
	authToken: process.env.DATABASE_AUTH_TOKEN
});

const db = drizzle(client);

function generateId(): string {
	return crypto.randomUUID();
}

// =============================================================================
// TEAMS DATA
// =============================================================================

const PREMIER_LEAGUE_TEAMS = [
	{ name: 'Manchester United', shortName: 'Man Utd', code: 'MUN', country: 'England', aliases: ['man u', 'manu', 'mufc', 'red devils', 'united'] },
	{ name: 'Manchester City', shortName: 'Man City', code: 'MCI', country: 'England', aliases: ['city', 'mcfc', 'cityzens'] },
	{ name: 'Liverpool', shortName: 'Liverpool', code: 'LIV', country: 'England', aliases: ['lfc', 'reds', 'pool'] },
	{ name: 'Chelsea', shortName: 'Chelsea', code: 'CHE', country: 'England', aliases: ['cfc', 'blues'] },
	{ name: 'Arsenal', shortName: 'Arsenal', code: 'ARS', country: 'England', aliases: ['gunners', 'afc'] },
	{ name: 'Tottenham Hotspur', shortName: 'Spurs', code: 'TOT', country: 'England', aliases: ['tottenham', 'spurs', 'thfc'] },
	{ name: 'Newcastle United', shortName: 'Newcastle', code: 'NEW', country: 'England', aliases: ['newcastle', 'nufc', 'toon', 'magpies'] },
	{ name: 'Aston Villa', shortName: 'Aston Villa', code: 'AVL', country: 'England', aliases: ['villa', 'avfc', 'villans'] },
	{ name: 'West Ham United', shortName: 'West Ham', code: 'WHU', country: 'England', aliases: ['west ham', 'hammers', 'whufc'] },
	{ name: 'Brighton & Hove Albion', shortName: 'Brighton', code: 'BHA', country: 'England', aliases: ['brighton', 'seagulls'] },
	{ name: 'Everton', shortName: 'Everton', code: 'EVE', country: 'England', aliases: ['everton', 'toffees', 'efc'] },
	{ name: 'Leicester City', shortName: 'Leicester', code: 'LEI', country: 'England', aliases: ['leicester', 'foxes', 'lcfc'] },
	{ name: 'Wolverhampton Wanderers', shortName: 'Wolves', code: 'WOL', country: 'England', aliases: ['wolves', 'wolverhampton'] },
	{ name: 'Crystal Palace', shortName: 'Crystal Palace', code: 'CRY', country: 'England', aliases: ['palace', 'eagles', 'cpfc'] },
	{ name: 'Brentford', shortName: 'Brentford', code: 'BRE', country: 'England', aliases: ['brentford', 'bees'] },
	{ name: 'Nottingham Forest', shortName: 'Nott\'m Forest', code: 'NFO', country: 'England', aliases: ['forest', 'nottingham', 'nffc'] },
	{ name: 'Fulham', shortName: 'Fulham', code: 'FUL', country: 'England', aliases: ['fulham', 'cottagers', 'ffc'] },
	{ name: 'Bournemouth', shortName: 'Bournemouth', code: 'BOU', country: 'England', aliases: ['bournemouth', 'cherries', 'afcb'] },
	{ name: 'Leeds United', shortName: 'Leeds', code: 'LEE', country: 'England', aliases: ['leeds', 'lufc', 'whites'] },
	{ name: 'Southampton', shortName: 'Southampton', code: 'SOU', country: 'England', aliases: ['southampton', 'saints'] },
];

const LA_LIGA_TEAMS = [
	{ name: 'Real Madrid', shortName: 'Real Madrid', code: 'RMA', country: 'Spain', aliases: ['real', 'rmcf', 'los blancos', 'madrid'] },
	{ name: 'Barcelona', shortName: 'Barcelona', code: 'BAR', country: 'Spain', aliases: ['barca', 'fcb', 'blaugrana'] },
	{ name: 'Atletico Madrid', shortName: 'Atletico', code: 'ATM', country: 'Spain', aliases: ['atletico', 'atleti', 'colchoneros'] },
	{ name: 'Sevilla', shortName: 'Sevilla', code: 'SEV', country: 'Spain', aliases: ['sevilla', 'sfc'] },
	{ name: 'Real Sociedad', shortName: 'Real Sociedad', code: 'RSO', country: 'Spain', aliases: ['sociedad', 'la real', 'txuri-urdin'] },
	{ name: 'Real Betis', shortName: 'Betis', code: 'BET', country: 'Spain', aliases: ['betis', 'verdiblancos'] },
	{ name: 'Villarreal', shortName: 'Villarreal', code: 'VIL', country: 'Spain', aliases: ['villarreal', 'yellow submarine', 'submarino amarillo'] },
	{ name: 'Athletic Bilbao', shortName: 'Athletic', code: 'ATH', country: 'Spain', aliases: ['athletic', 'bilbao', 'los leones'] },
	{ name: 'Valencia', shortName: 'Valencia', code: 'VAL', country: 'Spain', aliases: ['valencia', 'los che', 'murcielagos'] },
	{ name: 'Deportivo La Coruna', shortName: 'Deportivo', code: 'DEP', country: 'Spain', aliases: ['deportivo', 'depor', 'superdepor'] },
];

const BUNDESLIGA_TEAMS = [
	{ name: 'Bayern Munich', shortName: 'Bayern', code: 'BAY', country: 'Germany', aliases: ['bayern', 'bayern munchen', 'fcb munich', 'bayern münchen'] },
	{ name: 'Borussia Dortmund', shortName: 'Dortmund', code: 'BVB', country: 'Germany', aliases: ['dortmund', 'bvb', 'die schwarzgelben'] },
	{ name: 'RB Leipzig', shortName: 'Leipzig', code: 'RBL', country: 'Germany', aliases: ['leipzig', 'rb leipzig', 'red bull leipzig'] },
	{ name: 'Bayer Leverkusen', shortName: 'Leverkusen', code: 'LEV', country: 'Germany', aliases: ['leverkusen', 'bayer', 'werkself'] },
	{ name: 'Eintracht Frankfurt', shortName: 'Frankfurt', code: 'SGE', country: 'Germany', aliases: ['frankfurt', 'eintracht', 'sge'] },
	{ name: 'Borussia Monchengladbach', shortName: 'Gladbach', code: 'BMG', country: 'Germany', aliases: ['gladbach', 'monchengladbach', 'fohlen', 'borussia mönchengladbach'] },
	{ name: 'VfB Stuttgart', shortName: 'Stuttgart', code: 'VFB', country: 'Germany', aliases: ['stuttgart', 'vfb'] },
	{ name: 'Werder Bremen', shortName: 'Bremen', code: 'SVW', country: 'Germany', aliases: ['bremen', 'werder'] },
	{ name: 'Schalke 04', shortName: 'Schalke', code: 'S04', country: 'Germany', aliases: ['schalke', 's04', 'die knappen'] },
	{ name: 'Hamburger SV', shortName: 'Hamburg', code: 'HSV', country: 'Germany', aliases: ['hamburg', 'hsv', 'hamburger'] },
	{ name: 'VfL Wolfsburg', shortName: 'Wolfsburg', code: 'WOB', country: 'Germany', aliases: ['wolfsburg', 'wolves'] },
	{ name: '1. FC Koln', shortName: 'Koln', code: 'KOE', country: 'Germany', aliases: ['koln', 'cologne', 'fc köln', 'effzeh'] },
];

const SERIE_A_TEAMS = [
	{ name: 'Juventus', shortName: 'Juventus', code: 'JUV', country: 'Italy', aliases: ['juve', 'old lady', 'bianconeri'] },
	{ name: 'AC Milan', shortName: 'Milan', code: 'ACM', country: 'Italy', aliases: ['milan', 'rossoneri', 'ac milan'] },
	{ name: 'Inter Milan', shortName: 'Inter', code: 'INT', country: 'Italy', aliases: ['inter', 'internazionale', 'nerazzurri'] },
	{ name: 'Napoli', shortName: 'Napoli', code: 'NAP', country: 'Italy', aliases: ['napoli', 'partenopei', 'gli azzurri'] },
	{ name: 'AS Roma', shortName: 'Roma', code: 'ROM', country: 'Italy', aliases: ['roma', 'giallorossi', 'i lupi'] },
	{ name: 'Lazio', shortName: 'Lazio', code: 'LAZ', country: 'Italy', aliases: ['lazio', 'biancocelesti', 'aquile'] },
	{ name: 'Fiorentina', shortName: 'Fiorentina', code: 'FIO', country: 'Italy', aliases: ['fiorentina', 'viola'] },
	{ name: 'Atalanta', shortName: 'Atalanta', code: 'ATA', country: 'Italy', aliases: ['atalanta', 'la dea', 'orobici'] },
	{ name: 'Sampdoria', shortName: 'Sampdoria', code: 'SAM', country: 'Italy', aliases: ['sampdoria', 'samp', 'blucerchiati'] },
	{ name: 'Parma', shortName: 'Parma', code: 'PAR', country: 'Italy', aliases: ['parma', 'crociati', 'gialloblu'] },
	{ name: 'Torino', shortName: 'Torino', code: 'TOR', country: 'Italy', aliases: ['torino', 'toro', 'granata'] },
	{ name: 'Genoa', shortName: 'Genoa', code: 'GEN', country: 'Italy', aliases: ['genoa', 'grifone'] },
];

const LIGUE_1_TEAMS = [
	{ name: 'Paris Saint-Germain', shortName: 'PSG', code: 'PSG', country: 'France', aliases: ['psg', 'paris', 'paris sg'] },
	{ name: 'Olympique de Marseille', shortName: 'Marseille', code: 'OM', country: 'France', aliases: ['marseille', 'om', 'olympique marseille'] },
	{ name: 'Olympique Lyonnais', shortName: 'Lyon', code: 'OL', country: 'France', aliases: ['lyon', 'ol', 'olympique lyon', 'les gones'] },
	{ name: 'AS Monaco', shortName: 'Monaco', code: 'MON', country: 'France', aliases: ['monaco', 'asm'] },
	{ name: 'Lille', shortName: 'Lille', code: 'LIL', country: 'France', aliases: ['lille', 'losc', 'les dogues'] },
	{ name: 'Stade Rennais', shortName: 'Rennes', code: 'REN', country: 'France', aliases: ['rennes', 'stade rennais'] },
	{ name: 'OGC Nice', shortName: 'Nice', code: 'NIC', country: 'France', aliases: ['nice', 'ogc nice', 'les aiglons'] },
	{ name: 'RC Lens', shortName: 'Lens', code: 'LEN', country: 'France', aliases: ['lens', 'rc lens', 'sang et or'] },
	{ name: 'Bordeaux', shortName: 'Bordeaux', code: 'BOR', country: 'France', aliases: ['bordeaux', 'girondins'] },
	{ name: 'Saint-Etienne', shortName: 'Saint-Etienne', code: 'STE', country: 'France', aliases: ['saint-etienne', 'asse', 'les verts'] },
	{ name: 'Nantes', shortName: 'Nantes', code: 'NAN', country: 'France', aliases: ['nantes', 'fcn', 'les canaris'] },
];

const OTHER_EUROPEAN_TEAMS = [
	{ name: 'Ajax', shortName: 'Ajax', code: 'AJA', country: 'Netherlands', aliases: ['ajax', 'afc ajax', 'godenzonen'] },
	{ name: 'PSV Eindhoven', shortName: 'PSV', code: 'PSV', country: 'Netherlands', aliases: ['psv', 'eindhoven'] },
	{ name: 'Feyenoord', shortName: 'Feyenoord', code: 'FEY', country: 'Netherlands', aliases: ['feyenoord', 'de club'] },
	{ name: 'FC Porto', shortName: 'Porto', code: 'POR', country: 'Portugal', aliases: ['porto', 'fcp', 'dragoes'] },
	{ name: 'Benfica', shortName: 'Benfica', code: 'BEN', country: 'Portugal', aliases: ['benfica', 'slb', 'aguias', 'encarnados'] },
	{ name: 'Sporting CP', shortName: 'Sporting', code: 'SCP', country: 'Portugal', aliases: ['sporting', 'sporting lisbon', 'leoes'] },
	{ name: 'Celtic', shortName: 'Celtic', code: 'CEL', country: 'Scotland', aliases: ['celtic', 'bhoys', 'hoops'] },
	{ name: 'Rangers', shortName: 'Rangers', code: 'RAN', country: 'Scotland', aliases: ['rangers', 'gers'] },
	{ name: 'Anderlecht', shortName: 'Anderlecht', code: 'AND', country: 'Belgium', aliases: ['anderlecht', 'rsca', 'paars-wit'] },
	{ name: 'Club Brugge', shortName: 'Club Brugge', code: 'CLU', country: 'Belgium', aliases: ['brugge', 'club brugge'] },
	{ name: 'Galatasaray', shortName: 'Galatasaray', code: 'GAL', country: 'Turkey', aliases: ['galatasaray', 'gala', 'cimbom', 'aslanlar'] },
	{ name: 'Fenerbahce', shortName: 'Fenerbahce', code: 'FEN', country: 'Turkey', aliases: ['fenerbahce', 'fener', 'sari kanarya'] },
	{ name: 'Besiktas', shortName: 'Besiktas', code: 'BES', country: 'Turkey', aliases: ['besiktas', 'kara kartal'] },
	{ name: 'Olympiacos', shortName: 'Olympiacos', code: 'OLY', country: 'Greece', aliases: ['olympiacos', 'olympiakos', 'thrylos'] },
	{ name: 'Panathinaikos', shortName: 'Panathinaikos', code: 'PAN', country: 'Greece', aliases: ['panathinaikos', 'pao', 'trifouli'] },
	{ name: 'Red Star Belgrade', shortName: 'Red Star', code: 'RSB', country: 'Serbia', aliases: ['red star', 'crvena zvezda', 'zvezda'] },
	{ name: 'Dynamo Kyiv', shortName: 'Dynamo Kyiv', code: 'DYK', country: 'Ukraine', aliases: ['dynamo kiev', 'dynamo kyiv', 'kyiv'] },
	{ name: 'Shakhtar Donetsk', shortName: 'Shakhtar', code: 'SHA', country: 'Ukraine', aliases: ['shakhtar', 'shaktar', 'miners'] },
	{ name: 'Spartak Moscow', shortName: 'Spartak', code: 'SPM', country: 'Russia', aliases: ['spartak', 'spartak moscow'] },
	{ name: 'CSKA Moscow', shortName: 'CSKA', code: 'CSK', country: 'Russia', aliases: ['cska', 'cska moscow'] },
	{ name: 'Zenit St Petersburg', shortName: 'Zenit', code: 'ZEN', country: 'Russia', aliases: ['zenit', 'st petersburg'] },
];

const SOUTH_AMERICAN_TEAMS = [
	{ name: 'Boca Juniors', shortName: 'Boca', code: 'BOC', country: 'Argentina', aliases: ['boca', 'boca juniors', 'xeneizes'] },
	{ name: 'River Plate', shortName: 'River', code: 'RIV', country: 'Argentina', aliases: ['river', 'river plate', 'millonarios'] },
	{ name: 'Flamengo', shortName: 'Flamengo', code: 'FLA', country: 'Brazil', aliases: ['flamengo', 'fla', 'mengao', 'rubro-negro'] },
	{ name: 'Santos', shortName: 'Santos', code: 'SAN', country: 'Brazil', aliases: ['santos', 'peixe', 'alvinegro praiano'] },
	{ name: 'Sao Paulo', shortName: 'Sao Paulo', code: 'SAO', country: 'Brazil', aliases: ['sao paulo', 'spfc', 'tricolor paulista'] },
	{ name: 'Corinthians', shortName: 'Corinthians', code: 'COR', country: 'Brazil', aliases: ['corinthians', 'timao'] },
	{ name: 'Palmeiras', shortName: 'Palmeiras', code: 'PAL', country: 'Brazil', aliases: ['palmeiras', 'verdao', 'porco'] },
	{ name: 'Gremio', shortName: 'Gremio', code: 'GRE', country: 'Brazil', aliases: ['gremio', 'tricolor gaucho', 'imortal'] },
];

const NATIONAL_TEAMS = [
	{ name: 'Argentina', shortName: 'Argentina', code: 'ARG', country: 'Argentina', isNationalTeam: true, aliases: ['albiceleste', 'la seleccion'] },
	{ name: 'Brazil', shortName: 'Brazil', code: 'BRA', country: 'Brazil', isNationalTeam: true, aliases: ['brasil', 'selecao', 'canarinho'] },
	{ name: 'Germany', shortName: 'Germany', code: 'GER', country: 'Germany', isNationalTeam: true, aliases: ['deutschland', 'die mannschaft'] },
	{ name: 'France', shortName: 'France', code: 'FRA', country: 'France', isNationalTeam: true, aliases: ['les bleus'] },
	{ name: 'England', shortName: 'England', code: 'ENG', country: 'England', isNationalTeam: true, aliases: ['three lions'] },
	{ name: 'Spain', shortName: 'Spain', code: 'ESP', country: 'Spain', isNationalTeam: true, aliases: ['la roja', 'la furia roja'] },
	{ name: 'Italy', shortName: 'Italy', code: 'ITA', country: 'Italy', isNationalTeam: true, aliases: ['azzurri', 'gli azzurri'] },
	{ name: 'Netherlands', shortName: 'Netherlands', code: 'NED', country: 'Netherlands', isNationalTeam: true, aliases: ['holland', 'dutch', 'oranje'] },
	{ name: 'Portugal', shortName: 'Portugal', code: 'POR', country: 'Portugal', isNationalTeam: true, aliases: ['selecao das quinas'] },
	{ name: 'Belgium', shortName: 'Belgium', code: 'BEL', country: 'Belgium', isNationalTeam: true, aliases: ['red devils', 'rode duivels', 'diables rouges'] },
	{ name: 'Croatia', shortName: 'Croatia', code: 'CRO', country: 'Croatia', isNationalTeam: true, aliases: ['vatreni', 'blazers'] },
	{ name: 'Uruguay', shortName: 'Uruguay', code: 'URU', country: 'Uruguay', isNationalTeam: true, aliases: ['la celeste', 'charruas'] },
	{ name: 'Colombia', shortName: 'Colombia', code: 'COL', country: 'Colombia', isNationalTeam: true, aliases: ['los cafeteros', 'tricolor'] },
	{ name: 'Mexico', shortName: 'Mexico', code: 'MEX', country: 'Mexico', isNationalTeam: true, aliases: ['el tri', 'tricolor'] },
	{ name: 'USA', shortName: 'USA', code: 'USA', country: 'USA', isNationalTeam: true, aliases: ['united states', 'usmnt', 'yanks'] },
	{ name: 'Japan', shortName: 'Japan', code: 'JPN', country: 'Japan', isNationalTeam: true, aliases: ['samurai blue'] },
	{ name: 'South Korea', shortName: 'South Korea', code: 'KOR', country: 'South Korea', isNationalTeam: true, aliases: ['korea', 'taeguk warriors'] },
	{ name: 'Nigeria', shortName: 'Nigeria', code: 'NGA', country: 'Nigeria', isNationalTeam: true, aliases: ['super eagles'] },
	{ name: 'Cameroon', shortName: 'Cameroon', code: 'CMR', country: 'Cameroon', isNationalTeam: true, aliases: ['indomitable lions', 'les lions indomptables'] },
	{ name: 'Senegal', shortName: 'Senegal', code: 'SEN', country: 'Senegal', isNationalTeam: true, aliases: ['lions of teranga'] },
	{ name: 'Morocco', shortName: 'Morocco', code: 'MAR', country: 'Morocco', isNationalTeam: true, aliases: ['atlas lions'] },
	{ name: 'Ghana', shortName: 'Ghana', code: 'GHA', country: 'Ghana', isNationalTeam: true, aliases: ['black stars'] },
	{ name: 'Australia', shortName: 'Australia', code: 'AUS', country: 'Australia', isNationalTeam: true, aliases: ['socceroos'] },
	{ name: 'Sweden', shortName: 'Sweden', code: 'SWE', country: 'Sweden', isNationalTeam: true, aliases: ['blagult'] },
	{ name: 'Denmark', shortName: 'Denmark', code: 'DEN', country: 'Denmark', isNationalTeam: true, aliases: ['danish dynamite'] },
	{ name: 'Poland', shortName: 'Poland', code: 'POL', country: 'Poland', isNationalTeam: true, aliases: ['bialo-czerwoni'] },
	{ name: 'Czech Republic', shortName: 'Czech Republic', code: 'CZE', country: 'Czech Republic', isNationalTeam: true, aliases: ['czech', 'czechia', 'narodni tym'] },
	{ name: 'Switzerland', shortName: 'Switzerland', code: 'SUI', country: 'Switzerland', isNationalTeam: true, aliases: ['nati', 'schweizer nati'] },
	{ name: 'Austria', shortName: 'Austria', code: 'AUT', country: 'Austria', isNationalTeam: true, aliases: ['das team'] },
	{ name: 'Scotland', shortName: 'Scotland', code: 'SCO', country: 'Scotland', isNationalTeam: true, aliases: ['tartan army'] },
	{ name: 'Wales', shortName: 'Wales', code: 'WAL', country: 'Wales', isNationalTeam: true, aliases: ['dragons'] },
	{ name: 'Republic of Ireland', shortName: 'Ireland', code: 'IRL', country: 'Ireland', isNationalTeam: true, aliases: ['ireland', 'boys in green'] },
	{ name: 'Romania', shortName: 'Romania', code: 'ROU', country: 'Romania', isNationalTeam: true, aliases: ['tricolorii'] },
	{ name: 'Hungary', shortName: 'Hungary', code: 'HUN', country: 'Hungary', isNationalTeam: true, aliases: ['mighty magyars', 'magyarok'] },
	{ name: 'Serbia', shortName: 'Serbia', code: 'SRB', country: 'Serbia', isNationalTeam: true, aliases: ['orlovi', 'eagles'] },
	{ name: 'Chile', shortName: 'Chile', code: 'CHI', country: 'Chile', isNationalTeam: true, aliases: ['la roja'] },
	{ name: 'Peru', shortName: 'Peru', code: 'PER', country: 'Peru', isNationalTeam: true, aliases: ['la blanquirroja'] },
	{ name: 'Ecuador', shortName: 'Ecuador', code: 'ECU', country: 'Ecuador', isNationalTeam: true, aliases: ['la tri'] },
	{ name: 'Paraguay', shortName: 'Paraguay', code: 'PAR', country: 'Paraguay', isNationalTeam: true, aliases: ['albirroja', 'guaranies'] },
	{ name: 'Soviet Union', shortName: 'Soviet Union', code: 'URS', country: 'Soviet Union', isNationalTeam: true, aliases: ['ussr', 'cccp', 'soviets'] },
	{ name: 'West Germany', shortName: 'West Germany', code: 'FRG', country: 'West Germany', isNationalTeam: true, aliases: ['west germany', 'bundesrepublik'] },
	{ name: 'Yugoslavia', shortName: 'Yugoslavia', code: 'YUG', country: 'Yugoslavia', isNationalTeam: true, aliases: ['plavi'] },
	{ name: 'Czechoslovakia', shortName: 'Czechoslovakia', code: 'TCH', country: 'Czechoslovakia', isNationalTeam: true, aliases: [] },
];

const ALL_TEAMS = [
	...PREMIER_LEAGUE_TEAMS,
	...LA_LIGA_TEAMS,
	...BUNDESLIGA_TEAMS,
	...SERIE_A_TEAMS,
	...LIGUE_1_TEAMS,
	...OTHER_EUROPEAN_TEAMS,
	...SOUTH_AMERICAN_TEAMS,
	...NATIONAL_TEAMS,
];

// =============================================================================
// COMPETITIONS DATA
// =============================================================================

const ALL_COMPETITIONS = [
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
	{ name: 'K League 1', shortName: 'K League', type: 'league' as const, country: 'South Korea', isInternational: false },
];

// =============================================================================
// PLAYERS DATA
// =============================================================================

const SAMPLE_PLAYERS = [
	// ALL-TIME LEGENDS (Pre-1990)
	{ name: 'Pele', firstName: 'Edson Arantes', lastName: 'do Nascimento', nationality: 'Brazil', aliases: ['pele', 'o rei', 'edson arantes'], teams: ['Santos', 'Brazil'] },
	{ name: 'Diego Maradona', firstName: 'Diego', lastName: 'Maradona', nationality: 'Argentina', aliases: ['maradona', 'el pibe de oro', 'diego'], teams: ['Barcelona', 'Napoli', 'Argentina', 'Boca Juniors'] },
	{ name: 'Johan Cruyff', firstName: 'Johan', lastName: 'Cruyff', nationality: 'Netherlands', aliases: ['cruyff', 'cruijff', 'el flaco'], teams: ['Ajax', 'Barcelona', 'Netherlands'] },
	{ name: 'Franz Beckenbauer', firstName: 'Franz', lastName: 'Beckenbauer', nationality: 'Germany', aliases: ['beckenbauer', 'der kaiser', 'kaiser'], teams: ['Bayern Munich', 'Germany', 'West Germany'] },
	{ name: 'Gerd Muller', firstName: 'Gerd', lastName: 'Muller', nationality: 'Germany', aliases: ['muller', 'gerd muller', 'der bomber', 'bomber'], teams: ['Bayern Munich', 'Germany', 'West Germany'] },
	{ name: 'Eusebio', firstName: 'Eusebio', lastName: 'da Silva Ferreira', nationality: 'Portugal', aliases: ['eusebio', 'black panther', 'pantera negra'], teams: ['Benfica', 'Portugal'] },
	{ name: 'Alfredo Di Stefano', firstName: 'Alfredo', lastName: 'Di Stefano', nationality: 'Argentina', aliases: ['di stefano', 'saeta rubia', 'blond arrow'], teams: ['Real Madrid', 'Argentina', 'Spain'] },
	{ name: 'Ferenc Puskas', firstName: 'Ferenc', lastName: 'Puskas', nationality: 'Hungary', aliases: ['puskas', 'galloping major'], teams: ['Real Madrid', 'Hungary'] },
	{ name: 'Bobby Charlton', firstName: 'Bobby', lastName: 'Charlton', nationality: 'England', aliases: ['charlton', 'bobby charlton', 'sir bobby'], teams: ['Manchester United', 'England'] },
	{ name: 'George Best', firstName: 'George', lastName: 'Best', nationality: 'Northern Ireland', aliases: ['best', 'george best', 'el beatle'], teams: ['Manchester United'] },
	{ name: 'Bobby Moore', firstName: 'Bobby', lastName: 'Moore', nationality: 'England', aliases: ['moore', 'bobby moore'], teams: ['West Ham United', 'England'] },
	{ name: 'Lev Yashin', firstName: 'Lev', lastName: 'Yashin', nationality: 'Russia', aliases: ['yashin', 'black spider', 'black panther'], teams: ['Soviet Union'] },
	{ name: 'Michel Platini', firstName: 'Michel', lastName: 'Platini', nationality: 'France', aliases: ['platini', 'le roi'], teams: ['Juventus', 'France'] },
	{ name: 'Marco van Basten', firstName: 'Marco', lastName: 'van Basten', nationality: 'Netherlands', aliases: ['van basten', 'marco'], teams: ['AC Milan', 'Ajax', 'Netherlands'] },
	{ name: 'Ruud Gullit', firstName: 'Ruud', lastName: 'Gullit', nationality: 'Netherlands', aliases: ['gullit', 'ruud'], teams: ['AC Milan', 'Chelsea', 'Netherlands'] },
	{ name: 'Frank Rijkaard', firstName: 'Frank', lastName: 'Rijkaard', nationality: 'Netherlands', aliases: ['rijkaard'], teams: ['AC Milan', 'Ajax', 'Netherlands'] },
	{ name: 'Paolo Maldini', firstName: 'Paolo', lastName: 'Maldini', nationality: 'Italy', aliases: ['maldini', 'il capitano'], teams: ['AC Milan', 'Italy'] },
	{ name: 'Franco Baresi', firstName: 'Franco', lastName: 'Baresi', nationality: 'Italy', aliases: ['baresi'], teams: ['AC Milan', 'Italy'] },
	{ name: 'Lothar Matthaus', firstName: 'Lothar', lastName: 'Matthaus', nationality: 'Germany', aliases: ['matthaus', 'matthäus', 'lothar'], teams: ['Bayern Munich', 'Inter Milan', 'Germany', 'West Germany'] },
	{ name: 'Karl-Heinz Rummenigge', firstName: 'Karl-Heinz', lastName: 'Rummenigge', nationality: 'Germany', aliases: ['rummenigge'], teams: ['Bayern Munich', 'Inter Milan', 'Germany', 'West Germany'] },
	{ name: 'Zico', firstName: 'Arthur Antunes', lastName: 'Coimbra', nationality: 'Brazil', aliases: ['zico', 'white pele'], teams: ['Flamengo', 'Brazil'] },
	{ name: 'Socrates', firstName: 'Socrates', lastName: 'Brasileiro', nationality: 'Brazil', aliases: ['socrates', 'doctor socrates', 'doutor'], teams: ['Corinthians', 'Brazil'] },
	{ name: 'Falcao', firstName: 'Paulo Roberto', lastName: 'Falcao', nationality: 'Brazil', aliases: ['falcao', 'king of rome', 'rei de roma'], teams: ['AS Roma', 'Brazil'] },
	{ name: 'Kenny Dalglish', firstName: 'Kenny', lastName: 'Dalglish', nationality: 'Scotland', aliases: ['dalglish', 'king kenny'], teams: ['Liverpool', 'Celtic', 'Scotland'] },
	{ name: 'Graeme Souness', firstName: 'Graeme', lastName: 'Souness', nationality: 'Scotland', aliases: ['souness'], teams: ['Liverpool', 'Sampdoria', 'Scotland'] },
	{ name: 'Kevin Keegan', firstName: 'Kevin', lastName: 'Keegan', nationality: 'England', aliases: ['keegan', 'mighty mouse'], teams: ['Liverpool', 'Hamburger SV', 'England'] },
	{ name: 'Gary Lineker', firstName: 'Gary', lastName: 'Lineker', nationality: 'England', aliases: ['lineker'], teams: ['Tottenham Hotspur', 'Barcelona', 'Leicester City', 'England'] },

	// 1990s LEGENDS
	{ name: 'Ronaldo Nazario', firstName: 'Ronaldo', lastName: 'Luis Nazario de Lima', nationality: 'Brazil', aliases: ['ronaldo', 'r9', 'ronaldo brazil', 'ronaldo fenomeno', 'il fenomeno', 'o fenomeno'], teams: ['Real Madrid', 'Inter Milan', 'Barcelona', 'AC Milan', 'Brazil'] },
	{ name: 'Zinedine Zidane', firstName: 'Zinedine', lastName: 'Zidane', nationality: 'France', aliases: ['zidane', 'zizou'], teams: ['Real Madrid', 'Juventus', 'France'] },
	{ name: 'Roberto Baggio', firstName: 'Roberto', lastName: 'Baggio', nationality: 'Italy', aliases: ['baggio', 'il divin codino', 'divine ponytail', 'roby'], teams: ['Juventus', 'AC Milan', 'Inter Milan', 'Fiorentina', 'Italy'] },
	{ name: 'George Weah', firstName: 'George', lastName: 'Weah', nationality: 'Liberia', aliases: ['weah'], teams: ['AC Milan', 'Paris Saint-Germain', 'Chelsea'] },
	{ name: 'Romario', firstName: 'Romario', lastName: 'de Souza Faria', nationality: 'Brazil', aliases: ['romario', 'baixinho', 'shorty'], teams: ['Barcelona', 'Flamengo', 'PSV Eindhoven', 'Brazil'] },
	{ name: 'Hristo Stoichkov', firstName: 'Hristo', lastName: 'Stoichkov', nationality: 'Bulgaria', aliases: ['stoichkov'], teams: ['Barcelona'] },
	{ name: 'Dennis Bergkamp', firstName: 'Dennis', lastName: 'Bergkamp', nationality: 'Netherlands', aliases: ['bergkamp', 'iceman', 'non-flying dutchman'], teams: ['Arsenal', 'Ajax', 'Inter Milan', 'Netherlands'] },
	{ name: 'Eric Cantona', firstName: 'Eric', lastName: 'Cantona', nationality: 'France', aliases: ['cantona', 'king eric', 'the king'], teams: ['Manchester United', 'Leeds United', 'France'] },
	{ name: 'Jurgen Klinsmann', firstName: 'Jurgen', lastName: 'Klinsmann', nationality: 'Germany', aliases: ['klinsmann'], teams: ['Tottenham Hotspur', 'Inter Milan', 'Bayern Munich', 'Germany'] },
	{ name: 'Gheorghe Hagi', firstName: 'Gheorghe', lastName: 'Hagi', nationality: 'Romania', aliases: ['hagi', 'maradona of the carpathians'], teams: ['Real Madrid', 'Barcelona', 'Galatasaray', 'Romania'] },
	{ name: 'Gabriel Batistuta', firstName: 'Gabriel', lastName: 'Batistuta', nationality: 'Argentina', aliases: ['batistuta', 'batigol', 'el angel gabriel'], teams: ['Fiorentina', 'AS Roma', 'Argentina'] },
	{ name: 'Davor Suker', firstName: 'Davor', lastName: 'Suker', nationality: 'Croatia', aliases: ['suker'], teams: ['Real Madrid', 'Arsenal', 'Croatia'] },
	{ name: 'Brian Laudrup', firstName: 'Brian', lastName: 'Laudrup', nationality: 'Denmark', aliases: ['laudrup', 'brian laudrup'], teams: ['AC Milan', 'Rangers', 'Denmark'] },
	{ name: 'Michael Laudrup', firstName: 'Michael', lastName: 'Laudrup', nationality: 'Denmark', aliases: ['michael laudrup'], teams: ['Barcelona', 'Real Madrid', 'Juventus', 'Denmark'] },
	{ name: 'Dejan Savicevic', firstName: 'Dejan', lastName: 'Savicevic', nationality: 'Montenegro', aliases: ['savicevic', 'il genio'], teams: ['AC Milan', 'Red Star Belgrade', 'Yugoslavia'] },
	{ name: 'Bebeto', firstName: 'Jose Roberto', lastName: 'Gama de Oliveira', nationality: 'Brazil', aliases: ['bebeto'], teams: ['Deportivo La Coruna', 'Flamengo', 'Brazil'] },
	{ name: 'Roberto Carlos', firstName: 'Roberto', lastName: 'Carlos', nationality: 'Brazil', aliases: ['roberto carlos'], teams: ['Real Madrid', 'Inter Milan', 'Brazil'] },
	{ name: 'Cafu', firstName: 'Marcos Evangelista', lastName: 'de Morais', nationality: 'Brazil', aliases: ['cafu', 'il pendolino'], teams: ['AC Milan', 'AS Roma', 'Sao Paulo', 'Brazil'] },
	{ name: 'Javier Zanetti', firstName: 'Javier', lastName: 'Zanetti', nationality: 'Argentina', aliases: ['zanetti', 'el tractor', 'pupi'], teams: ['Inter Milan', 'Argentina'] },
	{ name: 'Rivaldo', firstName: 'Rivaldo', lastName: 'Vitor Borba Ferreira', nationality: 'Brazil', aliases: ['rivaldo'], teams: ['Barcelona', 'AC Milan', 'Brazil'] },
	{ name: 'Luis Figo', firstName: 'Luis', lastName: 'Figo', nationality: 'Portugal', aliases: ['figo'], teams: ['Real Madrid', 'Barcelona', 'Inter Milan', 'Portugal'] },
	{ name: 'Pavel Nedved', firstName: 'Pavel', lastName: 'Nedved', nationality: 'Czech Republic', aliases: ['nedved', 'furia ceca'], teams: ['Juventus', 'Lazio', 'Czech Republic'] },
	{ name: 'Alessandro Del Piero', firstName: 'Alessandro', lastName: 'Del Piero', nationality: 'Italy', aliases: ['del piero', 'pinturicchio', 'alex'], teams: ['Juventus', 'Italy'] },
	{ name: 'Filippo Inzaghi', firstName: 'Filippo', lastName: 'Inzaghi', nationality: 'Italy', aliases: ['inzaghi', 'pippo', 'super pippo'], teams: ['AC Milan', 'Juventus', 'Italy'] },
	{ name: 'Christian Vieri', firstName: 'Christian', lastName: 'Vieri', nationality: 'Italy', aliases: ['vieri', 'bobo'], teams: ['Inter Milan', 'Juventus', 'Lazio', 'AC Milan', 'Italy'] },
	{ name: 'Hernan Crespo', firstName: 'Hernan', lastName: 'Crespo', nationality: 'Argentina', aliases: ['crespo', 'valderrama'], teams: ['Inter Milan', 'AC Milan', 'Chelsea', 'Lazio', 'Parma', 'Argentina'] },
	{ name: 'Clarence Seedorf', firstName: 'Clarence', lastName: 'Seedorf', nationality: 'Netherlands', aliases: ['seedorf'], teams: ['AC Milan', 'Real Madrid', 'Inter Milan', 'Ajax', 'Netherlands'] },
	{ name: 'Edgar Davids', firstName: 'Edgar', lastName: 'Davids', nationality: 'Netherlands', aliases: ['davids', 'pitbull'], teams: ['Juventus', 'AC Milan', 'Inter Milan', 'Ajax', 'Barcelona', 'Netherlands'] },
	{ name: 'Patrick Vieira', firstName: 'Patrick', lastName: 'Vieira', nationality: 'France', aliases: ['vieira'], teams: ['Arsenal', 'Juventus', 'Inter Milan', 'Manchester City', 'France'] },
	{ name: 'Roy Keane', firstName: 'Roy', lastName: 'Keane', nationality: 'Ireland', aliases: ['keane', 'keano'], teams: ['Manchester United', 'Republic of Ireland'] },
	{ name: 'Paul Scholes', firstName: 'Paul', lastName: 'Scholes', nationality: 'England', aliases: ['scholes', 'scholesy', 'ginger prince'], teams: ['Manchester United', 'England'] },
	{ name: 'Ryan Giggs', firstName: 'Ryan', lastName: 'Giggs', nationality: 'Wales', aliases: ['giggs', 'giggsy'], teams: ['Manchester United', 'Wales'] },

	// 2000s STARS
	{ name: 'Ronaldinho', firstName: 'Ronaldo', lastName: 'de Assis Moreira', nationality: 'Brazil', aliases: ['ronaldinho', 'ronaldinho gaucho', 'dinho', 'r10'], teams: ['Barcelona', 'AC Milan', 'Paris Saint-Germain', 'Gremio', 'Flamengo', 'Brazil'] },
	{ name: 'Kaka', firstName: 'Ricardo', lastName: 'Izecson dos Santos Leite', nationality: 'Brazil', aliases: ['kaka', 'ricky'], teams: ['AC Milan', 'Real Madrid', 'Sao Paulo', 'Brazil'] },
	{ name: 'Thierry Henry', firstName: 'Thierry', lastName: 'Henry', nationality: 'France', aliases: ['henry', 'titi', 'king henry', 'va va voom'], teams: ['Arsenal', 'Barcelona', 'France'] },
	{ name: 'Raul', firstName: 'Raul', lastName: 'Gonzalez Blanco', nationality: 'Spain', aliases: ['raul', 'el angel de madrid'], teams: ['Real Madrid', 'Schalke 04', 'Spain'] },
	{ name: 'Samuel Etoo', firstName: 'Samuel', lastName: 'Etoo', nationality: 'Cameroon', aliases: ['etoo', 'eto\'o'], teams: ['Barcelona', 'Inter Milan', 'Chelsea', 'Cameroon'] },
	{ name: 'Didier Drogba', firstName: 'Didier', lastName: 'Drogba', nationality: 'Ivory Coast', aliases: ['drogba'], teams: ['Chelsea', 'Olympique de Marseille', 'Galatasaray'] },
	{ name: 'David Villa', firstName: 'David', lastName: 'Villa', nationality: 'Spain', aliases: ['villa', 'el guaje'], teams: ['Barcelona', 'Valencia', 'Atletico Madrid', 'Spain'] },
	{ name: 'Fernando Torres', firstName: 'Fernando', lastName: 'Torres', nationality: 'Spain', aliases: ['torres', 'el nino', 'fernando'], teams: ['Liverpool', 'Chelsea', 'Atletico Madrid', 'Spain'] },
	{ name: 'Xavi', firstName: 'Xavier', lastName: 'Hernandez Creus', nationality: 'Spain', aliases: ['xavi', 'xavi hernandez'], teams: ['Barcelona', 'Spain'] },
	{ name: 'Andres Iniesta', firstName: 'Andres', lastName: 'Iniesta', nationality: 'Spain', aliases: ['iniesta', 'el ilusionista', 'don andres'], teams: ['Barcelona', 'Spain'] },
	{ name: 'Carles Puyol', firstName: 'Carles', lastName: 'Puyol', nationality: 'Spain', aliases: ['puyol', 'puyi', 'tarzan'], teams: ['Barcelona', 'Spain'] },
	{ name: 'Iker Casillas', firstName: 'Iker', lastName: 'Casillas', nationality: 'Spain', aliases: ['casillas', 'san iker', 'saint iker'], teams: ['Real Madrid', 'FC Porto', 'Spain'] },
	{ name: 'Gianluigi Buffon', firstName: 'Gianluigi', lastName: 'Buffon', nationality: 'Italy', aliases: ['buffon', 'gigi'], teams: ['Juventus', 'Paris Saint-Germain', 'Parma', 'Italy'] },
	{ name: 'Andrea Pirlo', firstName: 'Andrea', lastName: 'Pirlo', nationality: 'Italy', aliases: ['pirlo', 'maestro', 'l\'architetto'], teams: ['AC Milan', 'Juventus', 'Inter Milan', 'Italy'] },
	{ name: 'Francesco Totti', firstName: 'Francesco', lastName: 'Totti', nationality: 'Italy', aliases: ['totti', 'il capitano', 'er pupone', 'king of rome'], teams: ['AS Roma', 'Italy'] },
	{ name: 'Fabio Cannavaro', firstName: 'Fabio', lastName: 'Cannavaro', nationality: 'Italy', aliases: ['cannavaro'], teams: ['Real Madrid', 'Juventus', 'Inter Milan', 'Parma', 'Napoli', 'Italy'] },
	{ name: 'Alessandro Nesta', firstName: 'Alessandro', lastName: 'Nesta', nationality: 'Italy', aliases: ['nesta'], teams: ['AC Milan', 'Lazio', 'Italy'] },
	{ name: 'Zlatan Ibrahimovic', firstName: 'Zlatan', lastName: 'Ibrahimovic', nationality: 'Sweden', aliases: ['ibrahimovic', 'zlatan', 'ibra'], teams: ['AC Milan', 'Inter Milan', 'Barcelona', 'Paris Saint-Germain', 'Manchester United', 'Juventus', 'Ajax', 'Sweden'] },
	{ name: 'Arjen Robben', firstName: 'Arjen', lastName: 'Robben', nationality: 'Netherlands', aliases: ['robben'], teams: ['Bayern Munich', 'Real Madrid', 'Chelsea', 'PSV Eindhoven', 'Netherlands'] },
	{ name: 'Franck Ribery', firstName: 'Franck', lastName: 'Ribery', nationality: 'France', aliases: ['ribery', 'scarface'], teams: ['Bayern Munich', 'Olympique de Marseille', 'Fiorentina', 'France'] },
	{ name: 'Michael Ballack', firstName: 'Michael', lastName: 'Ballack', nationality: 'Germany', aliases: ['ballack', 'little kaiser'], teams: ['Chelsea', 'Bayern Munich', 'Bayer Leverkusen', 'Germany'] },
	{ name: 'Miroslav Klose', firstName: 'Miroslav', lastName: 'Klose', nationality: 'Germany', aliases: ['klose', 'miro'], teams: ['Bayern Munich', 'Werder Bremen', 'Lazio', 'Germany'] },
	{ name: 'Juan Roman Riquelme', firstName: 'Juan Roman', lastName: 'Riquelme', nationality: 'Argentina', aliases: ['riquelme', 'torero'], teams: ['Boca Juniors', 'Barcelona', 'Villarreal', 'Argentina'] },
	{ name: 'Carlos Tevez', firstName: 'Carlos', lastName: 'Tevez', nationality: 'Argentina', aliases: ['tevez', 'carlitos', 'el apache'], teams: ['Manchester United', 'Manchester City', 'Juventus', 'Boca Juniors', 'Argentina'] },
	{ name: 'Sergio Aguero', firstName: 'Sergio', lastName: 'Aguero', nationality: 'Argentina', aliases: ['aguero', 'kun', 'kun aguero'], teams: ['Manchester City', 'Atletico Madrid', 'Barcelona', 'Argentina'] },
	{ name: 'Ruud van Nistelrooy', firstName: 'Ruud', lastName: 'van Nistelrooy', nationality: 'Netherlands', aliases: ['van nistelrooy', 'ruud'], teams: ['Manchester United', 'Real Madrid', 'PSV Eindhoven', 'Netherlands'] },
	{ name: 'Robin van Persie', firstName: 'Robin', lastName: 'van Persie', nationality: 'Netherlands', aliases: ['van persie', 'rvp'], teams: ['Arsenal', 'Manchester United', 'Feyenoord', 'Netherlands'] },
	{ name: 'Wesley Sneijder', firstName: 'Wesley', lastName: 'Sneijder', nationality: 'Netherlands', aliases: ['sneijder'], teams: ['Real Madrid', 'Inter Milan', 'Ajax', 'Galatasaray', 'Netherlands'] },
	{ name: 'John Terry', firstName: 'John', lastName: 'Terry', nationality: 'England', aliases: ['terry', 'jt'], teams: ['Chelsea', 'England'] },
	{ name: 'Rio Ferdinand', firstName: 'Rio', lastName: 'Ferdinand', nationality: 'England', aliases: ['ferdinand', 'rio'], teams: ['Manchester United', 'Leeds United', 'West Ham United', 'England'] },
	{ name: 'Ashley Cole', firstName: 'Ashley', lastName: 'Cole', nationality: 'England', aliases: ['cole', 'ashley cole'], teams: ['Arsenal', 'Chelsea', 'AS Roma', 'England'] },
	{ name: 'Steven Gerrard', firstName: 'Steven', lastName: 'Gerrard', nationality: 'England', aliases: ['gerrard', 'stevie g', 'stevie'], teams: ['Liverpool', 'England'] },
	{ name: 'Frank Lampard', firstName: 'Frank', lastName: 'Lampard', nationality: 'England', aliases: ['lampard', 'lamps', 'super frank'], teams: ['Chelsea', 'Manchester City', 'West Ham United', 'England'] },
	{ name: 'Wayne Rooney', firstName: 'Wayne', lastName: 'Rooney', nationality: 'England', aliases: ['rooney', 'wazza'], teams: ['Manchester United', 'Everton', 'England'] },
	{ name: 'Michael Owen', firstName: 'Michael', lastName: 'Owen', nationality: 'England', aliases: ['owen', 'mickey'], teams: ['Liverpool', 'Real Madrid', 'Manchester United', 'Newcastle United', 'England'] },
	{ name: 'David Beckham', firstName: 'David', lastName: 'Beckham', nationality: 'England', aliases: ['beckham', 'becks', 'golden balls'], teams: ['Manchester United', 'Real Madrid', 'Paris Saint-Germain', 'AC Milan', 'England'] },
	{ name: 'Alan Shearer', firstName: 'Alan', lastName: 'Shearer', nationality: 'England', aliases: ['shearer'], teams: ['Newcastle United', 'Southampton', 'England'] },
	{ name: 'Ole Gunnar Solskjaer', firstName: 'Ole Gunnar', lastName: 'Solskjaer', nationality: 'Norway', aliases: ['solskjaer', 'ole', 'baby faced assassin'], teams: ['Manchester United'] },
	{ name: 'Peter Schmeichel', firstName: 'Peter', lastName: 'Schmeichel', nationality: 'Denmark', aliases: ['schmeichel', 'great dane'], teams: ['Manchester United', 'Manchester City', 'Denmark'] },
	{ name: 'Edwin van der Sar', firstName: 'Edwin', lastName: 'van der Sar', nationality: 'Netherlands', aliases: ['van der sar'], teams: ['Manchester United', 'Fulham', 'Juventus', 'Ajax', 'Netherlands'] },
	{ name: 'Oliver Kahn', firstName: 'Oliver', lastName: 'Kahn', nationality: 'Germany', aliases: ['kahn', 'der titan'], teams: ['Bayern Munich', 'Germany'] },
	{ name: 'Deco', firstName: 'Anderson Luis', lastName: 'de Souza', nationality: 'Portugal', aliases: ['deco'], teams: ['Barcelona', 'Chelsea', 'FC Porto', 'Portugal'] },
	{ name: 'Claude Makelele', firstName: 'Claude', lastName: 'Makelele', nationality: 'France', aliases: ['makelele'], teams: ['Chelsea', 'Real Madrid', 'France'] },
	{ name: 'Lilian Thuram', firstName: 'Lilian', lastName: 'Thuram', nationality: 'France', aliases: ['thuram'], teams: ['Juventus', 'Barcelona', 'Parma', 'France'] },

	// 2010s & MODERN STARS
	{ name: 'Cristiano Ronaldo', firstName: 'Cristiano', lastName: 'Ronaldo', nationality: 'Portugal', aliases: ['ronaldo', 'cr7', 'cristiano', 'cr'], teams: ['Manchester United', 'Real Madrid', 'Juventus', 'Portugal'] },
	{ name: 'Lionel Messi', firstName: 'Lionel', lastName: 'Messi', nationality: 'Argentina', aliases: ['messi', 'leo messi', 'la pulga', 'leo', 'goat'], teams: ['Barcelona', 'Paris Saint-Germain', 'Argentina'] },
	{ name: 'Neymar', firstName: 'Neymar', lastName: 'da Silva Santos Junior', nationality: 'Brazil', aliases: ['neymar', 'ney', 'njr'], teams: ['Paris Saint-Germain', 'Barcelona', 'Santos', 'Brazil'] },
	{ name: 'Kylian Mbappe', firstName: 'Kylian', lastName: 'Mbappe', nationality: 'France', aliases: ['mbappe', 'donatello', 'kmbappe'], teams: ['Paris Saint-Germain', 'Real Madrid', 'AS Monaco', 'France'] },
	{ name: 'Erling Haaland', firstName: 'Erling', lastName: 'Haaland', nationality: 'Norway', aliases: ['haaland', 'erling'], teams: ['Manchester City', 'Borussia Dortmund'] },
	{ name: 'Luka Modric', firstName: 'Luka', lastName: 'Modric', nationality: 'Croatia', aliases: ['modric'], teams: ['Real Madrid', 'Tottenham Hotspur', 'Croatia'] },
	{ name: 'Toni Kroos', firstName: 'Toni', lastName: 'Kroos', nationality: 'Germany', aliases: ['kroos'], teams: ['Real Madrid', 'Bayern Munich', 'Germany'] },
	{ name: 'Karim Benzema', firstName: 'Karim', lastName: 'Benzema', nationality: 'France', aliases: ['benzema', 'benz', 'nueve'], teams: ['Real Madrid', 'Olympique Lyonnais', 'France'] },
	{ name: 'Robert Lewandowski', firstName: 'Robert', lastName: 'Lewandowski', nationality: 'Poland', aliases: ['lewandowski', 'lewy'], teams: ['Bayern Munich', 'Borussia Dortmund', 'Barcelona', 'Poland'] },
	{ name: 'Luis Suarez', firstName: 'Luis', lastName: 'Suarez', nationality: 'Uruguay', aliases: ['suarez', 'el pistolero', 'luisito'], teams: ['Barcelona', 'Liverpool', 'Atletico Madrid', 'Ajax', 'Uruguay'] },
	{ name: 'Sergio Ramos', firstName: 'Sergio', lastName: 'Ramos', nationality: 'Spain', aliases: ['ramos', 'sr4'], teams: ['Real Madrid', 'Paris Saint-Germain', 'Sevilla', 'Spain'] },
	{ name: 'Gerard Pique', firstName: 'Gerard', lastName: 'Pique', nationality: 'Spain', aliases: ['pique'], teams: ['Barcelona', 'Manchester United', 'Spain'] },
	{ name: 'Sergio Busquets', firstName: 'Sergio', lastName: 'Busquets', nationality: 'Spain', aliases: ['busquets', 'busi'], teams: ['Barcelona', 'Spain'] },
	{ name: 'Manuel Neuer', firstName: 'Manuel', lastName: 'Neuer', nationality: 'Germany', aliases: ['neuer'], teams: ['Bayern Munich', 'Schalke 04', 'Germany'] },
	{ name: 'Thomas Muller', firstName: 'Thomas', lastName: 'Muller', nationality: 'Germany', aliases: ['muller', 'thomas muller', 'raumdeuter'], teams: ['Bayern Munich', 'Germany'] },
	{ name: 'Marco Reus', firstName: 'Marco', lastName: 'Reus', nationality: 'Germany', aliases: ['reus'], teams: ['Borussia Dortmund', 'Borussia Monchengladbach', 'Germany'] },
	{ name: 'Antoine Griezmann', firstName: 'Antoine', lastName: 'Griezmann', nationality: 'France', aliases: ['griezmann', 'grizi', 'le petit prince'], teams: ['Atletico Madrid', 'Barcelona', 'Real Sociedad', 'France'] },
	{ name: 'Paul Pogba', firstName: 'Paul', lastName: 'Pogba', nationality: 'France', aliases: ['pogba', 'la pioche', 'pp'], teams: ['Manchester United', 'Juventus', 'France'] },
	{ name: 'NGolo Kante', firstName: 'N\'Golo', lastName: 'Kante', nationality: 'France', aliases: ['kante', 'ngolo'], teams: ['Chelsea', 'Leicester City', 'France'] },
	{ name: 'Kevin De Bruyne', firstName: 'Kevin', lastName: 'De Bruyne', nationality: 'Belgium', aliases: ['de bruyne', 'kdb'], teams: ['Manchester City', 'Chelsea', 'VfL Wolfsburg', 'Belgium'] },
	{ name: 'Eden Hazard', firstName: 'Eden', lastName: 'Hazard', nationality: 'Belgium', aliases: ['hazard'], teams: ['Chelsea', 'Real Madrid', 'Lille', 'Belgium'] },
	{ name: 'Romelu Lukaku', firstName: 'Romelu', lastName: 'Lukaku', nationality: 'Belgium', aliases: ['lukaku', 'big rom'], teams: ['Chelsea', 'Inter Milan', 'Manchester United', 'Everton', 'Belgium'] },
	{ name: 'Harry Kane', firstName: 'Harry', lastName: 'Kane', nationality: 'England', aliases: ['kane', 'hurricane'], teams: ['Tottenham Hotspur', 'Bayern Munich', 'England'] },
	{ name: 'Gareth Bale', firstName: 'Gareth', lastName: 'Bale', nationality: 'Wales', aliases: ['bale', 'the express'], teams: ['Real Madrid', 'Tottenham Hotspur', 'Wales'] },
	{ name: 'Mohamed Salah', firstName: 'Mohamed', lastName: 'Salah', nationality: 'Egypt', aliases: ['salah', 'mo salah', 'egyptian king'], teams: ['Liverpool', 'Chelsea', 'AS Roma', 'Fiorentina'] },
	{ name: 'Sadio Mane', firstName: 'Sadio', lastName: 'Mane', nationality: 'Senegal', aliases: ['mane'], teams: ['Liverpool', 'Bayern Munich', 'Southampton', 'Senegal'] },
	{ name: 'Virgil van Dijk', firstName: 'Virgil', lastName: 'van Dijk', nationality: 'Netherlands', aliases: ['van dijk', 'vvd'], teams: ['Liverpool', 'Southampton', 'Celtic', 'Netherlands'] },
	{ name: 'Alisson Becker', firstName: 'Alisson', lastName: 'Becker', nationality: 'Brazil', aliases: ['alisson'], teams: ['Liverpool', 'AS Roma', 'Brazil'] },
	{ name: 'Ederson', firstName: 'Ederson', lastName: 'Santana de Moraes', nationality: 'Brazil', aliases: ['ederson'], teams: ['Manchester City', 'Benfica', 'Brazil'] },
	{ name: 'Thibaut Courtois', firstName: 'Thibaut', lastName: 'Courtois', nationality: 'Belgium', aliases: ['courtois'], teams: ['Real Madrid', 'Chelsea', 'Atletico Madrid', 'Belgium'] },
	{ name: 'Jan Oblak', firstName: 'Jan', lastName: 'Oblak', nationality: 'Slovenia', aliases: ['oblak'], teams: ['Atletico Madrid', 'Benfica'] },
	{ name: 'Giorgio Chiellini', firstName: 'Giorgio', lastName: 'Chiellini', nationality: 'Italy', aliases: ['chiellini', 'king kong'], teams: ['Juventus', 'Italy'] },
	{ name: 'Leonardo Bonucci', firstName: 'Leonardo', lastName: 'Bonucci', nationality: 'Italy', aliases: ['bonucci'], teams: ['Juventus', 'AC Milan', 'Italy'] },
	{ name: 'Edinson Cavani', firstName: 'Edinson', lastName: 'Cavani', nationality: 'Uruguay', aliases: ['cavani', 'el matador'], teams: ['Paris Saint-Germain', 'Napoli', 'Manchester United', 'Uruguay'] },
	{ name: 'Angel Di Maria', firstName: 'Angel', lastName: 'Di Maria', nationality: 'Argentina', aliases: ['di maria', 'fideo', 'angelito'], teams: ['Real Madrid', 'Paris Saint-Germain', 'Manchester United', 'Benfica', 'Juventus', 'Argentina'] },
	{ name: 'James Rodriguez', firstName: 'James', lastName: 'Rodriguez', nationality: 'Colombia', aliases: ['james', 'james rodriguez'], teams: ['Real Madrid', 'Bayern Munich', 'Everton', 'AS Monaco', 'FC Porto', 'Colombia'] },
	{ name: 'Radamel Falcao', firstName: 'Radamel', lastName: 'Falcao', nationality: 'Colombia', aliases: ['falcao', 'el tigre'], teams: ['Atletico Madrid', 'AS Monaco', 'Manchester United', 'Chelsea', 'FC Porto', 'Colombia'] },
	{ name: 'Alexis Sanchez', firstName: 'Alexis', lastName: 'Sanchez', nationality: 'Chile', aliases: ['alexis', 'alexis sanchez', 'el nino maravilla'], teams: ['Arsenal', 'Barcelona', 'Manchester United', 'Inter Milan', 'Chile'] },
	{ name: 'Arturo Vidal', firstName: 'Arturo', lastName: 'Vidal', nationality: 'Chile', aliases: ['vidal', 'el rey', 'el guerrero'], teams: ['Juventus', 'Bayern Munich', 'Barcelona', 'Inter Milan', 'Chile'] },
	{ name: 'Thiago Silva', firstName: 'Thiago', lastName: 'Silva', nationality: 'Brazil', aliases: ['thiago silva', 'o monstro'], teams: ['Paris Saint-Germain', 'AC Milan', 'Chelsea', 'Brazil'] },
	{ name: 'David Silva', firstName: 'David', lastName: 'Silva', nationality: 'Spain', aliases: ['david silva', 'el mago', 'merlin'], teams: ['Manchester City', 'Valencia', 'Real Sociedad', 'Spain'] },
	{ name: 'Dani Alves', firstName: 'Daniel', lastName: 'Alves', nationality: 'Brazil', aliases: ['dani alves', 'alves'], teams: ['Barcelona', 'Paris Saint-Germain', 'Juventus', 'Sevilla', 'Brazil'] },
	{ name: 'Marcelo', firstName: 'Marcelo', lastName: 'Vieira da Silva', nationality: 'Brazil', aliases: ['marcelo'], teams: ['Real Madrid', 'Brazil'] },
	{ name: 'Philipp Lahm', firstName: 'Philipp', lastName: 'Lahm', nationality: 'Germany', aliases: ['lahm', 'die biene'], teams: ['Bayern Munich', 'Germany'] },
	{ name: 'Bastian Schweinsteiger', firstName: 'Bastian', lastName: 'Schweinsteiger', nationality: 'Germany', aliases: ['schweinsteiger', 'schweini', 'basti'], teams: ['Bayern Munich', 'Manchester United', 'Germany'] },

	// CURRENT / EMERGING STARS (2020s)
	{ name: 'Vinicius Junior', firstName: 'Vinicius', lastName: 'Jose Paixao de Oliveira Junior', nationality: 'Brazil', aliases: ['vinicius', 'vini jr', 'vinicius jr'], teams: ['Real Madrid', 'Brazil'] },
	{ name: 'Jude Bellingham', firstName: 'Jude', lastName: 'Bellingham', nationality: 'England', aliases: ['bellingham', 'jude'], teams: ['Real Madrid', 'Borussia Dortmund', 'England'] },
	{ name: 'Phil Foden', firstName: 'Phil', lastName: 'Foden', nationality: 'England', aliases: ['foden', 'stockport iniesta'], teams: ['Manchester City', 'England'] },
	{ name: 'Bukayo Saka', firstName: 'Bukayo', lastName: 'Saka', nationality: 'England', aliases: ['saka', 'starboy', 'little chilli'], teams: ['Arsenal', 'England'] },
	{ name: 'Pedri', firstName: 'Pedro', lastName: 'Gonzalez Lopez', nationality: 'Spain', aliases: ['pedri'], teams: ['Barcelona', 'Spain'] },
	{ name: 'Gavi', firstName: 'Pablo Martin', lastName: 'Paez Gavira', nationality: 'Spain', aliases: ['gavi'], teams: ['Barcelona', 'Spain'] },
	{ name: 'Jamal Musiala', firstName: 'Jamal', lastName: 'Musiala', nationality: 'Germany', aliases: ['musiala', 'bambi'], teams: ['Bayern Munich', 'Germany'] },
	{ name: 'Florian Wirtz', firstName: 'Florian', lastName: 'Wirtz', nationality: 'Germany', aliases: ['wirtz'], teams: ['Bayer Leverkusen', 'Germany'] },
	{ name: 'Marcus Rashford', firstName: 'Marcus', lastName: 'Rashford', nationality: 'England', aliases: ['rashford', 'rashy'], teams: ['Manchester United', 'England'] },
	{ name: 'Bruno Fernandes', firstName: 'Bruno', lastName: 'Fernandes', nationality: 'Portugal', aliases: ['bruno', 'bruno fernandes', 'magnifico'], teams: ['Manchester United', 'Sporting CP', 'Portugal'] },
	{ name: 'Declan Rice', firstName: 'Declan', lastName: 'Rice', nationality: 'England', aliases: ['rice', 'declan'], teams: ['Arsenal', 'West Ham United', 'England'] },
	{ name: 'Martin Odegaard', firstName: 'Martin', lastName: 'Odegaard', nationality: 'Norway', aliases: ['odegaard'], teams: ['Arsenal', 'Real Madrid', 'Real Sociedad'] },
	{ name: 'Rodri', firstName: 'Rodrigo', lastName: 'Hernandez Cascante', nationality: 'Spain', aliases: ['rodri'], teams: ['Manchester City', 'Atletico Madrid', 'Spain'] },
	{ name: 'Bernardo Silva', firstName: 'Bernardo', lastName: 'Silva', nationality: 'Portugal', aliases: ['bernardo', 'bernardo silva'], teams: ['Manchester City', 'AS Monaco', 'Portugal'] },
	{ name: 'Joao Cancelo', firstName: 'Joao', lastName: 'Cancelo', nationality: 'Portugal', aliases: ['cancelo'], teams: ['Manchester City', 'Barcelona', 'Bayern Munich', 'Juventus', 'Portugal'] },
	{ name: 'Ruben Dias', firstName: 'Ruben', lastName: 'Dias', nationality: 'Portugal', aliases: ['dias', 'ruben dias'], teams: ['Manchester City', 'Benfica', 'Portugal'] },
	{ name: 'Federico Valverde', firstName: 'Federico', lastName: 'Valverde', nationality: 'Uruguay', aliases: ['valverde', 'fede', 'pajarito'], teams: ['Real Madrid', 'Uruguay'] },
	{ name: 'Eduardo Camavinga', firstName: 'Eduardo', lastName: 'Camavinga', nationality: 'France', aliases: ['camavinga', 'cama'], teams: ['Real Madrid', 'Stade Rennais', 'France'] },
	{ name: 'Aurelien Tchouameni', firstName: 'Aurelien', lastName: 'Tchouameni', nationality: 'France', aliases: ['tchouameni'], teams: ['Real Madrid', 'AS Monaco', 'France'] },
	{ name: 'Victor Osimhen', firstName: 'Victor', lastName: 'Osimhen', nationality: 'Nigeria', aliases: ['osimhen'], teams: ['Napoli', 'Lille', 'Nigeria'] },
	{ name: 'Rafael Leao', firstName: 'Rafael', lastName: 'Leao', nationality: 'Portugal', aliases: ['leao', 'rafael leao'], teams: ['AC Milan', 'Lille', 'Portugal'] },
	{ name: 'Lautaro Martinez', firstName: 'Lautaro', lastName: 'Martinez', nationality: 'Argentina', aliases: ['lautaro', 'el toro'], teams: ['Inter Milan', 'Argentina'] },
	{ name: 'Julian Alvarez', firstName: 'Julian', lastName: 'Alvarez', nationality: 'Argentina', aliases: ['alvarez', 'spider'], teams: ['Manchester City', 'River Plate', 'Argentina'] },
	{ name: 'Enzo Fernandez', firstName: 'Enzo', lastName: 'Fernandez', nationality: 'Argentina', aliases: ['enzo', 'enzo fernandez'], teams: ['Chelsea', 'Benfica', 'River Plate', 'Argentina'] },
];

// =============================================================================
// SEEDING FUNCTION
// =============================================================================

async function seed() {
	console.log('Starting database seed...\n');

	const syncId = generateId();
	await db.insert(syncLogs).values({
		id: syncId,
		syncType: 'seed_script',
		status: 'started'
	});

	try {
		let teamsProcessed = 0;
		let playersProcessed = 0;
		let competitionsProcessed = 0;
		const teamIdMap = new Map<string, string>();

		// Insert competitions
		console.log('Seeding competitions...');
		for (const compData of ALL_COMPETITIONS) {
			const existingComp = await db
				.select()
				.from(competitions)
				.where(eq(competitions.name, compData.name))
				.get();

			if (!existingComp) {
				await db.insert(competitions).values({
					id: generateId(),
					name: compData.name,
					shortName: compData.shortName,
					type: compData.type,
					country: compData.country,
					isInternational: compData.isInternational
				});
				competitionsProcessed++;
			}
		}
		console.log(`  ✓ Processed ${competitionsProcessed} new competitions (${ALL_COMPETITIONS.length} total)\n`);

		// Insert teams
		console.log('Seeding teams...');
		for (const teamData of ALL_TEAMS) {
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
					isNationalTeam: (teamData as any).isNationalTeam ?? false
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
		console.log(`  ✓ Processed ${teamsProcessed} new teams (${ALL_TEAMS.length} total)\n`);

		// Insert players
		console.log('Seeding players...');
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
		console.log(`  ✓ Processed ${playersProcessed} new players (${SAMPLE_PLAYERS.length} total)\n`);

		await db
			.update(syncLogs)
			.set({
				status: 'completed',
				recordsProcessed: competitionsProcessed + teamsProcessed + playersProcessed
			})
			.where(eq(syncLogs.id, syncId));

		console.log('Seed completed successfully!');
		console.log(`  Competitions: ${competitionsProcessed} new`);
		console.log(`  Teams: ${teamsProcessed} new`);
		console.log(`  Players: ${playersProcessed} new`);
	} catch (error) {
		await db
			.update(syncLogs)
			.set({
				status: 'failed',
				errorMessage: String(error)
			})
			.where(eq(syncLogs.id, syncId));
		console.error('Seed failed:', error);
		process.exit(1);
	}
}

// Run the seed
seed().then(() => process.exit(0));
