import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { competitions } from '$lib/server/db/schema';
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
			like(competitions.name, searchPattern),
			like(competitions.shortName, searchPattern)
		);

		const whereCondition = isInternational
			? and(searchCondition, eq(competitions.isInternational, true))
			: searchCondition;

		// Search competitions by name or short name
		const results = await db
			.selectDistinct({
				id: competitions.id,
				name: competitions.name,
				shortName: competitions.shortName,
				country: competitions.country,
				type: competitions.type
			})
			.from(competitions)
			.where(whereCondition)
			.limit(10);

		return json(
			{
				suggestions: results.map((r) => ({
					id: r.id,
					label: r.name,
					sublabel: r.country ?? r.type
				}))
			},
			{
				headers: {
					'Cache-Control': 'public, max-age=300' // 5 minutes
				}
			}
		);
	} catch (error) {
		console.error('Competition search error:', error);
		return json({ suggestions: [] });
	}
};
