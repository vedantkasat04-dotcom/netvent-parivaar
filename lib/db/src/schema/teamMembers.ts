import { pgTable, text, uuid, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const teamSectionEnum = pgEnum("team_section", ["FOUNDER", "CORE", "ADVISOR"]);

export const teamMembersTable = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  roleTitle: text("role_title").notNull(),
  photoUrl: text("photo_url"),
  section: teamSectionEnum("section").notNull().default("CORE"),
  displayOrder: integer("display_order").notNull().default(0),
  socialLinks: jsonb("social_links").$type<{
    instagram?: string | null;
    linkedin?: string | null;
    twitter?: string | null;
  }>().default({}),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembersTable).omit({ id: true });
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembersTable.$inferSelect;
