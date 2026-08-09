import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, expertiseTable, userExpertiseTable } from "@workspace/db";
import { eq, inArray, and, ne } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { serializeUserMe } from "../lib/user";

const router = Router();

function badRequest(res: import("express").Response, message: string) {
  res.status(400).json({ success: false, error: { code: "VALIDATION", message } });
}

async function resolveExpertiseIds(ids: unknown): Promise<string[] | null> {
  if (!Array.isArray(ids)) return null;
  const unique = [...new Set(ids.map(String))];
  if (unique.length === 0 || unique.length > 6) return null;
  const rows = await db.select({ id: expertiseTable.id }).from(expertiseTable).where(inArray(expertiseTable.id, unique));
  if (rows.length !== unique.length) return null;
  return unique;
}

router.get("/v1/expertise", async (_req, res) => {
  const rows = await db.select({ id: expertiseTable.id, name: expertiseTable.name }).from(expertiseTable);
  rows.sort((a, b) => a.name.localeCompare(b.name));
  res.json({ success: true, data: rows });
});

router.patch("/v1/users/me", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const body = req.body as Record<string, unknown>;
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    if (String(body.name).trim().length < 2) { badRequest(res, "Name must be at least 2 characters"); return; }
    updates.name = String(body.name).trim();
  }
  if (body.email !== undefined) {
    const email = String(body.email).trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { badRequest(res, "Enter a valid email address"); return; }
    const [clash] = await db.select().from(usersTable).where(and(eq(usersTable.email, email), ne(usersTable.id, userId))).limit(1);
    if (clash) { res.status(409).json({ success: false, error: { code: "CONFLICT", message: "Email already registered" } }); return; }
    updates.email = email;
  }
  if (body.phone !== undefined) {
    if (!/^[0-9]{10}$/.test(String(body.phone))) { badRequest(res, "Phone must be a 10-digit number"); return; }
    const [clash] = await db.select().from(usersTable).where(and(eq(usersTable.phone, String(body.phone)), ne(usersTable.id, userId))).limit(1);
    if (clash) { res.status(409).json({ success: false, error: { code: "CONFLICT", message: "Phone number already registered" } }); return; }
    updates.phone = String(body.phone);
  }
  if (body.city !== undefined) updates.city = String(body.city);
  if (body.bio !== undefined) updates.bio = body.bio ? String(body.bio) : null;
  if (body.avatarUrl !== undefined) updates.avatarUrl = body.avatarUrl ? String(body.avatarUrl) : null;

  if (body.educationType !== undefined) {
    const educationType = String(body.educationType);
    if (!["SCHOOL", "COLLEGE"].includes(educationType)) { badRequest(res, "Education type must be SCHOOL or COLLEGE"); return; }
    const name = typeof body.schoolOrCollegeName === "string" ? body.schoolOrCollegeName.trim() : "";
    if (name.length < 2) { badRequest(res, "School or college name is required"); return; }
    updates.educationType = educationType;
    if (educationType === "SCHOOL") {
      if (!body.schoolClass) { badRequest(res, "Class is required for school students"); return; }
      updates.schoolClass = String(body.schoolClass);
      updates.degreeLevel = null;
      updates.collegeYear = null;
    } else {
      const degreeLevel = String(body.degreeLevel ?? "");
      if (!["DIPLOMA", "BACHELORS", "MASTERS"].includes(degreeLevel)) { badRequest(res, "Valid degree level is required for college students"); return; }
      if (!body.collegeYear) { badRequest(res, "College year is required for college students"); return; }
      updates.degreeLevel = degreeLevel;
      updates.collegeYear = String(body.collegeYear);
      updates.schoolClass = null;
    }
  }
  if (body.schoolOrCollegeName !== undefined) {
    const name = String(body.schoolOrCollegeName ?? "").trim();
    if (name.length < 2) { badRequest(res, "School or college name is required"); return; }
    updates.schoolOrCollegeName = name;
  }

  if (body.password !== undefined) {
    if (String(body.password).length < 8) { badRequest(res, "Password must be at least 8 characters"); return; }
    updates.passwordHash = await bcrypt.hash(String(body.password), 12);
  }

  let resolvedExpertise: string[] | null = null;
  if (body.expertiseIds !== undefined) {
    resolvedExpertise = await resolveExpertiseIds(body.expertiseIds);
    if (!resolvedExpertise) { badRequest(res, "Select 1 to 6 valid expertise options"); return; }
  }

  if (Object.keys(updates).length > 0) {
    await db.update(usersTable).set(updates).where(eq(usersTable.id, userId));
  }
  if (resolvedExpertise) {
    await db.delete(userExpertiseTable).where(eq(userExpertiseTable.userId, userId));
    await db.insert(userExpertiseTable).values(resolvedExpertise.map((expertiseId) => ({ userId, expertiseId })));
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  res.json({ success: true, user: await serializeUserMe(user) });
});

router.patch("/v1/users/me/availability", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { isAvailable } = req.body;
  if (typeof isAvailable !== "boolean") {
    badRequest(res, "isAvailable must be a boolean");
    return;
  }
  await db.update(usersTable).set({ isAvailable }).where(eq(usersTable.id, userId));
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  res.json({ success: true, user: await serializeUserMe(user) });
});

export default router;
