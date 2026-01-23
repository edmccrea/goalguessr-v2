import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { players, playerAliases } from '$lib/server/db/schema';
import { like, or, eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q')?.toLowerCase().trim();

	if (!query || query.length < 2) {
		return json({ suggestions: [] });
	}

	const searchPattern = `%${query}%`;

	try {
		// Search players by name or last name
		const results = await db
			.selectDistinct({
				id: players.id,
				name: players.name,
				nationality: players.nationality
			})
			.from(players)
			.where(or(like(players.name, searchPattern), like(players.lastName, searchPattern)))
			.limit(10);

		// Also search in aliases if we don't have enough results
		if (results.length < 5) {
			const aliasResults = await db
				.selectDistinct({
					id: players.id,
					name: players.name,
					nationality: players.nationality
				})
				.from(players)
				.innerJoin(playerAliases, eq(playerAliases.playerId, players.id))
				.where(like(playerAliases.alias, searchPattern))
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
					sublabel: r.nationality ?? undefined
				}))
			},
			{
				headers: {
					'Cache-Control': 'public, max-age=300' // 5 minutes
				}
			}
		);
	} catch (error) {
		console.error('Player search error:', error);
		return json({ suggestions: [] });
	}
};
