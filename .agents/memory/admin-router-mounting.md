---
name: Admin router mounting
description: Why admin router must be mounted with a path prefix, not as a bare router.use(middleware).
---

## Rule
Mount the admin router with a path prefix: `router.use("/v1/admin", adminRouter)`.

Do NOT use `router.use(requireAuth, ...)` as a blanket middleware at the top of the admin router when it is mounted without a path prefix.

## Why
When an Express sub-router is mounted without a path prefix (`router.use(adminRouter)`), its `router.use(middleware)` calls run for ALL requests that flow through the parent router — not just the routes defined in the sub-router. This caused `/api/v1/stats` (a public endpoint) to return 401 because the admin router's blanket `requireAuth` was intercepting it.

## How to apply
- In `routes/index.ts`: `router.use("/v1/admin", adminRouter)`
- In `admin.ts`: define routes without the `/v1/admin` prefix (e.g. `router.get("/dashboard", ...)`)
- Apply auth middleware per-route using spread arrays: `const adminMod = [requireAuth, requireRole("ADMIN", "MODERATOR")]` then `router.get("/dashboard", ...adminMod, handler)`
