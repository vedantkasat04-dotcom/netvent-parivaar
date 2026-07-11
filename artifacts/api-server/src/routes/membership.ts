import { Router } from "express";
import { db, usersTable, memberProfilesTable, memberSkillsTable, skillsTable, citiesTable, statesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.post("/v1/membership/apply", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const existing = await db.select().from(memberProfilesTable).where(eq(memberProfilesTable.userId, userId)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ success: false, error: { code: "CONFLICT", message: "Application already submitted" } });
    return;
  }
  const { fullName, age, cityId, stateId, institution, classYear, phone, whatsapp, bio, instagramUrl, linkedinUrl, portfolioUrl, profilePhotoUrl, skillIds, privacySettings } = req.body;
  if (!fullName || !age || !cityId || !stateId || !institution || !classYear) {
    res.status(400).json({ success: false, error: { code: "VALIDATION", message: "Required fields missing" } });
    return;
  }
  const isMinor = Number(age) < 18;
  const privacy = { phone: isMinor ? "private" : (privacySettings?.phone ?? "private"), whatsapp: isMinor ? "private" : (privacySettings?.whatsapp ?? "private"), email: privacySettings?.email ?? "private" } as const;

  const [profile] = await db.insert(memberProfilesTable).values({ userId, fullName, age: Number(age), cityId, stateId, institution, classYear, phone, whatsapp, bio, instagramUrl, linkedinUrl, portfolioUrl, profilePhotoUrl, privacySettings: privacy, status: "PENDING" }).returning();

  if (skillIds?.length > 0) {
    await db.insert(memberSkillsTable).values(skillIds.map((skillId: string) => ({ memberProfileId: profile.id, skillId }))).onConflictDoNothing();
  }
  res.status(201).json({ success: true, data: profile });
});

router.get("/v1/membership/status", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const [profile] = await db.select().from(memberProfilesTable).where(eq(memberProfilesTable.userId, userId)).limit(1);
  res.json({ success: true, hasApplied: !!profile, profile: profile ?? null });
});

router.patch("/v1/membership/me", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const [profile] = await db.select().from(memberProfilesTable).where(eq(memberProfilesTable.userId, userId)).limit(1);
  if (!profile) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Profile not found" } });
    return;
  }
  const { skillIds, privacySettings, ...updateData } = req.body;
  const isMinor = profile.age !== null && profile.age < 18;
  let mergedPrivacy = { ...profile.privacySettings, ...privacySettings };
  if (isMinor) { mergedPrivacy.phone = "private"; mergedPrivacy.whatsapp = "private"; }

  const [updated] = await db.update(memberProfilesTable).set({ ...updateData, privacySettings: mergedPrivacy }).where(eq(memberProfilesTable.id, profile.id)).returning();

  if (skillIds !== undefined) {
    await db.delete(memberSkillsTable).where(eq(memberSkillsTable.memberProfileId, profile.id));
    if (skillIds.length > 0) {
      await db.insert(memberSkillsTable).values(skillIds.map((skillId: string) => ({ memberProfileId: profile.id, skillId }))).onConflictDoNothing();
    }
  }
  res.json({ success: true, data: updated });
});

export default router;
