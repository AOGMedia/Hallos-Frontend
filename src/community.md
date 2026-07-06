# Community Feature API Documentation

## Overview

The Community Feature lets any authenticated user create a gated, private space on the hallos platform. Each community has its own members, roles, content, and announcements. Communities integrate with the existing payment, wallet, coupon, and referral systems without any changes to payment routing.

## Role Hierarchy

| Role | Who | What they can do |
|---|---|---|
| `owner` | Creator of the community | Everything — manage moderators, delete community, transfer ownership |
| `moderator` | Assigned by owner | Approve/reject join requests, manage members, post announcements, moderate content submissions |
| `member` | Regular member | View content, submit content for review, attend classes |
| Platform Admin | hallos admin (`role = 'admin'`) | Supreme authority over all communities regardless of membership |

## Community Status Flow

```
pending → active (admin approves)
pending → rejected (admin rejects)
active  → suspended (admin suspends)
```

A community with status `pending` is invisible to non-admins. A `suspended` community blocks all member access.

---

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```


## Auth Required Endpoints

### 3. Create Community

### 4. Join a Community (Request)

**`POST /api/communities/:id/join`**

Sends a join request. Status will be `pending` until a moderator or owner approves it.

**Authentication:** Required

**No request body needed.**

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "member-uuid",
    "communityId": "a1b2c3d4-...",
    "userId": 42,
    "role": "member",
    "status": "pending",
    "createdAt": "2026-04-23T10:05:00.000Z"
  }
}
```

**Error Responses:**
```json
{ "success": false, "message": "You already have a pending or active membership in this community." }
{ "success": false, "message": "Community is not active." }
```

---

### 5. Join via Invite Link

**`GET /api/communities/invite/:token`**

Joins a community using an invite token. Works for both public and private communities. Creates a pending join request subject to moderator approval.

**Authentication:** Required

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "member-uuid",
    "communityId": "a1b2c3d4-...",
    "status": "pending"
  }
}
```

**Error Response (404):**
```json
{ "success": false, "message": "Invalid invite link." }
```

---

## Member Endpoints (Active Membership Required)

### 6. Leave Community

**`DELETE /api/communities/:id/members/me`**

Leaves the community. If the caller is the owner, ownership transfer logic applies automatically (see Ownership Transfer section).

**Authentication:** Required + Active member

**Success Response (200):**
```json
{ "success": true, "message": "Left community." }
```

---

### 7. Toggle Email Notifications

**`PATCH /api/communities/:id/members/me/notifications`**

Enables or disables announcement email notifications for this community.

**Authentication:** Required + Active member

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| enabled | boolean | Yes | `true` to enable, `false` to disable |

```json
{ "enabled": false }
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "communityId": "a1b2c3d4-...",
    "userId": 42,
    "emailNotificationsEnabled": false
  }
}
```

---

### 8. List Announcements

**`GET /api/communities/:id/announcements`**

Returns all announcements for the community. Pinned announcements always appear first.

**Authentication:** Required + Active member

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "ann-uuid",
      "communityId": "a1b2c3d4-...",
      "createdBy": 5,
      "title": "Welcome to the Guild!",
      "body": "We are excited to have you here...",
      "imageUrl": null,
      "isPinned": true,
      "createdAt": "2026-04-10T09:00:00.000Z"
    },
    {
      "id": "ann-uuid-2",
      "title": "April Workshop",
      "isPinned": false,
      "createdAt": "2026-04-20T14:00:00.000Z"
    }
  ]
}
```

---

### 9. List Community Content

**`GET /api/communities/:id/content`**

Returns all content belonging to this community. Members see full content. Non-members (via public profile) only see title, thumbnail, and price for `community_visibility = 'public'` items.

