import { Router } from "express";
import { db, eventsTable, eventPhotosTable, eventSponsorsTable, eventRsvpsTable, memberProfilesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/v1/events", async (req, res) => {
  const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));
  const offset = (pageNum - 1) * limitNum;

  const where = status ? eq(eventsTable.status, status as "UPCOMING" | "PAST") : undefined;
  const events = await db.select().from(eventsTable).where(where).orderBy(eventsTable.eventDate).limit(limitNum).offset(offset);
  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(eventsTable).where(where);
  const total = Number(countResult.count);

  const data = events.map(e => ({ ...e, rsvpCount: 0, hasRsvped: false }));
  res.json({ success: true, data, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
});

router.get("/v1/events/:eventId", async (req, res) => {
  const eventId = String(req.params.eventId);
  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId)).limit(1);
  if (!event) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Event not found" } });
    return;
  }
  const photos = await db.select().from(eventPhotosTable).where(eq(eventPhotosTable.eventId, event.id));
  const sponsors = await db.select().from(eventSponsorsTable).where(eq(eventSponsorsTable.eventId, event.id));
  const [rsvpCount] = await db.select({ count: sql<number>`count(*)` }).from(eventRsvpsTable).where(eq(eventRsvpsTable.eventId, event.id));

  res.json({ success: true, data: { ...event, photos, sponsors, rsvpCount: Number(rsvpCount.count), hasRsvped: false } });
});

router.post("/v1/events/:eventId/rsvp", requireAuth, async (req: AuthRequest, res) => {
  const eventId = String(req.params.eventId);
  const [profile] = await db.select().from(memberProfilesTable).where(eq(memberProfilesTable.userId, req.user!.id)).limit(1);
  if (!profile || profile.status !== "APPROVED") {
    res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Must be an approved member to RSVP" } });
    return;
  }
  const [existing] = await db.select().from(eventRsvpsTable).where(and(eq(eventRsvpsTable.eventId, eventId), eq(eventRsvpsTable.memberProfileId, profile.id))).limit(1);
  if (existing) {
    await db.delete(eventRsvpsTable).where(and(eq(eventRsvpsTable.eventId, eventId), eq(eventRsvpsTable.memberProfileId, profile.id)));
    res.json({ success: true, message: "RSVP cancelled" });
  } else {
    await db.insert(eventRsvpsTable).values({ eventId, memberProfileId: profile.id });
    res.json({ success: true, message: "RSVP confirmed" });
  }
});

export default router;
