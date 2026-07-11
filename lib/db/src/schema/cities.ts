import { pgTable, text, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { statesTable } from "./states";
import { usersTable } from "./users";

export const cityStatusEnum = pgEnum("city_status", ["ACTIVE", "UPCOMING"]);

export const citiesTable = pgTable("cities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  stateId: uuid("state_id").notNull().references(() => statesTable.id),
  status: cityStatusEnum("status").notNull().default("UPCOMING"),
  cityLeadId: uuid("city_lead_id").references(() => usersTable.id, { onDelete: "set null" }),
});

export const insertCitySchema = createInsertSchema(citiesTable).omit({ id: true });
export type InsertCity = z.infer<typeof insertCitySchema>;
export type City = typeof citiesTable.$inferSelect;
