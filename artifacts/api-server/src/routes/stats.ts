import { Router } from "express";
import { db, memberProfilesTable, eventsTable, groupsTable, citiesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/v1/stats", async (_req, res) => {
  const [totalMembers] = await db.select({ count: sql<number>`count(*)` }).from(memberProfilesTable).where(eq(memberProfilesTable.status, "APPROVED"));
  const [totalEvents] = await db.select({ count: sql<number>`count(*)` }).from(eventsTable);
  const [totalGroups] = await db.select({ count: sql<number>`count(*)` }).from(groupsTable);
  const [activeCities] = await db.select({ count: sql<number>`count(*)` }).from(citiesTable).where(eq(citiesTable.status, "ACTIVE"));
  const [pendingApplications] = await db.select({ count: sql<number>`count(*)` }).from(memberProfilesTable).where(eq(memberProfilesTable.status, "PENDING"));

  const recentMembers = await db.select({
    id: memberProfilesTable.id,
    memberId: memberProfilesTable.memberId,
    fullName: memberProfilesTable.fullName,
    profilePhotoUrl: memberProfilesTable.profilePhotoUrl,
    cityId: memberProfilesTable.cityId,
    stateId: memberProfilesTable.stateId,
    institution: memberProfilesTable.institution,
    classYear: memberProfilesTable.classYear,
  }).from(memberProfilesTable).where(eq(memberProfilesTable.status, "APPROVED")).orderBy(sql`${memberProfilesTable.createdAt} DESC`).limit(6);

  res.json({
    success: true,
    data: {
      totalMembers: Number(totalMembers.count),
      totalEvents: Number(totalEvents.count),
      totalGroups: Number(totalGroups.count),
      activeCities: Number(activeCities.count),
      pendingApplications: Number(pendingApplications.count),
      recentMembers,
    }
  });
});

export default router;
