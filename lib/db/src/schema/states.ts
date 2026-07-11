import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const statesTable = pgTable("states", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
});

export const insertStateSchema = createInsertSchema(statesTable).omit({ id: true });
export type InsertState = z.infer<typeof insertStateSchema>;
export type State = typeof statesTable.$inferSelect;
