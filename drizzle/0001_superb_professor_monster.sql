CREATE TABLE `rate_limits` (
	`key` text NOT NULL,
	`type` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`window_start` integer NOT NULL,
	PRIMARY KEY(`key`, `type`)
);
--> statement-breakpoint
ALTER TABLE `sessions` ADD `last_active_at` integer;