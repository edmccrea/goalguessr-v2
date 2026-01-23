import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { teams, teamAliases } from '$lib/server/db/schema';
import { like, or, eq, and } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q')?.toLowerCase().trim();
	const isInternational = url.searchParams.get('international') === 'true';

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

		const whereCondition = isInternational
			? and(searchCondition, eq(teams.isNationalTeam, true))
			: searchCondition;

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
				.where(
					isInternational
						? and(like(teamAliases.alias, searchPattern), eq(teams.isNationalTeam, true))
						: like(teamAliases.alias, searchPattern)
				)
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
