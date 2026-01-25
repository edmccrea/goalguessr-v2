import { defineConfig } from 'drizzle-kit';

const isLocal = !process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:');

export default defineConfig({
	dialect: isLocal ? 'sqlite' : 'turso',
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dbCredentials: isLocal
		? { url: process.env.DATABASE_URL ?? 'file:local.db' }
		: { url: process.env.DATABASE_URL!, authToken: process.env.DATABASE_AUTH_TOKEN }
});
