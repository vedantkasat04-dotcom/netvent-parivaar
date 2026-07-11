import { pgTable, uuid, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { groupsTable } from "./groups";
import { memberProfilesTable } from "./memberProfiles";

export const groupMembersTable = pgTable("group_members", {
  groupId: uuid("group_id").notNull().references(() => groupsTable.id, { onDelete: "cascade" }),
  memberProfileId: uuid("member_profile_id").notNull().references(() => memberProfilesTable.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.groupId, t.memberProfileId] })]);

export type GroupMember = typeof groupMembersTable.$inferSelect;
