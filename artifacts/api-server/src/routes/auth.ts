import { Router, type CookieOptions } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, expertiseTable, userExpertiseTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { signToken, requireAuth, type AuthRequest } from "../middlewares/auth";
import { serializeUserMe } from "../lib/user";

const router = Router();

const SESSION_7D = 7 * 24 * 60 * 60 * 1000;
const SESSION_30D = 30 * 24 * 60 * 60 * 1000;

function badRequest(res: import("express").Response, message: string) {
  res.status(400).json({ success: false, error: { code: "VALIDATION", message } });
}

async function resolveExpertiseIds(ids: unknown): Promise<string[] | null> {
  if (!Array.isArray(ids) || ids.length === 0) return null;
  const unique = [...new Set(ids.map(String))];
  if (unique.length > 3) return null;
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
  } else {
    return "Education type must be SCHOOL or COLLEGE";
  }
  return null;
}

router.post("/v1/auth/signup", async (req, res) => {
  const { name, email, password, phone, city, educationType, schoolOrCollegeName, schoolClass, degreeLevel, collegeYear, expertiseIds } = req.body;
  if (!name || !email || !password || !phone || !city || !educationType) {
    badRequest(res, "name, email, password, phone, city and educationType are required");
    return;
  }
  if (String(password).length < 8) {
    badRequest(res, "Password must be at least 8 characters");
    return;
  }
  if (!/^[0-9]{10}$/.test(String(phone))) {
    badRequest(res, "Phone must be a 10-digit number");
    return;
  }
  const eduError = validateEducation(req.body);
  if (eduError) {
    badRequest(res, eduError);
    return;
  }
  const resolvedExpertise = await resolveExpertiseIds(expertiseIds);
  if (!resolvedExpertise) {
    badRequest(res, "Select 1 to 3 valid expertise options");
    return;
  }

  const normalizedEmail = String(email).toLowerCase();
  const [existingEmail] = await db.select().from(usersTable).where(eq(usersTable.email, normalizedEmail)).limit(1);
  if (existingEmail) {
    res.status(409).json({ success: false, error: { code: "CONFLICT", message: "Email already registered" } });
    return;
  }
  const [existingPhone] = await db.select().from(usersTable).where(eq(usersTable.phone, String(phone))).limit(1);
  if (existingPhone) {
    res.status(409).json({ success: false, error: { code: "CONFLICT", message: "Phone number already registered" } });
    return;
  }

  const passwordHash = await bcrypt.hash(String(password), 12);
  const [user] = await db.insert(usersTable).values({
    name: String(name),
    email: normalizedEmail,
    phone: String(phone),
    passwordHash,
    city: String(city),
    educationType: educationType as "SCHOOL" | "COLLEGE",
    schoolOrCollegeName: schoolOrCollegeName ? String(schoolOrCollegeName) : null,
    schoolClass: educationType === "SCHOOL" && schoolClass ? String(schoolClass) : null,
    degreeLevel: educationType === "COLLEGE" ? (degreeLevel as "DIPLOMA" | "BACHELORS" | "MASTERS") : null,
    collegeYear: educationType === "COLLEGE" && collegeYear ? String(collegeYear) : null,
  }).returning();

  await db.insert(userExpertiseTable).values(resolvedExpertise.map((expertiseId) => ({ userId: user.id, expertiseId })));

  const token = signToken({ userId: user.id, role: user.role });
  res.cookie("nvp_session", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: SESSION_7D });
  res.status(201).json({ success: true, user: await serializeUserMe(user) });
});

router.post("/v1/auth/login", async (req, res) => {
  const { email, password, rememberMe } = req.body;
  if (!email || !password) {
    badRequest(res, "email and password required");
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, String(email).toLowerCase())).limit(1);
  if (!user) {
    res.status(401).json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });
    return;
  }
  const valid = await bcrypt.compare(String(password), user.passwordHash);
  if (!valid) {
    res.status(401).json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });
    return;
  }
  const token = signToken({ userId: user.id, role: user.role }, rememberMe ? "30d" : "7d");
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
  // "Remember me" persists for 30 days; otherwise a session cookie that ends with the browser.
  if (rememberMe) cookieOptions.maxAge = SESSION_30D;
  res.cookie("nvp_session", token, cookieOptions);
  res.json({ success: true, user: await serializeUserMe(user) });
});

router.post("/v1/auth/logout", (_req, res) => {
  res.clearCookie("nvp_session");
  res.json({ success: true, message: "Logged out" });
});

router.get("/v1/auth/me", requireAuth, async (req: AuthRequest, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
  if (!user) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User not found" } });
    return;
  }
  res.json({ success: true, user: await serializeUserMe(user) });
});

export default router;
