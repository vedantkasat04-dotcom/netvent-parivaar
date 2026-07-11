import { Router } from "express";
import { db, usersTable, memberProfilesTable, memberSkillsTable, skillsTable, eventsTable, groupsTable, teamMembersTable, citiesTable, reportsTable, auditLogsTable, notificationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../middlewares/auth";

const router = Router();

const adminMod = [requireAuth, requireRole("ADMIN", "MODERATOR")];
const adminOnly = [requireAuth, requireRole("ADMIN")];

// Dashboard
router.get("/dashboard", ...adminMod, async (_req, res) => {
  const [totalMembers] = await db.select({ count: sql<number>`count(*)` }).from(memberProfilesTable).where(eq(memberProfilesTable.status, "APPROVED"));
  const [pendingApplications] = await db.select({ count: sql<number>`count(*)` }).from(memberProfilesTable).where(eq(memberProfilesTable.status, "PENDING"));
  const [totalEvents] = await db.select({ count: sql<number>`count(*)` }).from(eventsTable);
  const [totalGroups] = await db.select({ count: sql<number>`count(*)` }).from(groupsTable);
  const [openReports] = await db.select({ count: sql<number>`count(*)` }).from(reportsTable).where(eq(reportsTable.status, "OPEN"));
  const recentApplications = await db.select().from(memberProfilesTable).where(eq(memberProfilesTable.status, "PENDING")).orderBy(memberProfilesTable.createdAt).limit(5);
  const membersByCity = await db.select({ cityId: memberProfilesTable.cityId, count: sql<number>`count(*)` }).from(memberProfilesTable).where(eq(memberProfilesTable.status, "APPROVED")).groupBy(memberProfilesTable.cityId).limit(10);
  const cities = await db.select().from(citiesTable);
  const cityMap = Object.fromEntries(cities.map(c => [c.id, c.name]));
  res.json({ success: true, data: { totalMembers: Number(totalMembers.count), pendingApplications: Number(pendingApplications.count), totalEvents: Number(totalEvents.count), totalGroups: Number(totalGroups.count), openReports: Number(openReports.count), recentApplications, membersByCity: membersByCity.map(m => ({ city: m.cityId ? (cityMap[m.cityId] ?? "Unknown") : "Unknown", count: Number(m.count) })) } });
});

// Members
router.get("/members", ...adminMod, async (req: AuthRequest, res) => {
  const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));
  const offset = (pageNum - 1) * limitNum;
  const where = status ? eq(memberProfilesTable.status, status as "PENDING" | "APPROVED" | "REJECTED") : undefined;
  const profiles = await db.select().from(memberProfilesTable).where(where).orderBy(memberProfilesTable.createdAt).limit(limitNum).offset(offset);
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(memberProfilesTable).where(where);
  const profilesWithSkills = await Promise.all(profiles.map(async (p) => {
    const skills = await db.select({ skill: skillsTable }).from(memberSkillsTable).innerJoin(skillsTable, eq(memberSkillsTable.skillId, skillsTable.id)).where(eq(memberSkillsTable.memberProfileId, p.id));
    return { ...p, skills: skills.map(s => s.skill) };
  }));
  res.json({ success: true, data: profilesWithSkills, pagination: { page: pageNum, limit: limitNum, total: Number(count), totalPages: Math.ceil(Number(count) / limitNum) } });
});

