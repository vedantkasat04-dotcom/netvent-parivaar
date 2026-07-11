import { pgTable, text, uuid, integer, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { citiesTable } from "./cities";
import { statesTable } from "./states";

export const memberStatusEnum = pgEnum("member_status", ["PENDING", "APPROVED", "REJECTED"]);

export const memberProfilesTable = pgTable("member_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique().references(() => usersTable.id, { onDelete: "cascade" }),
  memberId: text("member_id").unique(),
  fullName: text("full_name").notNull(),
  profilePhotoUrl: text("profile_photo_url"),
  age: integer("age"),
  cityId: uuid("city_id").references(() => citiesTable.id, { onDelete: "set null" }),
  stateId: uuid("state_id").references(() => statesTable.id, { onDelete: "set null" }),
  institution: text("institution"),
  classYear: text("class_year"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  bio: text("bio"),
  instagramUrl: text("instagram_url"),
  linkedinUrl: text("linkedin_url"),
  portfolioUrl: text("portfolio_url"),
  status: memberStatusEnum("status").notNull().default("PENDING"),
  rejectionReason: text("rejection_reason"),
  approvedBy: uuid("approved_by").references(() => usersTable.id, { onDelete: "set null" }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  privacySettings: jsonb("privacy_settings").$type<{
    phone: "public" | "private";
    whatsapp: "public" | "private";
    email: "public" | "private";
  }>().default({ phone: "private", whatsapp: "private", email: "private" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertMemberProfileSchema = createInsertSchema(memberProfilesTable).omit({
  id: true, createdAt: true, updatedAt: true, memberId: true, approvedBy: true, approvedAt: true, rejectionReason: true,
});
export type InsertMemberProfile = z.infer<typeof insertMemberProfileSchema>;
export type MemberProfile = typeof memberProfilesTable.$inferSelect;
