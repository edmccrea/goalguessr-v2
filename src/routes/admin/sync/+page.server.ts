import type { PageServerLoad, Actions } from './$types';
import { syncSampleData, getSyncStatus } from '$lib/server/sync';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const status = await getSyncStatus();
	return { status };
};

export const actions: Actions = {
	sync: async () => {
		try {
			const result = await syncSampleData();
			return {
				success: true,
				message: `Synced ${result.teams} teams and ${result.players} players`
			};
		} catch (error) {
			return fail(500, {
				error: `Sync failed: ${error}`
			});
		}
	}
};
