# EVENTS LANDING PAGE IMPLEMENTATION RULES (STRICT)

You are implementing a NEW Events Landing Page inside an EXISTING production SaaS application.

Your primary objective is:

1. Achieve pixel-perfect implementation of the provided Figma design.
2. Preserve existing application architecture.
3. Reuse existing components whenever possible.
4. Maintain enterprise-grade code quality.
5. Avoid introducing technical debt.

---

## CRITICAL RULES

### RULE 1: DO NOT BREAK EXISTING FUNCTIONALITY

This application is already live in production.

You MUST:

* Never modify unrelated pages.
* Never refactor existing features unless absolutely required.
* Never rename existing shared APIs.
* Never introduce breaking changes.
* Keep the implementation isolated to the Events Landing Page feature.

---

### RULE 2: FOLLOW EXISTING PROJECT ARCHITECTURE

Before creating any code:

* Analyze the existing folder structure.
* Analyze existing patterns.
* Analyze existing component organization.
* Analyze design system implementation.
* Analyze naming conventions.

Match the project's architecture exactly.

Do NOT introduce a new architecture.

---

### RULE 3: REUSE BEFORE CREATING

Before creating any component:

Search for existing:

* Button
* Card
* Badge
* Input
* Select
* Dialog
* Modal
* Sheet
* Tabs
* Accordion
* Section wrappers
* Typography components
* Hero components
* CTA components

If a matching component exists:

USE IT.

Only create a new component when no reusable component exists.

---

### RULE 4: STRICT DRY PRINCIPLE

Avoid duplication.

If the same UI pattern appears more than once:

* Extract it.
* Reuse it.
* Make it configurable.

Never copy-paste component implementations.

---

### RULE 5: SINGLE RESPONSIBILITY PRINCIPLE (SRP)

Every component should have one responsibility.

Examples:

GOOD:

* EventCard
* EventHero
* EventSchedule
* EventSpeakerCard
* EventCTA

BAD:

* MegaComponent.tsx containing everything

Keep components focused and maintainable.

---

### RULE 6: MODULAR ARCHITECTURE

Organize feature code into:

components/event

and render in app/dashboard/events

Each section should be independently maintainable.

---

### RULE 7: PIXEL-PERFECT FIGMA IMPLEMENTATION

The Figma design is the source of truth.

Match exactly:

* Layout
* Spacing
* Typography
* Colors
* Border radius
* Shadows
* Icon sizes
* Section spacing
* Alignment
* Responsive behavior

Do not "improve" the design.

Implement it faithfully.

---

### RULE 8: EXTRACT DESIGN TOKENS

Identify and extract:

* Color tokens
* Typography scale
* Spacing scale
* Border radius
* Shadows
* Gradients

Use existing design tokens whenever available.

Only create new tokens when necessary.

Never hardcode values repeatedly.

---

### RULE 9: RESPONSIVE-FIRST IMPLEMENTATION

The landing page must work perfectly on:

* Mobile
* Tablet
* Laptop
* Desktop
* Ultra-wide screens

Validate:

* Layout flow
* Text wrapping
* Image scaling
* CTA visibility
* Section spacing

No horizontal scrolling.

---

### RULE 10: PERFORMANCE OPTIMIZATION

Implement production-grade performance.

Requirements:

* Use Server Components by default.
* Use Client Components only when required.
* Lazy load heavy sections.
* Lazy load media when appropriate.
* Optimize image rendering.
* Avoid unnecessary re-renders.
* Avoid unnecessary state.
* Avoid unnecessary effects.

Performance is a requirement, not an enhancement.

---

### RULE 11: ACCESSIBILITY

Maintain accessibility standards.

Requirements:

* Semantic HTML
* Proper heading hierarchy
* Keyboard navigation
* Accessible buttons
* Accessible links
* Image alt text
* Proper focus states

Do not sacrifice accessibility for visuals.

---

### RULE 12: CLEAN TYPESCRIPT

Requirements:

* Strict typing
* No any
* Reusable interfaces
* Shared types where appropriate

Avoid type duplication.

---

### RULE 13: MAINTAIN DESIGN CONSISTENCY

The Events Landing Page must feel like part of the existing product.

Reuse:

* Existing typography system
* Existing color system
* Existing spacing conventions
* Existing interaction patterns
* Existing animation patterns

Do not create a visually disconnected experience.

---

### RULE 14: IMPLEMENT SECTION-BY-SECTION

Build in this order:

1. Hero Section
2. Event Highlights
3. Featured Events
4. Event Schedule
5. Speakers/Hosts
6. Testimonials
7. FAQ
8. CTA
9. Footer Integration

Complete and validate each section before moving to the next.

---

### RULE 15: CODE REVIEW CHECKLIST

Before generating final code verify:

✓ Pixel-perfect to Figma

✓ Reused existing components

✓ No duplicated logic

✓ DRY compliance

✓ SRP compliance

✓ Responsive implementation

✓ Accessibility compliance

✓ Existing architecture respected

✓ No breaking changes

✓ Design tokens extracted

✓ Performance optimized

✓ Type-safe implementation

---

## OUTPUT REQUIREMENTS

For every implementation step:

1. Explain which existing components were reused.
2. Explain which new components were created and why.
3. Explain any new design tokens introduced.
4. Explain architecture decisions.
5. Generate production-ready code only.
6. Never generate placeholder implementations.
7. Never bypass project conventions.

The Figma design is the visual source of truth.
The existing application architecture is the engineering source of truth.

Both must be respected equally.
