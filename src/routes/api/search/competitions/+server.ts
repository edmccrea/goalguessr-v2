import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { competitions } from '$lib/server/db/schema';
import { like, or, eq, and } from 'drizzle-orm';
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
		// Build where conditions
		const searchCondition = or(
			like(competitions.name, searchPattern),
			like(competitions.shortName, searchPattern)
		);

		// Filter by competition type if international param is specified
		let whereCondition;
		if (internationalParam === 'true') {
			// Only international competitions
			whereCondition = and(searchCondition, eq(competitions.isInternational, true));
		} else if (internationalParam === 'false') {
			// Only club/domestic competitions
			whereCondition = and(searchCondition, eq(competitions.isInternational, false));
		} else {
			// No filter - show all competitions
			whereCondition = searchCondition;
		}

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
		console.error('Competition search error:', error instanceof Error ? error.message : 'Unknown error');
		return json({ suggestions: [] });
	}
};
