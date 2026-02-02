import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { players, playerAliases } from '$lib/server/db/schema';
import { like, or, eq } from 'drizzle-orm';
import { union } from 'drizzle-orm/sqlite-core';
import { checkSearchRateLimit } from '$lib/server/rate-limit';

export const GET: RequestHandler = async ({ url, getClientAddress }) => {
	const query = url.searchParams.get('q')?.toLowerCase().trim();

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
		// Combined UNION query: search by name/lastName OR by alias
		const nameQuery = db
			.select({
				id: players.id,
				name: players.name,
				nationality: players.nationality
			})
			.from(players)
			.where(or(like(players.name, searchPattern), like(players.lastName, searchPattern)));

		const aliasQuery = db
			.select({
				id: players.id,
				name: players.name,
				nationality: players.nationality
			})
			.from(players)
			.innerJoin(playerAliases, eq(playerAliases.playerId, players.id))
			.where(like(playerAliases.alias, searchPattern));

		const results = await union(nameQuery, aliasQuery).limit(10);

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
		console.error('Player search error:', error instanceof Error ? error.message : 'Unknown error');
		return json({ suggestions: [] });
	}
};
