import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { sql } from 'drizzle-orm';
import { readFileSync } from 'fs';

const isLocal = !process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:');

const client = createClient(
	isLocal
		? { url: process.env.DATABASE_URL ?? 'file:local.db' }
		: { url: process.env.DATABASE_URL!, authToken: process.env.DATABASE_AUTH_TOKEN }
);

const db = drizzle(client);

console.log(`Running migrations against ${isLocal ? 'local' : 'remote'} database...`);

// If the DB was set up via `drizzle-kit push` (not migrations), the migrations
// journal table will be empty but the schema already exists. In that case we
// need to mark all existing migrations as already applied so the migrator
// doesn't try to re-create tables.
await db.run(sql`CREATE TABLE IF NOT EXISTS __drizzle_migrations (
	id SERIAL PRIMARY KEY,
	hash text NOT NULL,
	created_at numeric
)`);

const applied = await db.get<{ count: number }>(
	sql`SELECT COUNT(*) as count FROM __drizzle_migrations`
);

if (applied?.count === 0) {
	// Check if any application tables already exist (i.e. DB was set up via push)
	const tables = await db.get<{ count: number }>(
		sql`SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name NOT LIKE '__drizzle%' AND name NOT LIKE 'sqlite_%'`
	);

	if (tables && tables.count > 0) {
		console.log('Existing schema detected without migration history. Baselining migrations...');
		const journal = JSON.parse(readFileSync('./drizzle/meta/_journal.json', 'utf-8'));
		for (const entry of journal.entries) {
			const hash = readFileSync(`./drizzle/${entry.tag}.sql`, 'utf-8');
			await db.run(
				sql`INSERT INTO __drizzle_migrations (hash, created_at) VALUES (${hash}, ${entry.when})`
			);
		}
		console.log(`Baselined ${journal.entries.length} existing migrations.`);
	}
}

await migrate(db, { migrationsFolder: './drizzle' });

console.log('Migrations complete.');
