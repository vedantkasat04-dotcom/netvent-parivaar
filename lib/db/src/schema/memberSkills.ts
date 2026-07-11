import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core";
import { memberProfilesTable } from "./memberProfiles";
import { skillsTable } from "./skills";

export const memberSkillsTable = pgTable("member_skills", {
  memberProfileId: uuid("member_profile_id").notNull().references(() => memberProfilesTable.id, { onDelete: "cascade" }),
  skillId: uuid("skill_id").notNull().references(() => skillsTable.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.memberProfileId, t.skillId] })]);

export type MemberSkill = typeof memberSkillsTable.$inferSelect;