router.post("/members/:profileId/approve", ...adminOnly, async (req: AuthRequest, res) => {
  const [profile] = await db.select().from(memberProfilesTable).where(eq(memberProfilesTable.id, String(req.params.profileId))).limit(1);
  if (!profile) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Profile not found" } }); return; }
  const [lastMember] = await db.select({ memberId: memberProfilesTable.memberId }).from(memberProfilesTable).where(sql`${memberProfilesTable.memberId} IS NOT NULL`).orderBy(sql`${memberProfilesTable.memberId} DESC`).limit(1);
  let nextNum = 1;
  if (lastMember?.memberId) { const num = parseInt(lastMember.memberId.replace("NVP", "")); if (!isNaN(num)) nextNum = num + 1; }
  const newMemberId = `NVP${String(nextNum).padStart(4, "0")}`;
  const [updated] = await db.update(memberProfilesTable).set({ status: "APPROVED", memberId: newMemberId, approvedBy: req.user!.id, approvedAt: new Date() }).where(eq(memberProfilesTable.id, String(req.params.profileId))).returning();
  await db.update(usersTable).set({ role: "MEMBER" }).where(eq(usersTable.id, profile.userId));
  await db.insert(auditLogsTable).values({ actorId: req.user!.id, action: "APPROVE_MEMBER", entityType: "member_profile", entityId: profile.id, metadata: { memberId: newMemberId } });
  await db.insert(notificationsTable).values({ userId: profile.userId, type: "APPLICATION_APPROVED", payload: { memberId: newMemberId, message: "Your application has been approved!" } });
  res.json({ success: true, data: updated });
});

router.post("/members/:profileId/reject", ...adminMod, async (req: AuthRequest, res) => {
  const { reason } = req.body;
  if (!reason) { res.status(400).json({ success: false, error: { code: "VALIDATION", message: "reason required" } }); return; }
  const [updated] = await db.update(memberProfilesTable).set({ status: "REJECTED", rejectionReason: reason }).where(eq(memberProfilesTable.id, String(req.params.profileId))).returning();
  if (!updated) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Profile not found" } }); return; }
  await db.insert(auditLogsTable).values({ actorId: req.user!.id, action: "REJECT_MEMBER", entityType: "member_profile", entityId: String(req.params.profileId), metadata: { reason } });
  await db.insert(notificationsTable).values({ userId: updated.userId, type: "APPLICATION_REJECTED", payload: { reason, message: "Your application was not approved." } });
  res.json({ success: true, data: updated });
});

router.patch("/members/:profileId", ...adminOnly, async (req: AuthRequest, res) => {
  const { role, ...profileData } = req.body;
  const [profile] = await db.select().from(memberProfilesTable).where(eq(memberProfilesTable.id, String(req.params.profileId))).limit(1);
  if (!profile) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Profile not found" } }); return; }
  if (role) await db.update(usersTable).set({ role }).where(eq(usersTable.id, profile.userId));
  const [updated] = await db.update(memberProfilesTable).set(profileData).where(eq(memberProfilesTable.id, String(req.params.profileId))).returning();
  res.json({ success: true, data: updated });
});

router.delete("/members/:profileId", ...adminOnly, async (req: AuthRequest, res) => {
  const [profile] = await db.select().from(memberProfilesTable).where(eq(memberProfilesTable.id, String(req.params.profileId))).limit(1);
  if (!profile) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Profile not found" } }); return; }
  await db.delete(memberProfilesTable).where(eq(memberProfilesTable.id, String(req.params.profileId)));
  res.json({ success: true, message: "Member deleted" });
});

// Events
router.post("/events", ...adminOnly, async (req: AuthRequest, res) => {
  const { title, description, venue, eventDate, status, coverImageUrl } = req.body;
  if (!title || !eventDate || !status) { res.status(400).json({ success: false, error: { code: "VALIDATION", message: "title, eventDate, status required" } }); return; }
  const [event] = await db.insert(eventsTable).values({ title, description, venue, eventDate: new Date(eventDate), status, coverImageUrl }).returning();
  res.status(201).json({ success: true, data: event });
});

router.patch("/events/:eventId", ...adminOnly, async (req: AuthRequest, res) => {
  const { eventDate, ...rest } = req.body;
  const [updated] = await db.update(eventsTable).set({ ...rest, ...(eventDate ? { eventDate: new Date(eventDate) } : {}) }).where(eq(eventsTable.id, String(req.params.eventId))).returning();
  if (!updated) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Event not found" } }); return; }
  res.json({ success: true, data: updated });
});

