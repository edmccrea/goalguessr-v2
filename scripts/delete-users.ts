import { config } from 'dotenv';
config(); // Load .env file

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { users, sessions } from '../src/lib/server/db/schema';

const db = drizzle(createClient({
	url: process.env.DATABASE_URL!,
	authToken: process.env.DATABASE_AUTH_TOKEN
}));

async function deleteUsers() {
	// Delete sessions first (foreign key)
	await db.delete(sessions);
	console.log('Deleted all sessions');

	// Delete users
	await db.delete(users);
	console.log('Deleted all users');
}

deleteUsers().then(() => process.exit(0));
