import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, expertiseTable, userExpertiseTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import crypto from "crypto";
import { Resend } from "resend";

const router = Router();

function badRequest(res: any, message: string) {
  res.status(400).json({ success: false, error: { code: "VALIDATION", message } });
}

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Password Reset Tokens table (inline schema) ─────────────────────────────
const passwordResetTokensTable = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function resolveExpertiseIds(ids: unknown): Promise<string[] | null> {
  if (!Array.isArray(ids) || ids.length === 0) return null;
  const unique = [...new Set(ids.map(String))];
  if (unique.length > 6) return null;
  const rows = await db.select({ id: expertiseTable.id }).from(expertiseTable).where(inArray(expertiseTable.id, unique));
  if (rows.length !== unique.length) return null;
  return unique;
}

function validateEducation(body: Record<string, unknown>): string | null {
  const { educationType, schoolOrCollegeName, schoolClass, degreeLevel, collegeYear } = body;
  if (typeof schoolOrCollegeName !== "string" || schoolOrCollegeName.trim().length < 2) {
    return "School or college name is required";
  }
  if (educationType === "SCHOOL") {
    if (!schoolClass) return "Class is required for school students";
  } else if (educationType === "COLLEGE") {
    if (!degreeLevel || !["DIPLOMA", "BACHELORS", "MASTERS"].includes(String(degreeLevel))) return "Valid degree level is required for college students";
    if (!collegeYear) return "College year is required for college students";
  }
  return null;
}

// ─── Auth routes ──────────────────────────────────────────────────────────────
router.post("/v1/auth/signup", async (req, res) => {
  const { name, email, password, phone, city, educationType, schoolOrCollegeName, schoolClass, degreeLevel, collegeYear, expertiseIds } = req.body;
  if (!name || !email || !password || !phone || !city || !educationType) {
    badRequest(res, "name, email, password, phone, city and educationType are required");
    return;
  }
  const eduError = validateEducation(req.body);
  if (eduError) { badRequest(res, eduError); return; }

  const resolvedExpertise = await resolveExpertiseIds(expertiseIds);
  if (expertiseIds?.length > 0 && !resolvedExpertise) {
    badRequest(res, "Select 1 to 6 valid expertise options");
    return;
  }

  const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) { badRequest(res, "Email already in use"); return; }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({
    name, email, passwordHash, phone, city,
    educationType, schoolOrCollegeName,
    schoolClass: educationType === "SCHOOL" ? schoolClass : null,
    degreeLevel: educationType === "COLLEGE" ? degreeLevel : null,
    collegeYear: educationType === "COLLEGE" ? collegeYear : null,
  }).returning();

  if (resolvedExpertise?.length) {
    await db.insert(userExpertiseTable).values(resolvedExpertise.map(id => ({ userId: user.id, expertiseId: id })));
  }

  (req.session as any).userId = user.id;
  res.status(201).json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.post("/v1/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) { badRequest(res, "email and password are required"); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) { res.status(401).json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } }); return; }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) { res.status(401).json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } }); return; }

  (req.session as any).userId = user.id;

  const expertiseRows = await db.select({ id: expertiseTable.id, name: expertiseTable.name })
    .from(userExpertiseTable)
    .innerJoin(expertiseTable, eq(userExpertiseTable.expertiseId, expertiseTable.id))
    .where(eq(userExpertiseTable.userId, user.id));

  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, city: user.city, educationType: user.educationType, schoolOrCollegeName: user.schoolOrCollegeName, schoolClass: user.schoolClass, degreeLevel: user.degreeLevel, collegeYear: user.collegeYear, bio: user.bio, avatarUrl: user.avatarUrl, isAvailable: user.isAvailable, expertise: expertiseRows } });
});

router.post("/v1/auth/logout", (req, res) => {
  req.session.destroy(() => {});
  res.json({ success: true });
});

router.get("/v1/auth/me", requireAuth, async (req: AuthRequest, res) => {
  const user = req.user!;
  const expertiseRows = await db.select({ id: expertiseTable.id, name: expertiseTable.name })
    .from(userExpertiseTable)
    .innerJoin(expertiseTable, eq(userExpertiseTable.expertiseId, expertiseTable.id))
    .where(eq(userExpertiseTable.userId, user.id));
  res.json({ success: true, user: { ...user, expertise: expertiseRows } });
});

// ─── Forgot Password ──────────────────────────────────────────────────────────
router.post("/v1/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) { res.status(400).json({ success: false, error: { code: "VALIDATION", message: "Email is required" } }); return; }

  // Always return success — don't reveal if email exists
  const [user] = await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email })
    .from(usersTable).where(eq(usersTable.email, email)).limit(1);

  if (user) {
    // Delete any existing unused tokens for this user
    await db.delete(passwordResetTokensTable).where(eq(passwordResetTokensTable.userId, user.id));

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(passwordResetTokensTable).values({ userId: user.id, token, expiresAt });

    const resetUrl = `${process.env.FRONTEND_URL || "https://netventparivaar.in"}/reset-password?token=${token}`;

    await resend.emails.send({
      from: "NetVent Parivaar <onboarding@resend.dev>",
      to: user.email,
      subject: "Reset your NetVent Parivaar password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f7fafa;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: #3FA796; border-radius: 50%; line-height: 48px; color: white; font-size: 24px; font-weight: bold;">N</div>
            <h2 style="color: #0E1B2A; margin: 12px 0 0;">NetVent Parivaar</h2>
          </div>
          <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            <h3 style="color: #0E1B2A; margin-top: 0;">Hi ${user.name},</h3>
            <p style="color: #4A5568; line-height: 1.6;">We received a request to reset your password. Click the button below to set a new password.</p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resetUrl}" style="background: #3FA796; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #718096; font-size: 14px; line-height: 1.6;">This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
            <p style="color: #A0AEC0; font-size: 12px; text-align: center;">NetVent Parivaar &mdash; Bharat ka apna Parivaar</p>
          </div>
        </div>
      `,
    });
  }

  // Always return 200 — don't reveal if email exists
  res.json({ success: true, message: "If this email is registered, you will receive a reset link shortly." });
});

// ─── Reset Password ───────────────────────────────────────────────────────────
router.post("/v1/auth/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) { res.status(400).json({ success: false, error: { code: "VALIDATION", message: "Token and password are required" } }); return; }
  if (password.length < 8) { res.status(400).json({ success: false, error: { code: "VALIDATION", message: "Password must be at least 8 characters" } }); return; }

  const [resetToken] = await db.select().from(passwordResetTokensTable).where(eq(passwordResetTokensTable.token, token)).limit(1);

  if (!resetToken) {
    res.status(400).json({ success: false, error: { code: "INVALID_TOKEN", message: "Invalid or expired reset link. Please request a new one." } });
    return;
  }
  if (resetToken.usedAt) {
    res.status(400).json({ success: false, error: { code: "TOKEN_USED", message: "This reset link has already been used. Please request a new one." } });
    return;
  }
  if (new Date() > resetToken.expiresAt) {
    res.status(400).json({ success: false, error: { code: "TOKEN_EXPIRED", message: "This reset link has expired. Please request a new one." } });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, resetToken.userId));
  await db.update(passwordResetTokensTable).set({ usedAt: new Date() }).where(eq(passwordResetTokensTable.id, resetToken.id));

  res.json({ success: true, message: "Password reset successfully. You can now log in." });
});

export default router;
