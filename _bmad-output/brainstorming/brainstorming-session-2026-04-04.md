---
stepsCompleted: [1, 2, 3]
inputDocuments: []
session_topic: 'Home screen content design for Truvis — information hierarchy, widgets, and UI elements'
session_goals: 'Identify the right mix of information and actionable widgets; make the app feel polished and complete'
selected_approach: 'Progressive Technique Flow'
techniques_used: ['Role Playing', 'Morphological Analysis']
ideas_generated: ['#1-Confidence Tagline', '#2-Primary CTA', '#3-Educational Carousel', '#4-Dual CTA Ready to Inspect', '#5-Dual CTA Still Researching', '#6-Adaptive Home Screen State', '#7-Returning User CTA', '#8-Contextual Carousel', '#9-Vehicle Shortlist Preview', '#10-Hybrid Content Engine', '#11-Model DNA Teasers', '#12r-Severity Comparison Widget', '#13-Needs Attention Highlights', '#14-Journey Progress Indicator', '#15-Your Next Step Smart Prompt', '#16-Quick Decision Helper', '#17-Help Me Decide Smart Summary', '#18-AI-Powered Personal Comparison', '#19-AI Comparison Report Output', '#20-Quick Form UX', '#21-Welcoming Empty State', '#22-Skeleton Progressive Disclosure', '#23r-Severity Summary Animation', '#25-Carousel Card Depth', '#26-Generous Whitespace', '#27-Personalized Greeting', '#28-CTA Breathing Animation', '#29-Cheeky Co-Pilot Greeting System', '#30-Co-Pilot Micro-Copy', '#31-Smart Nudges with Personality', '#32-Dual-Tone Voice System', '#33-Offline-Ready Home Screen', '#35-Graceful Article Fallback', '#37-Severity Beyond Color']
context_file: ''
---

# Brainstorming Session Results

**Facilitator:** Cristian
**Date:** 2026-04-04

## Session Overview

**Topic:** Home screen content design for Truvis — the information hierarchy, widgets, and UI elements that should greet users
**Goals:**
1. Identify the right mix of information and actionable widgets for the Home screen
2. Find ways to make the overall app experience feel finished and polished

### Session Setup

_Progressive Technique Flow selected — we'll start broad with divergent thinking, then systematically narrow focus through increasingly targeted techniques._

## Technique Selection

**Approach:** Progressive Technique Flow
**Journey Design:** Systematic development from exploration to action

**Progressive Techniques:**

- **Phase 1 - Exploration:** Role Playing — generate ideas from multiple user perspectives
- **Phase 2 - Pattern Recognition:** Morphological Analysis — map dimensions and combinations
- **Phase 3 - Development:** SCAMPER Method — refine strongest concepts through seven lenses
- **Phase 4 - Action Planning:** Resource Constraints — pressure-test against real limitations

**Journey Rationale:** Starting with empathy-driven exploration surfaces real user needs, then systematically organizing and refining ensures we end with a practical, prioritized Home screen blueprint.

## Phase 1 & 2: Exploration & Pattern Recognition Results

### Ideas Generated (35 total, 4 cut)

**Cut ideas:** #34 Sync Status Micro-Indicator, #36 Dynamic Text Scaling, #38 Achievement Moments, #39 Seasonal Touches

### Home Screen Blueprint — 6 Visual Zones

