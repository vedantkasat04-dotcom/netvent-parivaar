# NetVent Parivaar

A full-stack youth networking community platform for Indian students — "Bharat ka apna Parivaar."

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/netvent run dev` — run the frontend (port 23020, proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — seed the database with initial data
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + shadcn/ui, Wouter routing, React Query, Baloo 2 + Inter fonts, saffron/amber palette
- API: Express 5, cookie-based JWT auth (`nvp_session` cookie)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas
- `lib/db/src/schema/` — Drizzle ORM schema (all tables)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/middlewares/auth.ts` — JWT auth helpers
- `artifacts/netvent/src/pages/` — React pages
- `artifacts/netvent/src/hooks/use-auth.tsx` — Auth context

## Architecture decisions

- Cookie-based JWT auth (`nvp_session`, 7-day expiry, httpOnly). Cookie name chosen for clear namespacing.
- Admin router mounted at `/v1/admin` path prefix to avoid middleware intercepting all routes.
- Member IDs follow `NVP0001` format, assigned sequentially on approval.
- Privacy controls: members under 18 always have phone/WhatsApp set to private; adult members choose their own settings.
- `inArray()` used instead of `sql ANY()` for type-safe multi-value queries in Drizzle.

## Product

- **Public:** Landing page, events listing, member directory, team page, about page
- **Auth:** Signup / login (cookie JWT), profile management
- **Members:** Multi-step join application → admin review → NVP#### ID assignment
- **Community:** Interest groups, discussion/announcement/resource posts, activity feed
- **Events:** RSVP system, upcoming/past events with photos and sponsors
- **Admin dashboard:** Application queue, member management, event/group/team CRUD, reports, audit log
- **Notifications:** Application approval/rejection notifications

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm run typecheck:libs` after changing any `lib/*` package before typechecking artifacts.
- `req.params.*` in Express has type `string | string[]` — always cast with `String(req.params.*)` before passing to Drizzle.
- Orval `TS2308` collision: endpoints with BOTH path params AND query params generate conflicting `*Params` types. Fix by moving query-param-only variants to a different path.
- Admin router must be mounted at a path prefix (`router.use("/v1/admin", adminRouter)`) — using `router.use(middleware)` without a path in a sub-router intercepts ALL requests when mounted without a prefix.
- DB push command: `pnpm --filter @workspace/db run push`
- Seed admin credentials: `admin@netvent.in` / `Admin@12345`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
