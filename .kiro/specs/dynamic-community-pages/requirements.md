# Requirements Document

## Introduction

This feature replaces the current modal-based community detail view with dedicated dynamic routes (`/dashboard/community/[id]`). Each community gets its own URL, making communities shareable via links. The existing `CommunityLanding` page remains at `/dashboard/community`, and clicking a community card navigates to its dedicated page instead of opening a modal overlay.

## Glossary

- **Community_Page**: The Next.js page rendered at `/dashboard/community/[id]` that displays a single community's full detail view.
- **Community_Landing**: The existing page at `/dashboard/community` that lists all communities.
- **CommunityDetail**: The component that renders the full detail view of a single community (hero, tabs, content).
- **Community_Card**: The card component on the Community_Landing that represents a single community in the grid.
- **Community_Store**: The Zustand store (`communityStore`) that manages community selection and UI state.
- **Router**: The Next.js App Router responsible for navigation between routes.
- **Share_Link**: A URL of the form `/dashboard/community/[id]` that directly opens a specific community's detail page.
- **Community_ID**: The unique string identifier (`id` field) on a `Community` object used to construct the route.
- **Role**: The current user's membership level for a community — one of `guest`, `member`, or `admin`.
- **LockedOverlay**: The UI element displayed over tab content that is inaccessible to guests.
- **Join_Request**: A pending request from a guest user to become a member of a community.

---

## Requirements

### Requirement 1: Dynamic Community Route

**User Story:** As a user, I want each community to have its own URL, so that I can share a direct link to a specific community with others.

#### Acceptance Criteria

1. THE Router SHALL resolve the path `/dashboard/community/[id]` to a dedicated Community_Page for the community with the matching Community_ID.
2. WHEN a user navigates directly to `/dashboard/community/[id]`, THE Community_Page SHALL render the CommunityDetail view for the corresponding community without requiring prior navigation through the Community_Landing.
3. IF the Community_ID in the URL does not match any known community, THEN THE Community_Page SHALL display a "Community not found" message and provide a link back to the Community_Landing.
4. THE Community_Page SHALL be accessible via a Share_Link that can be copied and opened in a new browser tab or shared externally.

---

### Requirement 2: Navigation from Community Landing

**User Story:** As a user, I want clicking a community card to navigate to the community's dedicated page, so that the URL updates and I can bookmark or share it.

#### Acceptance Criteria

1. WHEN a user clicks a Community_Card on the Community_Landing, THE Router SHALL navigate to `/dashboard/community/[id]` for the selected community.
2. THE Community_Landing SHALL NOT open a modal overlay when a Community_Card is clicked.
3. WHEN navigation to a Community_Page occurs, THE Router SHALL update the browser URL to reflect the community's Share_Link.

---

### Requirement 3: Back Navigation

**User Story:** As a user, I want a back button on the community detail page, so that I can return to the community listing.

#### Acceptance Criteria

1. WHEN a user is on a Community_Page, THE CommunityDetail SHALL display a back navigation control.
2. WHEN a user activates the back navigation control, THE Router SHALL navigate to `/dashboard/community`.
3. WHEN a user navigates back via the browser's native back button, THE Router SHALL return to the previous route in the browser history stack.

---

### Requirement 4: Community Data Loading

**User Story:** As a developer, I want the community detail page to load community data by ID, so that the page renders correctly when accessed directly via a Share_Link.

#### Acceptance Criteria

1. WHEN the Community_Page renders, THE Community_Page SHALL resolve community data using the Community_ID from the URL parameter.
2. WHILE community data is being resolved, THE Community_Page SHALL display a loading state to the user.
3. IF community data cannot be resolved for the given Community_ID, THEN THE Community_Page SHALL render a not-found state rather than a blank or broken layout.
4. THE Community_Page SHALL resolve community data independently of the Community_Store's `selectedCommunity` state, so that direct URL access does not depend on prior store hydration.
5. WHEN community data is resolved for a given Community_ID, THE Community_Page SHALL also resolve the current user's Role for that community so that access control and tab visibility are correct on initial render.

---

### Requirement 5: URL-Driven Tab State

**User Story:** As a user, I want the active tab on a community page to be optionally reflected in the URL, so that I can share a link to a specific tab within a community.

#### Acceptance Criteria

1. WHEN a user navigates to `/dashboard/community/[id]`, THE Community_Page SHALL default to displaying the `announcements` tab.
2. WHERE a `tab` query parameter is present in the URL (e.g., `/dashboard/community/[id]?tab=resources`), THE Community_Page SHALL activate the tab matching the `tab` parameter value on initial render.
3. IF the `tab` query parameter value does not match a valid CommunityTab, THEN THE Community_Page SHALL fall back to the `announcements` tab.

---

### Requirement 6: Share Link Copy Action

**User Story:** As a user, I want a way to copy the share link for a community, so that I can easily distribute it to others.

#### Acceptance Criteria

1. THE CommunityDetail SHALL provide a share action that copies the community's Share_Link to the user's clipboard.
2. WHEN the share action is activated, THE CommunityDetail SHALL display a confirmation to the user indicating the link was copied.
3. THE Share_Link copied to the clipboard SHALL be the full absolute URL of the Community_Page (e.g., `https://[domain]/dashboard/community/[id]`).

---

### Requirement 7: Access Control

**User Story:** As a user, I want my access to community content to reflect my membership role, so that restricted content is protected and I know how to request access.

#### Acceptance Criteria

1. THE Community_Page SHALL resolve the current user's Role (`guest`, `member`, or `admin`) for the community when loading community data.
2. WHILE the current user's Role is `guest`, THE CommunityDetail SHALL display a "Request to join" button in the community hero section.
3. WHILE the current user's Role is `member` or `admin`, THE CommunityDetail SHALL display a membership status indicator in place of the "Request to join" button.
4. WHILE the current user's Role is `guest`, THE CommunityDetail SHALL display a LockedOverlay in place of content for the `announcements`, `live-classes`, `live-series`, and `resources` tabs.
5. WHILE the current user's Role is `member` or `admin`, THE CommunityDetail SHALL render the full content for the `announcements`, `live-classes`, `live-series`, and `resources` tabs without a LockedOverlay.
6. WHILE the current user's Role is `admin`, THE CommunityDetail SHALL display a `Members` tab containing sub-tabs for the members list and pending join requests.
7. WHILE the current user's Role is `guest` or `member`, THE CommunityDetail SHALL NOT display the `Members` tab.

---

### Requirement 8: Join Request Management

**User Story:** As a guest, I want to request to join a community, and as an admin, I want to review and act on those requests, so that community membership is managed in an orderly way.

#### Acceptance Criteria

1. WHEN a guest activates the "Request to join" button, THE Community_Store SHALL update the current user's Role for that community to `member`.
2. WHEN a guest activates the "Request to join" button, THE CommunityDetail SHALL reflect the updated Role immediately without requiring a page reload.
3. WHILE the current user's Role is `admin`, THE CommunityDetail SHALL display all pending Join_Requests under the `Requests` sub-tab of the `Members` tab.
4. WHEN an admin accepts a Join_Request, THE Community_Store SHALL move the corresponding user from `joinRequests` to `members` for that community.
5. WHEN an admin declines a Join_Request, THE Community_Store SHALL remove the corresponding user from `joinRequests` for that community without adding them to `members`.
6. WHEN the `joinRequests` list is non-empty, THE CommunityDetail SHALL display a visual indicator on the `Requests` sub-tab to signal pending requests to the admin.
7. IF there are no pending Join_Requests, THEN THE CommunityDetail SHALL display an empty state message in the `Requests` sub-tab.
