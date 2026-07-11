import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const expertiseTable = pgTable("expertise", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
});

export type Expertise = typeof expertiseTable.$inferSelect;