router.delete("/events/:eventId", ...adminOnly, async (req: AuthRequest, res) => {
  await db.delete(eventsTable).where(eq(eventsTable.id, String(req.params.eventId)));
  res.json({ success: true, message: "Event deleted" });
});

// Groups
router.post("/groups", ...adminOnly, async (req: AuthRequest, res) => {
  const { name, description, moderatorId } = req.body;
  if (!name) { res.status(400).json({ success: false, error: { code: "VALIDATION", message: "name required" } }); return; }
  const [group] = await db.insert(groupsTable).values({ name, description, moderatorId }).returning();
  res.status(201).json({ success: true, data: group });
});

router.patch("/groups/:groupId", ...adminOnly, async (req: AuthRequest, res) => {
  const [updated] = await db.update(groupsTable).set(req.body).where(eq(groupsTable.id, String(req.params.groupId))).returning();
  if (!updated) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Group not found" } }); return; }
  res.json({ success: true, data: updated });
});

router.delete("/groups/:groupId", ...adminOnly, async (req: AuthRequest, res) => {
  await db.delete(groupsTable).where(eq(groupsTable.id, String(req.params.groupId)));
  res.json({ success: true, message: "Group deleted" });
});

// Team
router.post("/team", ...adminOnly, async (req: AuthRequest, res) => {
  const { name, roleTitle, section, displayOrder, photoUrl, socialLinks } = req.body;
  if (!name || !roleTitle || !section) { res.status(400).json({ success: false, error: { code: "VALIDATION", message: "name, roleTitle, section required" } }); return; }
  const [member] = await db.insert(teamMembersTable).values({ name, roleTitle, section, displayOrder: displayOrder ?? 0, photoUrl, socialLinks }).returning();
  res.status(201).json({ success: true, data: member });
});

router.patch("/team/:teamMemberId", ...adminOnly, async (req: AuthRequest, res) => {
  const [updated] = await db.update(teamMembersTable).set(req.body).where(eq(teamMembersTable.id, String(req.params.teamMemberId))).returning();
  if (!updated) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Team member not found" } }); return; }
  res.json({ success: true, data: updated });
});

router.delete("/team/:teamMemberId", ...adminOnly, async (req: AuthRequest, res) => {
  await db.delete(teamMembersTable).where(eq(teamMembersTable.id, String(req.params.teamMemberId)));
  res.json({ success: true, message: "Team member deleted" });
});

// Cities
router.post("/cities", ...adminOnly, async (req: AuthRequest, res) => {
  const { name, stateId, status } = req.body;
  if (!name || !stateId || !status) { res.status(400).json({ success: false, error: { code: "VALIDATION", message: "name, stateId, status required" } }); return; }
  const [city] = await db.insert(citiesTable).values({ name, stateId, status }).returning();
  res.status(201).json({ success: true, data: city });
});

router.patch("/cities/:cityId", ...adminOnly, async (req: AuthRequest, res) => {
  const [updated] = await db.update(citiesTable).set(req.body).where(eq(citiesTable.id, String(req.params.cityId))).returning();
  if (!updated) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "City not found" } }); return; }
  res.json({ success: true, data: updated });
});

// Reports
router.get("/reports", ...adminMod, async (req: AuthRequest, res) => {
  const { status } = req.query as Record<string, string>;
  const where = status ? eq(reportsTable.status, status as "OPEN" | "RESOLVED") : undefined;
  const reports = await db.select().from(reportsTable).where(where).orderBy(reportsTable.createdAt).limit(50);
  res.json({ success: true, data: reports });
});

router.patch("/reports/:reportId/resolve", ...adminMod, async (req: AuthRequest, res) => {
  await db.update(reportsTable).set({ status: "RESOLVED" }).where(eq(reportsTable.id, String(req.params.reportId)));
  res.json({ success: true, message: "Report resolved" });
});

export default router;