**Authentication:** Required + Active member

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "videos": [
      {
        "id": "vid-uuid",
        "title": "Lighting Basics",
        "thumbnailUrl": "https://...",
        "price": 2000,
        "currency": "NGN",
        "communityVisibility": "community_only"
      }
    ],
    "liveClasses": [],
    "liveSeries": [],
    "freebies": []
  }
}
```

---

### 10. Submit Content for Review

**`POST /api/communities/:id/submissions`**

Submits content for moderator review before it goes live in the community.

**Authentication:** Required + Active member

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| contentType | string | Yes | `video`, `live_class`, `live_series`, or `freebie` |
| communityVisibility | string | No | `community_only` (default) or `public` |
| contentData | object | Yes | Full content payload (same fields as creating that content type directly) |

```json
{
  "contentType": "video",
  "communityVisibility": "community_only",
  "contentData": {
    "title": "Advanced Lighting Techniques",
    "description": "Deep dive into studio lighting",
    "price": 3500,
    "currency": "NGN",
    "thumbnailUrl": "https://..."
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "sub-uuid",
    "communityId": "a1b2c3d4-...",
    "contentType": "video",
    "status": "pending",
    "communityVisibility": "community_only",
    "createdAt": "2026-04-23T11:00:00.000Z"
  }
}
```

---

### 11. Resubmit Rejected Content

**`PATCH /api/communities/:id/submissions/:sid/resubmit`**

Updates and resubmits a previously rejected content submission.

**Authentication:** Required + Active member (must be original submitter)

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| contentData | object | Yes | Updated content payload |

```json
{
  "contentData": {
    "title": "Advanced Lighting Techniques (Revised)",
    "description": "Updated description",
    "price": 3000,
    "currency": "NGN"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "sub-uuid",
    "status": "resubmitted",
    "contentData": { "title": "Advanced Lighting Techniques (Revised)", "..." : "..." }
  }
}
```

---

## Moderator Endpoints (Moderator or Owner Role Required)

### 12. List Members

**`GET /api/communities/:id/members`**

Returns all members of the community with their roles and statuses.

**Authentication:** Required + Moderator or Owner

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "member-uuid",
      "communityId": "a1b2c3d4-...",
      "role": "member",
      "status": "active",
      "joinedAt": "2026-04-05T08:00:00.000Z",
      "emailNotificationsEnabled": true,
      "user": {
        "id": 42,
        "firstname": "Ada",
        "lastname": "Obi",
        "email": "ada@example.com"
      }
    }
  ]
}
```

---

### 13. Add Member by Email

**`POST /api/communities/:id/members`**

Adds a user directly by email address. If the user exists on the platform, they are added immediately as an active member. If not, an invitation email is sent.

**Authentication:** Required + Moderator or Owner

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| email | string | Yes | Email address of the user to add |

```json
{ "email": "newmember@example.com" }
```

**Success Response — existing user (201):**
```json
{
  "success": true,
  "data": {
    "id": "member-uuid",
    "userId": 55,
    "role": "member",
    "status": "active",
    "joinedAt": "2026-04-23T12:00:00.000Z"
  }
}
```

**Success Response — user not on platform (201):**
```json
{
  "success": true,
  "data": {
    "invited": true,
    "email": "newmember@example.com"
  }
}
```

---

### 14. Remove Member

**`DELETE /api/communities/:id/members/:uid`**

Removes a member from the community. Their content records are preserved.

**Authentication:** Required + Moderator or Owner

**Success Response (200):**
```json
{ "success": true, "message": "Member removed." }
```

---

### 15. Approve Join Request

**`POST /api/communities/:id/join-requests/:uid/approve`**

Approves a pending join request. The user's status becomes `active` and `memberCount` is incremented. A confirmation email is sent to the user.

**Authentication:** Required + Moderator or Owner

**No request body needed.**

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "member-uuid",
    "userId": 42,
    "status": "active",
    "joinedAt": "2026-04-23T12:10:00.000Z"
  }
}
```

---

### 16. Reject Join Request

**`POST /api/communities/:id/join-requests/:uid/reject`**

Rejects a pending join request.

**Authentication:** Required + Moderator or Owner

**No request body needed.**

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "member-uuid",
    "userId": 42,
    "status": "banned"
  }
}
```

---

### 17. List Moderation Queue

