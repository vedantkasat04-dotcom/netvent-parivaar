---
name: Orval TS2308 collision
description: Endpoints with both path params AND query params generate conflicting *Params type names in Orval codegen.
---

## Rule
Never define an endpoint that has BOTH path parameters AND query parameters if a nearby endpoint shares a similar name, as Orval generates a `*Params` type for each and they collide (TS2308 duplicate identifier).

## Why
Orval names the query-param type `{operationId}Params`. If two endpoints produce the same name (e.g. `getGroup` with a path param and `listGroupPosts` which also had path+query params), the generated `api.ts` and `api.schemas.ts` both export the same name.

## How to apply
Move query-param-only variants to a distinct path. For NetVent: `listGroupPosts` was split out to `/v1/posts?groupId=...` instead of `/v1/groups/:groupId/posts` to avoid the collision.
