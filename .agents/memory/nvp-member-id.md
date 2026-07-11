---
name: NVP member ID format
description: Member IDs are NVP0001 format, assigned sequentially on admin approval.
---

## Rule
Member IDs follow the pattern `NVP` + 4-digit zero-padded number (e.g. `NVP0001`, `NVP0042`).

## How they are assigned
On admin approval (`POST /api/v1/admin/members/:profileId/approve`):
1. Query the highest existing `memberId` from `memberProfilesTable` (ordered DESC)
2. Parse the number from the string, increment by 1
3. Format as `NVP${String(nextNum).padStart(4, "0")}`
4. Write to `memberProfilesTable.memberId` alongside setting `status = "APPROVED"` and upgrading `usersTable.role` to `"MEMBER"`
5. Send `APPLICATION_APPROVED` notification with the new memberId

## Why
Sequential IDs give a sense of community seniority and are human-readable for member recognition.
