# NZAT Case Study Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the NZAT case study for recruiters and update the page interaction so sections behave like tabs.

**Architecture:** Keep the existing single-file static HTML page. Update CSS variables to match the homepage palette, convert the left navigation into tab buttons, and add small vanilla JavaScript for tab switching without introducing dependencies.

**Tech Stack:** HTML, CSS, vanilla JavaScript.

---

### Task 1: Content Rewrite

**Files:**
- Modify: `projects/nzat-project.html`

- [ ] Replace generic project copy with a recruiter-facing story: real workflow, user adoption, technical trade-offs, future AI-assisted insurance claims, and Azure migration reflection.
- [ ] Keep claims grounded and mark future AI/Azure work as planned improvements.

### Task 2: Visual And Interaction Updates

**Files:**
- Modify: `projects/nzat-project.html`

- [ ] Align CSS variables with `index.css` primary palette.
- [ ] Add hover/focus treatment for the live demo button.
- [ ] Replace sidebar anchor navigation with tab buttons.
- [ ] Add `.tab-panel` visibility rules so inactive sections are hidden.
- [ ] Add vanilla JavaScript to switch active tabs and update `location.hash`.

### Task 3: Verification

**Files:**
- Verify: `projects/nzat-project.html`

- [ ] Confirm required content phrases exist with `rg`.
- [ ] Confirm tab classes and JavaScript hooks exist with `rg`.
- [ ] Run a lightweight HTML parse using Ruby Nokogiri if available, otherwise use Ruby stdlib text checks.
