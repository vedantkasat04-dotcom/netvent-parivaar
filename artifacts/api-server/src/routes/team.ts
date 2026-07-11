import { Router } from "express";
import { db, teamMembersTable } from "@workspace/db";
import { asc } from "drizzle-orm";

const router = Router();

router.get("/v1/team", async (_req, res) => {
  const team = await db.select().from(teamMembersTable).orderBy(asc(teamMembersTable.displayOrder));
  res.json({ success: true, data: team });
});

export default router;
