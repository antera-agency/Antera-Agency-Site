# CLAUDE.md

# Antera Agency Engineering Rules

This file defines how work should be performed within this repository.

It does **not** describe the implementation of the website itself.

The website specification is documented in:

docs/WEBSITE_TECHNICAL_SPECIFICATION.md

This document defines the engineering philosophy and workflow that must be followed throughout the project.

---

# Core Principle

The objective is not to redesign the website.

The objective is to extend the existing architecture while preserving all existing craftsmanship, branding, performance and maintainability.

When multiple correct solutions exist, always choose the solution that best fits the existing architecture.

---

# Required Reading

Before analysing or implementing anything:

1. Read README.md
2. Read docs/WEBSITE_TECHNICAL_SPECIFICATION.md
3. Inspect the relevant existing code.

Do not assume.

Always investigate first.

---

# Working Method

Always follow this workflow.

## Phase 1

Understand the request.

## Phase 2

Inspect the relevant code.

## Phase 3

Understand the current architecture.

## Phase 4

Identify risks.

## Phase 5

Present:

- architecture overview
- files involved
- implementation strategy
- risks

When requested:

STOP.

Wait for approval before writing code.

Only begin implementation after explicit approval.

---

# Engineering Philosophy

Always prefer:

- extending existing code
- reusing existing components
- reusing existing hooks
- reusing existing utilities
- reusing existing styling

instead of replacing working systems.

If the existing implementation is good:

leave it alone.

---

# Scope Control

Never modify unrelated code.

Never refactor code simply because another solution appears cleaner.

Never redesign existing UI unless explicitly instructed.

If unrelated improvements are discovered:

- document them
- explain them
- do not implement them without approval.

---

# Existing Craftsmanship

Respect the existing work.

Preserve:

- spacing
- typography
- animations
- interaction patterns
- responsive behaviour
- branding
- architecture
- performance

New functionality should feel like it has always belonged to the website.

---

# Design Philosophy

Antera Agency should always feel:

- premium
- cinematic
- minimal
- strategic
- modern
- elegant
- fast
- refined

Avoid:

- generic SaaS UI
- excessive shadows
- heavy gradients
- glassmorphism
- unnecessary visual effects
- inconsistent spacing
- unnecessary animations

---

# Code Quality

Always prefer:

- readable code
- maintainable code
- explicit code
- small focused components
- strong typing
- reusable abstractions

Avoid:

- duplicate logic
- duplicate state
- magic numbers
- hardcoded content
- unnecessary complexity

---

# Architecture Rules

Always work with the existing project architecture.

Do not introduce:

- duplicate systems
- competing implementations
- unnecessary dependencies
- unnecessary libraries

Prefer extending existing architecture.

---

# Sanity

Never overwrite existing content automatically.

Never execute migrations without approval.

Always preserve:

- document IDs
- array keys
- backwards compatibility

Prefer optional fields over breaking schema changes.

---

# Accessibility

All new features should support:

- semantic HTML
- keyboard navigation
- focus states
- ARIA attributes
- reduced motion
- accessible labels

Accessibility is part of the implementation.

Not an optional enhancement.

---

# Performance

Every new feature should minimise:

- JavaScript
- layout shift
- memory usage
- unnecessary renders
- unnecessary observers
- unnecessary network requests

Lazy load third-party resources whenever practical.

---

# Validation

Before considering work complete:

Run:

npx tsc --noEmit

npm run lint

npm run build

Perform runtime verification.

Verify that no existing functionality regresses.

---

# Git Workflow

Unless instructed otherwise:

- work from latest main
- use a dedicated feature branch
- keep commits focused
- avoid unrelated commits
- create one clean patch when requested

---

# Reporting

The final report should include:

- root cause
- implementation summary
- files added
- files modified
- architectural decisions
- validation results
- remaining manual steps
- limitations

Be transparent about anything that could not be verified.

---

# Final Principle

The best implementation is not the one with the most code.

It is the one that integrates so naturally that it feels like it has always been part of the original product.