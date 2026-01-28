CREATE TABLE `competitions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short_name` text,
	`type` text NOT NULL,
	`country` text,
	`is_international` integer DEFAULT false,
	`logo_url` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `daily_games` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`goal_1_id` text,
	`goal_2_id` text,
	`goal_3_id` text,
	`created_at` integer,
	FOREIGN KEY (`goal_1_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`goal_2_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`goal_3_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_games_date_unique` ON `daily_games` (`date`);--> statement-breakpoint
CREATE TABLE `game_results` (
	`id` text PRIMARY KEY NOT NULL,
	`daily_game_id` text,
	`session_id` text,
	`round_1_score` integer DEFAULT 0,
	`round_2_score` integer DEFAULT 0,
	`round_3_score` integer DEFAULT 0,
	`total_score` integer DEFAULT 0,
	`time_taken_ms` integer,
	`round_1_started_at` integer,
	`round_2_started_at` integer,
	`round_3_started_at` integer,
	`created_at` integer,
	FOREIGN KEY (`daily_game_id`) REFERENCES `daily_games`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `goal_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`goal_id` text,
	`scheduled_date` text NOT NULL,
	`position` integer NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` text PRIMARY KEY NOT NULL,
	`team` text NOT NULL,
	`year` integer NOT NULL,
	`scorer` text NOT NULL,
	`competition` text,
	`opponent` text,
	`match_context` text,
	`video_url` text,
	`is_international` integer DEFAULT false,
	`animation_data` text NOT NULL,
	`status` text DEFAULT 'pending',
	`rejection_reason` text,
	`submitted_by` text,
	`submitted_by_username` text,
	`reviewed_by` text,
	`created_at` integer,
	FOREIGN KEY (`submitted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `guesses` (
	`id` text PRIMARY KEY NOT NULL,
	`game_result_id` text,
	`goal_id` text,
	`round_number` integer,
	`guessed_team` text,
	`guessed_year` integer,
	`guessed_scorer` text,
	`team_correct` integer,
	`year_correct` integer,
	`scorer_correct` integer,
	`time_taken_ms` integer,
	`created_at` integer,
	FOREIGN KEY (`game_result_id`) REFERENCES `game_results`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `player_aliases` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`alias` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `player_teams` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`team_id` text NOT NULL,
	`start_year` integer,
	`end_year` integer,
	`created_at` integer,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`nationality` text,
	`position` text,
	`external_id` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sync_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`sync_type` text NOT NULL,
	`status` text NOT NULL,
	`records_processed` integer DEFAULT 0,
	`error_message` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `team_aliases` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`alias` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short_name` text,
	`code` text,
	`country` text,
	`is_national_team` integer DEFAULT false,
	`logo_url` text,
	`external_id` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text,
	`email` text,
	`password_hash` text,
	`created_at` integer,
	`is_admin` integer DEFAULT false,
	`avatar_color` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);