**`GET /api/communities/:id/submissions`**

Returns all pending and resubmitted content submissions awaiting review.

**Authentication:** Required + Moderator or Owner

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "sub-uuid",
      "submittedBy": 42,
      "contentType": "video",
      "status": "pending",
      "communityVisibility": "community_only",
      "contentData": { "title": "Advanced Lighting", "price": 3500 },
      "createdAt": "2026-04-23T11:00:00.000Z"
    }
  ]
}
```

---

### 18. Approve Submission

**`POST /api/communities/:id/submissions/:sid/approve`**

Approves a content submission. Creates the actual content record in the platform (video, live class, etc.) with `community_id` set.

**Authentication:** Required + Moderator or Owner

**No request body needed.**

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "sub-uuid",
    "status": "approved",
    "reviewedBy": 5,
    "reviewedAt": "2026-04-23T13:00:00.000Z"
  }
}
```

---

### 19. Reject Submission

**`POST /api/communities/:id/submissions/:sid/reject`**

Rejects a content submission. A rejection reason is mandatory.

**Authentication:** Required + Moderator or Owner

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| rejectionReason | string | Yes | Reason for rejection (shown to submitter) |

```json
{ "rejectionReason": "Content does not meet community guidelines. Please revise the description." }
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "sub-uuid",
    "status": "rejected",
    "rejectionReason": "Content does not meet community guidelines. Please revise the description.",
    "reviewedBy": 5,
    "reviewedAt": "2026-04-23T13:05:00.000Z"
  }
}
```

**Error Response (400):**
```json
{ "success": false, "message": "Rejection reason is required." }
```

---

### 20. Create Announcement

**`POST /api/communities/:id/announcements`**

Creates an announcement. An email notification is sent to all active members who have `emailNotificationsEnabled = true` (fire-and-forget — does not block the response).

**Authentication:** Required + Moderator or Owner

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| title | string | Yes | Announcement title (max 300 chars) |
| body | string | Yes | Announcement body text |
| imageUrl | string | No | Optional image URL |
| isPinned | boolean | No | Pin to top of announcements list (default: false) |

```json
{
  "title": "April Workshop Reminder",
  "body": "Don't forget our workshop this Saturday at 10am. Bring your camera!",
  "imageUrl": "https://...",
  "isPinned": true
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "ann-uuid",
    "communityId": "a1b2c3d4-...",
    "createdBy": 5,
    "title": "April Workshop Reminder",
    "body": "Don't forget our workshop this Saturday at 10am. Bring your camera!",
    "imageUrl": "https://...",
    "isPinned": true,
    "createdAt": "2026-04-23T14:00:00.000Z"
  }
}
```

---

### 21. Update Announcement

**`PATCH /api/communities/:id/announcements/:aid`**

Updates an existing announcement (title, body, image, or pin status).

**Authentication:** Required + Moderator or Owner

**Request Body** (any subset):
```json
{
  "isPinned": false,
  "title": "April Workshop — Updated Time"
}
```

**Success Response (200):** Updated announcement object (same shape as create response).

---

### 22. Delete Announcement

**`DELETE /api/communities/:id/announcements/:aid`**

Deletes an announcement.

**Authentication:** Required + Moderator or Owner

**Success Response (200):**
```json
{ "success": true, "message": "Announcement deleted." }
```

---

### 23. Get Invite Link

**`GET /api/communities/:id/invite`**

Returns the current invite token for the community.

**Authentication:** Required + Moderator or Owner

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "inviteToken": "3f8a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a",
    "inviteUrl": "https://www.hallos.net/communities/invite/3f8a2b1c..."
  }
}
```

---

### 24. Regenerate Invite Token

**`POST /api/communities/:id/invite/regenerate`**

Generates a new invite token, invalidating the previous one. Any old invite links will return 404.

**Authentication:** Required + Moderator or Owner

**No request body needed.**

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "inviteToken": "new64charhextoken..."
  }
}
```

---

### 25. Create Content Directly

**`POST /api/communities/:id/content`**

