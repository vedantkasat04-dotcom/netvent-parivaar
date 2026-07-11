import { Router } from "express";
import { db, groupsTable, groupMembersTable, postsTable, usersTable, memberProfilesTable } from "@workspace/db";
import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/v1/groups", async (_req, res) => {
  const groups = await db.select().from(groupsTable).orderBy(groupsTable.name);
  const counts = await db.select({ groupId: groupMembersTable.groupId, count: sql<number>`count(*)` }).from(groupMembersTable).groupBy(groupMembersTable.groupId);
  const postCounts = await db.select({ groupId: postsTable.groupId, count: sql<number>`count(*)` }).from(postsTable).groupBy(postsTable.groupId);
  const countMap = Object.fromEntries(counts.map(c => [c.groupId, Number(c.count)]));
  const postCountMap = Object.fromEntries(postCounts.map(c => [c.groupId!, Number(c.count)]));
  res.json({ success: true, data: groups.map(g => ({ ...g, memberCount: countMap[g.id] ?? 0, postCount: postCountMap[g.id] ?? 0, isMember: false })) });
});

router.get("/v1/groups/:groupId", async (req, res) => {
  const groupId = String(req.params.groupId);
  const [group] = await db.select().from(groupsTable).where(eq(groupsTable.id, groupId)).limit(1);
  if (!group) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Group not found" } }); return; }
  const [memberCount] = await db.select({ count: sql<number>`count(*)` }).from(groupMembersTable).where(eq(groupMembersTable.groupId, group.id));
  res.json({ success: true, data: { ...group, memberCount: Number(memberCount.count), isMember: false } });
});

router.post("/v1/groups/:groupId/posts", requireAuth, async (req: AuthRequest, res) => {
  const groupId = String(req.params.groupId);
  const { type, content, resourceUrl } = req.body;
  if (!type || !content) { res.status(400).json({ success: false, error: { code: "VALIDATION", message: "type and content required" } }); return; }
  const [post] = await db.insert(postsTable).values({ groupId, authorId: req.user!.id, type, content, resourceUrl }).returning();
  const [author] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
  const [profile] = await db.select().from(memberProfilesTable).where(eq(memberProfilesTable.userId, req.user!.id)).limit(1);
  res.status(201).json({ success: true, data: { ...post, author: { id: author.id, name: author.name, profilePhotoUrl: profile?.profilePhotoUrl ?? null, memberId: profile?.memberId ?? null } } });
});

router.post("/v1/groups/:groupId/join", requireAuth, async (req: AuthRequest, res) => {
  const groupId = String(req.params.groupId);
  const [profile] = await db.select().from(memberProfilesTable).where(eq(memberProfilesTable.userId, req.user!.id)).limit(1);
  if (!profile || profile.status !== "APPROVED") { res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Must be an approved member" } }); return; }
  const existing = await db.select().from(groupMembersTable).where(and(eq(groupMembersTable.groupId, groupId), eq(groupMembersTable.memberProfileId, profile.id))).limit(1);
  if (existing.length > 0) {
    await db.delete(groupMembersTable).where(and(eq(groupMembersTable.groupId, groupId), eq(groupMembersTable.memberProfileId, profile.id)));
    res.json({ success: true, message: "Left group" });
  } else {
    await db.insert(groupMembersTable).values({ groupId, memberProfileId: profile.id });
    res.json({ success: true, message: "Joined group" });
  }
});

router.get("/v1/posts", async (req, res) => {
  const { groupId, type, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [
    groupId ? eq(postsTable.groupId, groupId) : undefined,
    type ? eq(postsTable.type, type as "DISCUSSION" | "ANNOUNCEMENT" | "RESOURCE") : undefined,
  ].filter((c): c is NonNullable<typeof c> => c !== undefined);

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const posts = await db.select().from(postsTable).where(whereClause).orderBy(desc(postsTable.createdAt)).limit(limitNum).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(postsTable).where(whereClause);
  const total = Number(countResult[0].count);

  const authorIds = [...new Set(posts.map(p => p.authorId))];
  const authors = authorIds.length > 0 ? await db.select().from(usersTable).where(inArray(usersTable.id, authorIds)) : [];
  const profiles = authorIds.length > 0 ? await db.select().from(memberProfilesTable).where(inArray(memberProfilesTable.userId, authorIds)) : [];
  const authorMap = Object.fromEntries(authors.map(a => [a.id, a]));
  const profileMap = Object.fromEntries(profiles.map(p => [p.userId, p]));

  const groups = groupId ? [] : await db.select().from(groupsTable);
  const groupMap = Object.fromEntries(groups.map(g => [g.id, g]));

  const data = posts.map(p => ({
    ...p,
    groupName: p.groupId ? (groupMap[p.groupId]?.name ?? null) : null,
    author: { id: authorMap[p.authorId]?.id, name: authorMap[p.authorId]?.name ?? "Unknown", profilePhotoUrl: profileMap[p.authorId]?.profilePhotoUrl ?? null, memberId: profileMap[p.authorId]?.memberId ?? null },
  }));

  res.json({ success: true, data, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
});

router.get("/v1/feed", async (req, res) => {
  const { page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));
  const offset = (pageNum - 1) * limitNum;

  const posts = await db.select().from(postsTable).orderBy(desc(postsTable.createdAt)).limit(limitNum).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(postsTable);
  const total = Number(countResult[0].count);

  const authorIds = [...new Set(posts.map(p => p.authorId))];
  const authors = authorIds.length > 0 ? await db.select().from(usersTable).where(inArray(usersTable.id, authorIds)) : [];
  const profiles = authorIds.length > 0 ? await db.select().from(memberProfilesTable).where(inArray(memberProfilesTable.userId, authorIds)) : [];
  const authorMap = Object.fromEntries(authors.map(a => [a.id, a]));
  const profileMap = Object.fromEntries(profiles.map(p => [p.userId, p]));
  const allGroups = await db.select().from(groupsTable);
  const groupMap = Object.fromEntries(allGroups.map(g => [g.id, g]));

  const data = posts.map(p => ({
    ...p,
    groupName: p.groupId ? (groupMap[p.groupId]?.name ?? null) : null,
    author: { id: authorMap[p.authorId]?.id, name: authorMap[p.authorId]?.name ?? "Unknown", profilePhotoUrl: profileMap[p.authorId]?.profilePhotoUrl ?? null, memberId: profileMap[p.authorId]?.memberId ?? null },
  }));

  res.json({ success: true, data, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
});

export default router;