**Zone 1: Greeting** — Context-aware co-pilot greeting that adapts to time of day, user state, and journey progress. Cheeky personality, rotating messages. (#1, #27, #29, #32)

**Zone 2: CTA Zone** — Adaptive primary action based on user state. New user: "Add Your First Vehicle." User with vehicles: "Start Inspection" (with specific vehicle name). Breathing pulse animation on ready-to-act state. (#2, #4, #5, #6, #7, #28)

**Zone 3: Vehicle Cards** — Shortlist preview showing vehicles with severity data (green/yellow/red with shapes for accessibility), animated severity bars on load, journey progress indicator per vehicle. Empty state for new users shows illustrated welcome with skeleton previews. (#9, #12r, #14, #23r, #21, #22, #37)

**Zone 4: Co-Pilot Nudge** — One contextual smart prompt with cheeky personality suggesting the most important next action. Surfaces critical "Needs Attention" findings when relevant. (#13, #15, #30, #31)

**Zone 5: Help Me Decide Card** — Conditional section (2+ inspected vehicles). Smart summary comparing severity breakdowns, CTA to launch AI-powered quick form questionnaire for personalized comparison and shareable report. (#16, #17, #18, #19, #20)

**Zone 6: Buyer's Cheat Sheet Carousel** — Horizontally scrollable articles mixing pre-inspection guides with model-specific content from user's vehicle list. Model DNA teasers surface existing intelligence. Tactile card interactions (shadow, parallax, press-in). Cached for offline. (#3, #8, #10, #11, #25, #35)

**Cross-Cutting Concerns:**
- Dual-tone voice: cheeky for navigation/engagement, factual for severity data (#32)
- Generous whitespace strategy throughout (#26)
- Full offline support via PowerSync caching (#33)
- Co-pilot micro-copy in all labels and empty states (#30)

### Brand Voice Decision

**Personality:** Cheeky co-pilot — personality-driven, memorable, like a friend who knows cars
**Rule:** Cheeky for engagement (greetings, nudges, labels, empty states). Straight and factual for severity findings, repair costs, and comparison data.

## Phase 3: SCAMPER Refinement Results

**Zone 1 — Greeting:** Context-enriched greeting that embeds micro-status updates alongside co-pilot personality. Reads vehicle/inspection counts from existing stores, selects from template pool per journey stage. Low implementation complexity. (#45)

**Zone 2 — CTA:** Refined to three-state adaptive CTA — Empty ("Add Your First Vehicle"), Researching ("Continue Researching"), Ready ("Start Inspection — BMW 320d"). (#40)

**Zone 3 — Vehicle Cards:** Minimal status beacon design. Each card shows exactly: vehicle name, journey stage, severity dots (inspected only). Max 3 visible, horizontally scrollable. ~80pt height. Confirmed as essential by UX review — anchors Zones 2 and 4 with context. (#41)

**Zone 4 — Co-Pilot Nudge:** Kept separate from CTA (Option B). Smart visibility rules — nudge only appears when it has unique value beyond the CTA. Hides when it would echo the CTA to avoid redundancy. (#42)

**Zone 5 — Help Me Decide:** Three progressive states — hidden (0 inspected), blurred teaser (1 inspected), full feature (2+ inspected). Blurred preview creates anticipation without frustrating new users. (#43)

**Zone 6 — Carousel:** Single mixed carousel with algorithm-driven smart ordering. No labels or dividers — content types (general, model-specific, Model DNA teasers) shuffled by relevance to user's current state. (#44)

## Phase 4: Action Planning — Resource Constraints

### Screen Real Estate Budget (~620pt total — fits comfortably)

| Zone | Height | Conditional |
|------|--------|-------------|
| 1. Greeting | ~60pt | No |
| 2. CTA | ~80pt | No |
| 3. Vehicle Cards | ~100pt | Empty state for new users |
| 4. Co-Pilot Nudge | ~60pt | Yes — hides when redundant with CTA |
| 5. Help Me Decide | ~120pt | Yes — hidden (0 inspected), blurred (1), full (2+) |
| 6. Carousel | ~200pt | No |

### Data Dependencies

**Available now:** Vehicle count, inspection data, severity findings, journey stage, Model DNA, timestamps, system clock
**Gaps:**
- **Articles content** — carousel needs actual articles to be sourced/created (content effort)
- **AI questionnaire backend** — Help Me Decide AI comparison needs edge function + LLM call (new service)
- **"Last viewed" field** — may be needed for time-based nudge prompts

### Implementation Tiers (Separate Epic)

**Tier 1 — MVP Home Screen** (solves the "unfinished" feeling)
- Zone 1: Greeting (simple template, store reads)
- Zone 2: CTA (three-state adaptive logic)
- Zone 3: Vehicle Cards (minimal status beacons)
- Zone 6: Carousel (structure with placeholder/static content)
- Empty state design (illustrated welcome + skeleton previews)
- Tab navigation update (add Home tab)

**Tier 2 — Smart Layer** (adds intelligence)
- Zone 4: Co-Pilot Nudge with visibility rules
- Zone 3: Severity animation on load
- Zone 5: Help Me Decide smart summary (data comparison, no AI)
- Zone 5: Blurred teaser state (1 inspected vehicle)
- Zone 6: Model DNA teasers integration
- Zone 1: Context-enriched greeting (#45)

**Tier 3 — Premium Features** (differentiators)
- Zone 5: AI-powered questionnaire + personalized shareable report
- Zone 6: Full article content pipeline (sourcing, curation, model-specific)
- Zone 2: CTA breathing animation polish
- Zone 4: Smart nudge time-based prompts
- Co-pilot micro-copy across all labels and empty states
- Offline resilience hardening

### Key Decisions Log

- Home screen is a **separate epic** (not part of current sprint)
- Severity system is **green/yellow/red** (not numeric scores) — all comparison and display ideas use severity colors + shapes
- Brand voice: **cheeky co-pilot** for engagement, **factual** for data
- Vehicle cards kept on Home (confirmed by UX review) as **status beacons**, not Vehicles tab duplicates
- CTA and Nudge kept **separate** with smart visibility rules (Option B)
- Carousel uses **single mixed feed** with smart ordering (Option A)
- Help Me Decide AI comparison uses **quick structured form**, not chat-style
- Tiers 1→2→3 progression confirmed
