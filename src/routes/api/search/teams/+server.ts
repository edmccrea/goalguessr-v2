import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { teams, teamAliases } from '$lib/server/db/schema';
import { like, or, eq, and } from 'drizzle-orm';
import { union } from 'drizzle-orm/sqlite-core';
import { checkSearchRateLimit } from '$lib/server/rate-limit';

export const GET: RequestHandler = async ({ url, getClientAddress }) => {
	const query = url.searchParams.get('q')?.toLowerCase().trim();
	const internationalParam = url.searchParams.get('international');

	if (!query || query.length < 2) {
		return json({ suggestions: [] });
	}

	// Rate limit search requests
	const { allowed } = await checkSearchRateLimit(getClientAddress());
	if (!allowed) {
		return json({ suggestions: [] }, { status: 429 });
	}

	const searchPattern = `%${query}%`;

	try {
		// Build international filter condition
		const internationalFilter =
			internationalParam === 'true'
				? eq(teams.isNationalTeam, true)
				: internationalParam === 'false'
					? eq(teams.isNationalTeam, false)
					: undefined;

		// Combined query: search by name/shortName/code UNION search by alias
		const nameCondition = or(
			like(teams.name, searchPattern),
			like(teams.shortName, searchPattern),
			like(teams.code, searchPattern)
		);

		const nameWhere = internationalFilter
			? and(nameCondition, internationalFilter)
			: nameCondition;

		const aliasCondition = like(teamAliases.alias, searchPattern);
		const aliasWhere = internationalFilter
			? and(aliasCondition, internationalFilter)
			: aliasCondition;

		// Combined UNION query: search by name/shortName/code OR by alias
		const nameQuery = db
			.select({
				id: teams.id,
				name: teams.name,
				shortName: teams.shortName,
				country: teams.country,
				isNationalTeam: teams.isNationalTeam
			})
			.from(teams)
			.where(nameWhere);

		const aliasQuery = db
			.select({
				id: teams.id,
				name: teams.name,
				shortName: teams.shortName,
				country: teams.country,
				isNationalTeam: teams.isNationalTeam
			})
			.from(teams)
			.innerJoin(teamAliases, eq(teamAliases.teamId, teams.id))
			.where(aliasWhere);

		const allResults = await union(nameQuery, aliasQuery).limit(10);

		return json(
			{
				suggestions: allResults.map((r) => ({
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
		console.error('Team search error:', error instanceof Error ? error.message : 'Unknown error');
		return json({ suggestions: [] });
	}
};
