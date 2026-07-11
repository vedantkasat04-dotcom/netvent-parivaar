import { pgTable, text, uuid, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { groupsTable } from "./groups";
import { usersTable } from "./users";

export const postTypeEnum = pgEnum("post_type", ["DISCUSSION", "ANNOUNCEMENT", "RESOURCE"]);

export const postsTable = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").references(() => groupsTable.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  type: postTypeEnum("type").notNull().default("DISCUSSION"),
  content: text("content").notNull(),
  resourceUrl: text("resource_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPostSchema = createInsertSchema(postsTable).omit({ id: true, createdAt: true });
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof postsTable.$inferSelect;
