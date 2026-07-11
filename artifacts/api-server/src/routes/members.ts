import { Router } from "express";
import { db, usersTable, expertiseTable, userExpertiseTable, reportsTable } from "@workspace/db";
import { eq, and, ilike, inArray, isNotNull, sql } from "drizzle-orm";
import { requireAuth, optionalAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

type ExpertiseRow = { id: string; name: string };

function buildDirectoryMember(user: typeof usersTable.$inferSelect, expertise: ExpertiseRow[], includeContact: boolean) {
  // Logged-out visitors only ever see Name + City + Expertise (+ availability for grayscale rendering).
  // Full profile fields and contact info are exposed only to authenticated members.
  return {
    id: user.id,
    name: user.name,
    city: user.city,
    isAvailable: user.isAvailable,
    expertise,
    avatarUrl: includeContact ? user.avatarUrl : null,
    bio: includeContact ? user.bio : null,
    educationType: includeContact ? user.educationType : null,
    schoolOrCollegeName: includeContact ? user.schoolOrCollegeName : null,
    schoolClass: includeContact ? user.schoolClass : null,
    degreeLevel: includeContact ? user.degreeLevel : null,
    collegeYear: includeContact ? user.collegeYear : null,
    email: includeContact ? user.email : null,
    phone: includeContact ? user.phone : null,
  };
}

router.get("/v1/members", optionalAuth, async (req: AuthRequest, res) => {
  const { q, city, expertise, available, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(50, parseInt(limit) || 20);
  const offset = (pageNum - 1) * limitNum;
  const includeContact = !!req.user;

  let userIdsByExpertise: string[] | null = null;
  if (expertise) {
    const rows = await db.select({ userId: userExpertiseTable.userId }).from(userExpertiseTable).where(eq(userExpertiseTable.expertiseId, expertise));
    userIdsByExpertise = rows.map((r) => r.userId);
    if (userIdsByExpertise.length === 0) {
      res.json({ success: true, data: [], pagination: { page: pageNum, limit: limitNum, total: 0, totalPages: 0 } });
      return;
    }
  }

  const conditions = [
    isNotNull(usersTable.educationType),
    q ? ilike(usersTable.name, `%${q}%`) : undefined,
    city ? eq(usersTable.city, city) : undefined,
    available === "true" ? eq(usersTable.isAvailable, true) : undefined,
    available === "false" ? eq(usersTable.isAvailable, false) : undefined,
    userIdsByExpertise ? inArray(usersTable.id, userIdsByExpertise) : undefined,
  ];
  const whereClause = and(...conditions);

  const users = await db.select().from(usersTable).where(whereClause).orderBy(usersTable.name).limit(limitNum).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(whereClause);
  const total = Number(countResult[0].count);

  const userIds = users.map((u) => u.id);
  const expertiseRows = userIds.length > 0
    ? await db.select({ userId: userExpertiseTable.userId, id: expertiseTable.id, name: expertiseTable.name })
        .from(userExpertiseTable)
        .innerJoin(expertiseTable, eq(userExpertiseTable.expertiseId, expertiseTable.id))
        .where(inArray(userExpertiseTable.userId, userIds))
    : [];
  const expertiseByUser = expertiseRows.reduce((acc, r) => {
    (acc[r.userId] ??= []).push({ id: r.id, name: r.name });
    return acc;
  }, {} as Record<string, ExpertiseRow[]>);

  const data = users.map((u) => buildDirectoryMember(u, (expertiseByUser[u.id] ?? []).sort((a, b) => a.name.localeCompare(b.name)), includeContact));
  res.json({ success: true, data, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
});

router.get("/v1/members/:memberId", optionalAuth, async (req: AuthRequest, res) => {
  const memberId = String(req.params.memberId);
  const [user] = await db.select().from(usersTable).where(and(eq(usersTable.id, memberId), isNotNull(usersTable.educationType))).limit(1);
  if (!user) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Member not found" } });
    return;
  }
  const expertiseRows = await db.select({ id: expertiseTable.id, name: expertiseTable.name })
    .from(userExpertiseTable)
    .innerJoin(expertiseTable, eq(userExpertiseTable.expertiseId, expertiseTable.id))
    .where(eq(userExpertiseTable.userId, user.id));
  expertiseRows.sort((a, b) => a.name.localeCompare(b.name));
  res.json({ success: true, data: buildDirectoryMember(user, expertiseRows, !!req.user) });
});

router.post("/v1/reports", requireAuth, async (req: AuthRequest, res) => {
  const { targetType, targetId, reason } = req.body;
  if (!targetType || !targetId || !reason) {
    res.status(400).json({ success: false, error: { code: "VALIDATION", message: "targetType, targetId, reason required" } });
    return;
  }
  await db.insert(reportsTable).values({ reporterId: req.user!.id, targetType, targetId, reason });
  res.status(201).json({ success: true, message: "Report submitted" });
});

export default router;
