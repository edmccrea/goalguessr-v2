import bcrypt from 'bcryptjs';
import { db } from './db';
import { users, sessions, type User } from './db/schema';
import { eq } from 'drizzle-orm';

const SALT_ROUNDS = 10;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COMMON_PASSWORDS = new Set([
	'password', '12345678', '123456789', '1234567890', 'qwerty123', 'password1',
	'iloveyou', 'abcdefgh', 'abc12345', 'qwertyui', 'password123', 'letmein1',
	'sunshine1', 'princess1', 'football1', 'charlie1', 'access14', 'master12',
	'monkey123', 'dragon12', 'michael1', 'shadow12', 'jennifer', 'trustno1',
	'baseball1', 'superman1', 'welcome1', 'passw0rd', 'starwars1', 'whatever1',
	'computer1', 'michelle1', 'corvette1', 'midnight1', 'password12', 'qwerty12',
	'12341234', '11111111', '87654321', '00000000', 'abcd1234', 'asdfghjk',
	'qwerty1234', '1q2w3e4r', 'zxcvbnm1', 'asdfjkl;', 'p@ssw0rd', 'pass1234',
	'changeme', 'admin123', 'letmein12', 'welcome12', 'monkey12', 'dragon123',
	'master123', 'qwer1234', 'love1234', '1qaz2wsx', 'test1234', 'guest1234',
	'super123', 'hello123', 'fuckyou1', 'jordan23', 'access12', 'flower12',
	'mustang1', 'thunder1', 'phoenix1', 'chicken1', 'ginger12', 'pepper12',
	'george12', 'summer12', 'daniel12', 'hannah12', 'jessica1', 'hunter12',
	'amanda12', 'robert12', 'thomas12', 'killer12', 'soccer12', 'hockey12',
	'ranger12', 'buster12', 'tigger12', 'andrew12', 'harley12', 'sparky12',
	'matrix12', 'ashley12', 'merlin12', 'bailey12', 'compaq12', 'oliver12',
	'cameron1', 'golfer12', 'cheese12', 'hammer12', 'falcon12', 'knight12',
	'dakota12', 'winner12', 'diamond1', 'bigdog123', 'silver12', 'player12',
	'freedom1', 'forever1', 'fish1234', 'angel123', 'cookie12', 'steelers',
	'snoopy12', 'peanut12', 'jackson1', 'blazer12', 'anthony1', 'brandy12'
]);

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
	if (!email || !EMAIL_REGEX.test(email)) {
		return { success: false, error: 'Please enter a valid email address' };
	}
	if (!password || password.length < 8) {
		return { success: false, error: 'Password must be at least 8 characters' };
	}

	// Check against common passwords
	if (COMMON_PASSWORDS.has(password.toLowerCase())) {
		return { success: false, error: 'This password is too common. Please choose a stronger password.' };
	}

	// Check if username or email already exists — return generic error to prevent enumeration
	const existingUsername = await db
		.select()
		.from(users)
		.where(eq(users.username, username))
		.get();

	const existingEmail = await db.select().from(users).where(eq(users.email, email.toLowerCase())).get();

	if (existingUsername || existingEmail) {
		return { success: false, error: 'Registration failed. The username or email may already be in use.' };
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
