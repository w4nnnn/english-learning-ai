CREATE TABLE `module_items` (
	`id` text PRIMARY KEY NOT NULL,
	`module_id` text NOT NULL,
	`type` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`title` text,
	`content` text,
	`caption` text,
	`question` text,
	`correct_answer` text,
	`options` text,
	`xp_reward` integer DEFAULT 10,
	`is_required` integer DEFAULT true,
	`created_at` integer,
	FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `modules` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`cover_image` text,
	`order` integer DEFAULT 0 NOT NULL,
	`is_published` integer DEFAULT false,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `user_item_responses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`module_id` text NOT NULL,
	`item_id` text NOT NULL,
	`user_answer` text,
	`is_correct` integer,
	`attempt_count` integer DEFAULT 1,
	`answered_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`item_id`) REFERENCES `module_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_module_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`module_id` text NOT NULL,
	`current_item_index` integer DEFAULT 0,
	`status` text DEFAULT 'not_started',
	`score` integer DEFAULT 0,
	`total_items` integer DEFAULT 0,
	`completed_items` integer DEFAULT 0,
	`started_at` integer,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'murid' NOT NULL,
	`heart_count` integer DEFAULT 5,
	`xp` integer DEFAULT 0,
	`streak` integer DEFAULT 0,
	`last_active` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);