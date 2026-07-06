# Implementation Plan: Dynamic Community Pages

## Overview

Replace the modal-based community detail view with dedicated dynamic routes at `/dashboard/community/[id]`. This involves creating a data utility, a new dynamic route page, a client wrapper component, and refactoring existing components to be prop-driven and navigation-aware.

## Tasks

- [x] 1. Create community data utility functions
  - Create `src/lib/community.ts` with `getCommunityById` and `isValidCommunityTab` exports
  - `getCommunityById(id: string): Community | undefined` — pure lookup against `MOCK_COMMUNITIES`
  - `isValidCommunityTab(tab: string): tab is CommunityTab` — validates against the five valid tab values
  - Add `resolveTab(param: string | undefined): CommunityTab` — returns `'announcements'` for undefined/invalid, otherwise the valid tab
  - _Requirements: 1.1, 4.1, 5.2, 5.3_

  - [ ]* 1.1 Write property tests for `getCommunityById`
    - **Property 1: Route resolves community by ID**
    - **Validates: Requirements 1.1, 1.2, 4.1, 4.4**

  - [ ]* 1.2 Write property tests for `resolveTab`
    - **Property 4: Tab param drives initial active tab**
    - **Property 5: Invalid tab param falls back to announcements**
    - **Validates: Requirements 5.2, 5.3**

- [x] 2. Refactor `CommunityDetail` to accept a `community` prop
  - Change `CommunityDetail` signature to accept `community: Community`, `activeTab: CommunityTab`, `onTabChange`, `onBack`, and `onShare` props
  - Remove all direct reads of `selectedCommunity` and `activeTab` from the store; keep only mutation actions (`joinCommunity`, `acceptRequest`, `declineRequest`)
  - Move `membersSubTab` local state into the component (it stays local)
  - Wire `onBack` to the back arrow button and `onShare` to a new share icon button in the header
  - Add share button to the header row (clipboard icon); on click call `onShare`
  - _Requirements: 3.1, 4.4, 6.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ]* 2.1 Write property tests for `CommunityDetail` role-based rendering
    - **Property 7: Hero CTA reflects user role**
    - **Property 8: Tab content access matches role**
    - **Property 9: Members tab visibility matches admin role**
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5, 7.6, 7.7**

- [x] 3. Update `CommunityCard` prop name and `CommunityLanding` navigation
  - In `CommunityCard.tsx`: rename `onJoin` prop to `onNavigate` in the interface and JSX
  - In `CommunityLanding.tsx`: replace `selectCommunity` with `useRouter` and call `router.push('/dashboard/community/' + c.id)` when a card is clicked
  - Remove the `selectCommunity` import from `CommunityLanding`
  - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 3.1 Write property test for card click navigation
    - **Property 2: Card click navigates to correct route**
    - **Validates: Requirements 2.1**

- [x] 4. Simplify `CommunityPage` to render only the landing view
  - Remove the `selectedCommunity ? <CommunityDetail /> : <CommunityLanding />` conditional
  - Render only `<CommunityLanding />` and `<CreateCommunityModal />`
  - Remove unused `selectedCommunity` store read and `CommunityDetail` import
  - _Requirements: 2.2_

- [x] 5. Create the dynamic route page and client wrapper
  - Create directory `src/app/dashboard/community/[id]/`
  - Create `src/app/dashboard/community/[id]/page.tsx` as a Server Component
    - Read `params.id` and `searchParams.tab`
    - Call `getCommunityById(id)` and `resolveTab(searchParams.tab)`
    - If community not found, render inline "Community not found" message with a link to `/dashboard/community`
    - Otherwise render `<CommunityDetailPageClient community={community} initialTab={resolvedTab} />`
  - Create `src/app/dashboard/community/[id]/CommunityDetailPageClient.tsx` as a Client Component
    - Accept `community: Community` and `initialTab: CommunityTab` props
    - Own `activeTab` state (initialised from `initialTab`)
    - On tab change call `router.replace` with `?tab=<tab>` to update URL without polluting history
    - Implement `handleBack` → `router.push('/dashboard/community')`
    - Implement `handleShare` → `navigator.clipboard.writeText(window.location.href)`, then show a brief "Copied!" confirmation state
    - Read community from store by ID (falling back to prop) so mutations are reactive
    - Render `<CommunityDetail community={...} activeTab={...} onTabChange={...} onBack={...} onShare={...} />`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 3.1, 3.2, 4.1, 4.2, 4.4, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3_

  - [ ]* 5.1 Write property test for back navigation
    - **Property 3: Back button navigates to landing**
    - **Validates: Requirements 3.1, 3.2**

  - [ ]* 5.2 Write property test for share action
    - **Property 6: Share action copies full absolute URL to clipboard**
    - **Validates: Requirements 6.1, 6.3**

- [x] 6. Update store mutations to operate on `MOCK_COMMUNITIES` directly
  - Extend `joinCommunity`, `acceptRequest`, and `declineRequest` in `communityStore.ts` to also mutate the corresponding entry in a local mutable copy of `MOCK_COMMUNITIES` (or a store-held communities map), so that `getCommunityById` returns updated role/member data after mutations
  - This ensures the detail page client component reads fresh data when falling back to the store lookup
  - _Requirements: 8.1, 8.2, 8.4, 8.5_

  - [ ]* 6.1 Write property tests for store mutations
    - **Property 10: Join request updates role to member**
    - **Property 11: Accept request moves member from joinRequests to members**
    - **Property 12: Decline request removes from joinRequests only**
    - **Validates: Requirements 8.1, 8.4, 8.5**

  - [ ]* 6.2 Write property test for pending requests indicator
    - **Property 13: Pending requests indicator matches joinRequests length**
    - **Validates: Requirements 8.6**

- [x] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with a minimum of 100 iterations per property
- Each property test must include a comment: `// Feature: dynamic-community-pages, Property N: <property_text>`
- The store mutation update in task 6 is needed for reactivity; without it the detail page client would show stale role data after a join
