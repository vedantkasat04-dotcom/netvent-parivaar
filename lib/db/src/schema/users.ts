import { pgTable, text, uuid, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userRoleEnum = pgEnum("user_role", ["BASIC", "MEMBER", "MODERATOR", "ADMIN"]);
export const educationTypeEnum = pgEnum("education_type", ["SCHOOL", "COLLEGE"]);
export const degreeLevelEnum = pgEnum("degree_level", ["DIPLOMA", "BACHELORS", "MASTERS"]);

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("BASIC"),
  city: text("city"),
  educationType: educationTypeEnum("education_type"),
  schoolOrCollegeName: text("school_or_college_name"),
  schoolClass: text("school_class"),
  degreeLevel: degreeLevelEnum("degree_level"),
  collegeYear: text("college_year"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
