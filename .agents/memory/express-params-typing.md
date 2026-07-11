---
name: Express req.params typing
description: req.params.* has type string | string[] in Express TS — must cast before Drizzle.
---

## Rule
Always cast `req.params.*` to `string` before passing to Drizzle ORM `eq()` or insert values:

```typescript
const eventId = String(req.params.eventId);
await db.select().from(eventsTable).where(eq(eventsTable.id, eventId));
```

## Why
In Express's TypeScript types, `req.params` is `Record<string, string>` but the individual values can be inferred as `string | string[]` in certain contexts (especially when spreading middleware arrays with `...adminMod`). Drizzle's `eq()` only accepts `string | SQLWrapper`, so passing `string | string[]` causes TS2769 overload errors.

## How to apply
Add `const xId = String(req.params.xId);` at the top of every route handler that uses path params.
