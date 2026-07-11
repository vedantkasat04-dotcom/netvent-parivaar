import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { expertiseTable } from "./expertise";

export const userExpertiseTable = pgTable("user_expertise", {
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  expertiseId: uuid("expertise_id").notNull().references(() => expertiseTable.id, { onDelete: "cascade" }),
}, (t) => [
  primaryKey({ columns: [t.userId, t.expertiseId] }),
]);

export type UserExpertise = typeof userExpertiseTable.$inferSelect;
