import { db, usersTable, expertiseTable, userExpertiseTable, type User } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function getUserExpertise(userId: string) {
  const rows = await db
    .select({ id: expertiseTable.id, name: expertiseTable.name })
    .from(userExpertiseTable)
    .innerJoin(expertiseTable, eq(userExpertiseTable.expertiseId, expertiseTable.id))
    .where(eq(userExpertiseTable.userId, userId));
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

export async function serializeUserMe(user: User) {
  const expertise = await getUserExpertise(user.id);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    city: user.city,
    educationType: user.educationType,
    schoolOrCollegeName: user.schoolOrCollegeName,
    schoolClass: user.schoolClass,
    degreeLevel: user.degreeLevel,
    collegeYear: user.collegeYear,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    isAvailable: user.isAvailable,
    expertise,
  };
}

export async function getUserById(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  return user;
}
