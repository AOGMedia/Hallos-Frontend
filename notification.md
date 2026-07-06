You are a senior product engineer and admin-dashboard architect working on a LIVE production platform.

Your task is to implement an ADMIN-ONLY Notification Management System into the EXISTING admin dashboard WITHOUT breaking current functionality, layouts, routing, permissions, APIs, styling, or state management.

IMPORTANT:
- This is a live production platform.
- DO NOT redesign the entire admin dashboard.
- DO NOT refactor unrelated modules.
- DO NOT expose admin functionality to regular users.
- DO NOT modify backend contracts.
- ONLY extend the current admin architecture cleanly.
- Preserve existing coding conventions, design system, auth guards, and role-based access structure.

The implementation must feel native to the platform.

====================================================
FEATURE OVERVIEW
====================================================

Implement an Admin Notification Center with:

1. Digest Queue Monitoring
2. Notification Logs Viewer
3. Manual Digest Triggering
4. Metrics & Status Visibility
5. Search + Filtering
6. Pagination
7. Safe Admin Actions

This should feel like:
- Stripe Admin
- Linear Internal Tools
- Vercel Dashboard
- Modern SaaS operations panel

====================================================
API BASE URL
====================================================

use existing apiclient

All endpoints require:
Authorization: Bearer <token>

Admin endpoints must remain protected.

====================================================
ADMIN API ENDPOINTS
====================================================

====================================================
1. VIEW DIGEST QUEUE
====================================================

GET /api/notifications/digest-queue?status=pending&page=1&limit=50

Query params:
- status = pending | sent | skipped
- page
- limit

Admin only.

====================================================
2. VIEW NOTIFICATION LOGS
====================================================

GET /api/notifications/logs?page=1&limit=50&userId=9&notificationType=daily_digest

All query params optional.

Supported filters:
- page
- limit
- userId
- notificationType

Admin only.

====================================================
3. MANUALLY TRIGGER DIGEST
====================================================

POST /api/notifications/digest/trigger

Request:
{
  "type": "daily"
}

OR

{
  "type": "weekly"
}

Response:
{
  "success": true,
  "data": {
    "usersProcessed": 12,
    "emailsSent": 9,
    "emailsSkipped": 3,
    "failed": 0
  }
}

====================================================
ROUTING REQUIREMENTS
====================================================

Add a new admin section:

Admin → Notifications

Suggested structure:

/admin/notifications
/admin/notifications/logs
/admin/notifications/queue

OR integrate into existing admin routing conventions.

DO NOT break existing sidebar/navigation architecture.

====================================================
MAIN PAGE LAYOUT
====================================================

The main admin notification page should contain:

1. Header
2. Metrics Cards
3. Digest Queue Section
4. Notification Logs Section
5. Manual Trigger Panel

Use existing admin dashboard styling patterns.

====================================================
1. HEADER
====================================================

Title:
Notification Center

Subtitle:
Monitor digest delivery, notification activity, and email processing.

====================================================
2. METRICS CARDS
====================================================

At the top show lightweight operational metrics.

Examples:
- Pending Digests
- Sent Digests
- Skipped Emails
- Failed Deliveries

IMPORTANT:
Only use data already available from APIs.
DO NOT invent fake analytics endpoints.

If aggregate metrics are unavailable:
derive counts from current page results only.

====================================================
3. DIGEST QUEUE SECTION
====================================================

Create a professional queue management table.

Tabs:
- Pending
- Sent
- Skipped

Each tab should:
- update query params
- fetch corresponding queue state
- preserve pagination

Table columns:
- User ID
- Digest Type
- Scheduled Time
- Status
- Created At

Add:
- loading skeletons
- empty states
- retry-safe fetching
- pagination controls

====================================================
QUEUE UX REQUIREMENTS
====================================================

- URL query param persistence
- smooth tab switching
- avoid unnecessary refetches
- preserve filters during navigation
- mobile responsive table behavior

====================================================
4. NOTIFICATION LOGS SECTION
====================================================

Create an admin logs explorer.

Features:
- paginated table
- searchable/filterable
- responsive
- server-driven filtering

Filters:
- User ID
- Notification Type

Suggested notification types:
- daily_digest
- weekly_digest
- live_class
- etc if returned from API

Table columns:
- User ID
- Notification Type
- Status
- Timestamp

Add:
- loading states
- empty states
- debounced filtering
- reset filters button

====================================================
5. MANUAL DIGEST TRIGGER PANEL
====================================================

IMPORTANT:
This is a sensitive admin action.

Design as:
- isolated card
- warning/danger styling
- confirmation modal required

UI:
Buttons:
- Run Daily Digest
- Run Weekly Digest

====================================================
TRIGGER FLOW
====================================================

When clicked:
1. Open confirmation modal
2. Confirm action
3. Execute API request
4. Show loading state
5. Prevent duplicate submissions
6. Display result summary

====================================================
RESULT SUMMARY UI
====================================================

After successful trigger:

Show metrics summary cards:
- Users Processed
- Emails Sent
- Emails Skipped
- Failed

Example:
Processed: 120
Sent: 98
Skipped: 20
Failed: 2

====================================================
ERROR HANDLING
====================================================

Handle:
- permission errors
- network failures
- empty responses
- server errors
- unauthorized access

Display clean admin-friendly error states.

DO NOT expose raw backend stack traces.

====================================================
ACCESS CONTROL
====================================================

CRITICAL:
- Ensure admin-only route protection
- Reuse existing RBAC/auth middleware
- Prevent non-admin rendering
- Prevent accidental client exposure

DO NOT trust frontend-only protection if backend guards already exist.
Respect existing auth architecture.

====================================================
TECHNICAL REQUIREMENTS
====================================================

- Reuse existing API client
- Reuse existing admin layout
- Reuse existing table components if available
- Reuse existing modal/dialog system
- Reuse existing toast system
- Reuse existing pagination utilities
- Reuse existing query param utilities

DO NOT:
- install unnecessary libraries
- rewrite admin architecture
- duplicate state management
- create parallel auth systems
- introduce breaking routing changes

====================================================
UI/UX REQUIREMENTS
====================================================

Design language:
- modern SaaS admin
- minimal
- operational clarity
- subtle hierarchy
- high readability

Avoid:
- overdesigned cards
- excessive gradients
- flashy dashboards
- AI-generated looking layouts

====================================================
RESPONSIVENESS
====================================================

Support:
- desktop
- tablet
- mobile admin usage

Tables should:
- scroll horizontally when needed
- maintain usability on smaller screens

====================================================
ACCESSIBILITY
====================================================

Support:
- keyboard navigation
- focus states
- aria labels
- screen readers
- sufficient contrast

====================================================
PERFORMANCE
====================================================

Optimize:
- avoid unnecessary rerenders
- debounce filters
- cache query states where appropriate
- prevent duplicate API calls

====================================================
EXPECTED OUTPUT
====================================================

Implement:
- production-ready admin notification center
- digest queue management UI
- notification logs explorer
- manual digest trigger flow
- filtering
- pagination
- loading/error states
- responsive behavior
- clean maintainable code

Preserve:
- existing admin architecture
- current dashboard styling
- routing structure
- live platform stability

The final result should feel like a mature internal operations tool already built into the platform.