Moderators and owners can create content directly without going through the submission queue. The content record is created immediately.

**Authentication:** Required + Moderator or Owner

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| contentType | string | Yes | `video`, `live_class`, `live_series`, or `freebie` |
| communityVisibility | string | No | `community_only` (default) or `public` |
| ...contentFields | mixed | Yes | All required fields for that content type |

```json
{
  "contentType": "video",
  "communityVisibility": "public",
  "title": "Introduction to Photography",
  "description": "Beginner-friendly video",
  "price": 1500,
  "currency": "NGN",
  "thumbnailUrl": "https://..."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "vid-uuid",
    "title": "Introduction to Photography",
    "communityId": "a1b2c3d4-...",
    "communityVisibility": "public",
    "createdAt": "2026-04-23T15:00:00.000Z"
  }
}
```

---

## Owner Endpoints (Owner Role Required)

### 26. Update Community Profile

**`PATCH /api/communities/:id`**

Updates community details. Only the owner can do this.

**Authentication:** Required + Owner (enforced in service)

**Request Body** (any subset):
```json
{
  "name": "Lagos Photographers Guild — Official",
  "description": "Updated description",
  "thumbnailUrl": "https://...",
  "visibility": "private"
}
```

**Success Response (200):** Updated community object.

---

### 27. Assign / Revoke Moderator

**`PATCH /api/communities/:id/members/:uid/role`**

Assigns or revokes the moderator role for a member.

**Authentication:** Required + Owner

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| role | string | Yes | `moderator` to assign, `member` to revoke |

```json
{ "role": "moderator" }
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "member-uuid",
    "userId": 42,
    "role": "moderator"
  }
}
```

**Error Response (400):**
```json
{ "success": false, "message": "Role must be moderator or member." }
```

---

### 28. Transfer Ownership

**`POST /api/communities/:id/transfer-ownership`**

Transfers ownership to another active member. The current owner becomes a regular member.

**Authentication:** Required + Owner

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| newOwnerId | integer | Yes | User ID of the new owner (must be an active member) |

```json
{ "newOwnerId": 55 }
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "member-uuid",
    "userId": 55,
    "role": "owner"
  }
}
```

**Error Responses:**
```json
{ "success": false, "message": "Owner role required." }
{ "success": false, "message": "Target user is not an active member of this community." }
```

---

### 29. Delete Community

**`DELETE /api/communities/:id`**

Deletes the community. Only allowed if there are no other active members and no content records. Returns 409 otherwise.

**Authentication:** Required + Owner

**Success Response (200):**
```json
{ "success": true, "message": "Community deleted." }
```

**Error Response (409):**
```json
{ "success": false, "message": "Cannot delete community with active members or content. Remove all members and content first." }
```
## Payment for Community Content

Payments for community content use the existing payment flow with no changes. Just pass `communityId` in the request body when initializing a payment:

**`POST /api/payments/initialize`**

```json
{
  "contentType": "video",
  "contentId": "vid-uuid",
  "communityId": "a1b2c3d4-...",
  "currency": "NGN"
}
```

The `communityId` is stored in payment metadata for traceability. Earnings go directly to the content creator's wallet as normal.

---

## Ownership Transfer Logic

When an owner leaves a community (`DELETE /api/communities/:id/members/me`), the following happens automatically:

| Scenario | Result |
|---|---|
| No other members and no content | Community is deleted |
| Moderators exist | Earliest moderator (by `joinedAt`) becomes the new owner |
| Members exist but no moderators | Community status set to `pending`, platform admin notified by email |

---

## Error Reference

| Status | Meaning |
|---|---|
| 400 | Validation error (missing fields, empty rejection reason) |
| 401 | Not authenticated |
| 403 | Insufficient role (member attempting moderator action, etc.) |
| 404 | Community, member, submission, or content not found |
| 409 | Conflict (duplicate join request, deleting community with members/content) |
| 500 | Server error |

All error responses follow this shape:
```json
{ "success": false, "message": "Description of what went wrong" }
```