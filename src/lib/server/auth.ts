import bcrypt from 'bcryptjs';
import { db } from './db';
import { users, sessions, type User } from './db/schema';
import { eq } from 'drizzle-orm';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

export function generateId(): string {
	return crypto.randomUUID();
}

export interface RegisterResult {
	success: boolean;
	user?: User;
	error?: string;
}

export async function registerUser(
	username: string,
	email: string,
	password: string
): Promise<RegisterResult> {
	// Validate inputs
	if (!username || username.length < 3) {
		return { success: false, error: 'Username must be at least 3 characters' };
	}
	if (!email || !email.includes('@')) {
		return { success: false, error: 'Please enter a valid email address' };
	}
	if (!password || password.length < 8) {
		return { success: false, error: 'Password must be at least 8 characters' };
	}

	// Check if username or email already exists
	const existingUsername = await db
		.select()
		.from(users)
		.where(eq(users.username, username))
		.get();
	if (existingUsername) {
		return { success: false, error: 'Username is already taken' };
	}

	const existingEmail = await db.select().from(users).where(eq(users.email, email)).get();
	if (existingEmail) {
		return { success: false, error: 'Email is already registered' };
	}

	// Hash password and create user
	const passwordHash = await hashPassword(password);
	const userId = generateId();

	const [newUser] = await db
		.insert(users)
		.values({
			id: userId,
			username,
			email: email.toLowerCase(),
			passwordHash
		})
		.returning();

	return { success: true, user: newUser };
}

export interface LoginResult {
	success: boolean;
	user?: User;
	error?: string;
}

export async function loginUser(email: string, password: string): Promise<LoginResult> {
	if (!email || !password) {
		return { success: false, error: 'Email and password are required' };
	}

	const user = await db.select().from(users).where(eq(users.email, email.toLowerCase())).get();

	if (!user || !user.passwordHash) {
		return { success: false, error: 'Invalid email or password' };
	}

	const valid = await verifyPassword(password, user.passwordHash);
	if (!valid) {
		return { success: false, error: 'Invalid email or password' };
	}

	return { success: true, user };
}

export async function linkSessionToUser(sessionId: string, userId: string): Promise<void> {
	await db.update(sessions).set({ userId }).where(eq(sessions.id, sessionId));
}

export async function unlinkSession(sessionId: string): Promise<void> {
	await db.update(sessions).set({ userId: null }).where(eq(sessions.id, sessionId));
}

export async function getUserFromSession(sessionId: string): Promise<User | null> {
	const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
	if (!session?.userId) {
		return null;
	}

	const user = await db.select().from(users).where(eq(users.id, session.userId)).get();
	return user ?? null;
}
