import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { teams, teamAliases } from '$lib/server/db/schema';
import { like, or, eq, and } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q')?.toLowerCase().trim();
	const internationalParam = url.searchParams.get('international');

	if (!query || query.length < 2) {
		return json({ suggestions: [] });
	}

	const searchPattern = `%${query}%`;

	try {
		// Build where conditions
		const searchCondition = or(
			like(teams.name, searchPattern),
			like(teams.shortName, searchPattern),
			like(teams.code, searchPattern)
		);

		// Filter by team type if international param is specified
		let whereCondition;
		if (internationalParam === 'true') {
			// Only national teams
			whereCondition = and(searchCondition, eq(teams.isNationalTeam, true));
		} else if (internationalParam === 'false') {
			// Only club teams
			whereCondition = and(searchCondition, eq(teams.isNationalTeam, false));
		} else {
			// No filter - show all teams
			whereCondition = searchCondition;
		}

		// Search teams by name, short name, or code
		const results = await db
			.selectDistinct({
				id: teams.id,
				name: teams.name,
				shortName: teams.shortName,
				country: teams.country,
				isNationalTeam: teams.isNationalTeam
			})
			.from(teams)
			.where(whereCondition)
			.limit(10);

		// Also search in aliases if we don't have enough results
		if (results.length < 5) {
			// Build alias where condition based on international param
			let aliasWhereCondition;
			if (internationalParam === 'true') {
				aliasWhereCondition = and(like(teamAliases.alias, searchPattern), eq(teams.isNationalTeam, true));
			} else if (internationalParam === 'false') {
				aliasWhereCondition = and(like(teamAliases.alias, searchPattern), eq(teams.isNationalTeam, false));
			} else {
				aliasWhereCondition = like(teamAliases.alias, searchPattern);
			}

			const aliasResults = await db
				.selectDistinct({
					id: teams.id,
					name: teams.name,
					shortName: teams.shortName,
					country: teams.country,
					isNationalTeam: teams.isNationalTeam
				})
				.from(teams)
				.innerJoin(teamAliases, eq(teamAliases.teamId, teams.id))
				.where(aliasWhereCondition)
				.limit(10 - results.length);

			// Merge and dedupe
			const existingIds = new Set(results.map((r) => r.id));
			for (const alias of aliasResults) {
				if (!existingIds.has(alias.id)) {
					results.push(alias);
				}
			}
		}

		return json(
			{
				suggestions: results.map((r) => ({
					id: r.id,
					label: r.name,
					sublabel: r.country ?? undefined
				}))
			},
			{
				headers: {
					'Cache-Control': 'public, max-age=300' // 5 minutes
				}
			}
		);
	} catch (error) {
		console.error('Team search error:', error);
		return json({ suggestions: [] });
	}
};
