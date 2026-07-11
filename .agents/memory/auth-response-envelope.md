---
name: Auth response envelope consistency
description: All auth endpoints (signup/login/getMe) must share the same { success, user } envelope, and the OpenAPI response schema must match the server's actual envelope.
---

# Auth response envelope consistency

All NetVent auth endpoints return `AuthResponse` = `{ success: boolean, user: UserMe }`. `getMe` (`GET /v1/auth/me`) must use the same envelope as `signup`/`login`.

**Why:** The OpenAPI spec once declared `getMe`'s response as `UserMe` directly while the server actually returned `{ success, user }`. Orval generated `useGetMe` typed as `UserMe`, so the auth context read the envelope as if it were the user — `user.name` was `undefined`, crashing the dashboard at render. Server and spec disagreeing on the envelope is silent until runtime.

**How to apply:** When adding or changing any endpoint that returns the current user or auth state, make the OpenAPI response `$ref` match the exact envelope the handler sends, regenerate codegen, and have the client read `data.user` (not `data`). If you ever see a "cannot read properties of undefined" right after a 200 auth response, suspect an envelope/spec mismatch first.
