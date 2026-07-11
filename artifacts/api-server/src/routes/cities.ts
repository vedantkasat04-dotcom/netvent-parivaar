import { Router } from "express";
import { db, citiesTable, statesTable, memberProfilesTable, skillsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/v1/cities", async (_req, res) => {
  const cities = await db.select().from(citiesTable).orderBy(citiesTable.name);
  const states = await db.select().from(statesTable);
  const stateMap = Object.fromEntries(states.map(s => [s.id, s]));
  const memberCounts = await db.select({ cityId: memberProfilesTable.cityId, count: sql<number>`count(*)` }).from(memberProfilesTable).where(eq(memberProfilesTable.status, "APPROVED")).groupBy(memberProfilesTable.cityId);
  const countMap = Object.fromEntries(memberCounts.map(c => [c.cityId!, Number(c.count)]));
  res.json({ success: true, data: cities.map(c => ({ ...c, state: stateMap[c.stateId] ?? null, memberCount: countMap[c.id] ?? 0 })) });
});

router.get("/v1/skills", async (_req, res) => {
  const skills = await db.select().from(skillsTable).orderBy(skillsTable.name);
  res.json({ success: true, data: skills });
});

export default router;
