import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

const client = createClient({
	url: env.DATABASE_URL ?? 'file:local.db',
	authToken: env.DATABASE_AUTH_TOKEN
});

export const db = drizzle(client, { schema });
