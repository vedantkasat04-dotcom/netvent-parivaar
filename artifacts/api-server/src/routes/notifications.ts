import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/v1/notifications", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const notifications = await db.select().from(notificationsTable).where(eq(notificationsTable.userId, userId)).orderBy(desc(notificationsTable.createdAt)).limit(50);
  const [unread] = await db.select({ count: sql<number>`count(*)` }).from(notificationsTable).where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.read, false)));
  res.json({ success: true, data: notifications, unreadCount: Number(unread.count) });
});

router.patch("/v1/notifications/:notificationId/read", requireAuth, async (req: AuthRequest, res) => {
  const notificationId = String(req.params.notificationId);
  await db.update(notificationsTable).set({ read: true }).where(and(eq(notificationsTable.id, notificationId), eq(notificationsTable.userId, req.user!.id)));
  res.json({ success: true, message: "Marked as read" });
});

export default router;
