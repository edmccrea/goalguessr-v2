CREATE INDEX `game_results_session_daily_idx` ON `game_results` (`session_id`,`daily_game_id`);--> statement-breakpoint
CREATE INDEX `goals_status_idx` ON `goals` (`status`);--> statement-breakpoint
CREATE INDEX `guesses_game_result_id_idx` ON `guesses` (`game_result_id`);--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);