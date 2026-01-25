import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

// Validate DATABASE_URL in production
if (!dev && !env.DATABASE_URL) {
	throw new Error('DATABASE_URL environment variable is required in production');
}

// Warn if using local database in production
if (!dev && env.DATABASE_URL?.startsWith('file:')) {
	console.warn('WARNING: Using local file database in production. Consider using a remote database.');
}

const client = createClient({
	url: env.DATABASE_URL ?? 'file:local.db',
	authToken: env.DATABASE_AUTH_TOKEN
});

export const db = drizzle(client, { schema });
