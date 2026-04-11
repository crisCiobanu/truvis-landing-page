---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-01b-continue
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
classification:
  projectType: mobile_app
  domain: automotive_consumer_marketplace
  complexity: medium
  projectContext: greenfield
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-car-buy-assistant-2026-02-18.md
  - _bmad-output/planning-artifacts/research/market-car-inspection-companion-app-research-2026-02-18.md
  - _bmad-output/planning-artifacts/research/technical-cross-platform-mobile-framework-research-2026-02-18.md
  - _bmad-output/brainstorming/brainstorming-session-2026-02-17.md
workflowType: 'prd'
documentCounts:
  briefs: 1
  research: 2
  brainstorming: 1
  projectDocs: 0
---

# Product Requirements Document - car-buy-assistant

**Author:** Cristian
**Date:** 2026-02-18

## Executive Summary

Buying a used car is one of the highest-stakes consumer decisions most people make — yet buyers make it without expertise, without a trusted guide, and under the influence of their own excitement working against them. The result: undiscovered faults, overpayment, and post-purchase regret. Buyers pay an average of $640 in hidden fees per transaction. The only alternative — a professional pre-purchase inspection — costs $100–300, requires scheduling days in advance, and isn't available at 8pm on a Sunday when you find the car you want.

car-buy-assistant is a mobile companion app that acts as the buyer's personal car expert at the exact moment it matters most — standing at the car, in front of the seller. It guides buyers through a structured physical inspection with model-specific intelligence (known weak points for this exact make/model/year), rates every finding with severity calibrated to the buyer's personal repair budget, protects them from emotional override through behavioral guardrails, and generates a structured negotiation report that converts findings into financial leverage. It replaces a $100–300 professional inspection with an instant, personalized, always-available companion that fits in the buyer's pocket.

The used car mobile apps market is valued at ~$9.27B (2026) with 9.3% CAGR. Only 2% of buyers trust dealerships. Every AI-powered inspection tool on the market is B2B. No consumer-facing app guides a private buyer through a live physical inspection. The white space is wide open. Revenue flows from day one via VIN affiliate commissions, with a freemium Pro tier and on-demand expert session fees as the model matures.

Target users are private used car buyers who have already found a car and scheduled a visit — from first-timers with no mechanical knowledge who are about to stand in a stranger's driveway (Marco) to experienced buyers burned by past purchases who distrust their own judgment (Elena). Secondary users include trusted contacts (Personal Roberto) who join inspections remotely via camera stream.

### What Makes This Special

The app's core identity is 70% Inspector / 30% Ally. The buyer is standing in a stranger's driveway. The seller is watching. Their heart says yes, their gut says maybe. The app is the only voice in the room that's unequivocally on their side.

Six capabilities have zero market equivalents — ordered as the buyer experiences them:

1. **Severity Calibrator** — The engine everything else builds on. Every finding rated green/yellow/red with plain-language explanation and repair cost estimate. Not a checklist — a verdict machine
2. **Model DNA Briefing** — Before the buyer arrives: pre-inspection intelligence on known failure patterns for the specific make/model/year. Turns a generic inspector into someone who already knows what to look for on *this* car
3. **Personal Risk Calibration** — Severity ratings recalculated against the buyer's repair budget. Same car, different verdict for different buyers — because that's the truth
4. **Poker Face Mode** — Dual-view UX showing the seller a neutral checklist while the buyer's private screen shows real-time severity alerts and coaching. Addresses the social power dynamic no other tool acknowledges
5. **Hard Stop Protocol** — Auto-triggered stop screen with rationale, cost estimates, and a pre-written exit script when critical thresholds are crossed. Externalizes rational decision-making at the moment emotion is highest
6. **Negotiation Report** — Structured findings output with documented issues, estimated costs, and a suggested counter-offer. The buyer's financial leverage, generated automatically from inspection data

The core insight: the buyer's biggest enemy isn't the seller — it's their own desire to say yes despite the evidence. Every feature worth building is a system for protecting rational decision-making when emotion is strongest.

## Project Classification

| Dimension | Value |
|---|---|
| **Project Type** | Mobile App — cross-platform (iOS + Android), React Native + Expo |
| **Domain** | Automotive / Consumer Marketplace |
| **Complexity** | Medium — camera-intensive, offline-first, eventual marketplace dynamics; no heavy regulatory compliance |
| **Project Context** | Greenfield — new product, no existing codebase |
| **Tech Stack** | React Native + Expo + Supabase + PowerSync + VisionCamera + WebRTC |

## Success Criteria

### User Success

Three distinct outcomes define user success — each produces a concrete artifact and represents a moment where the app delivered value the buyer couldn't get alone:

1. **The Walk-Away** — The app surfaces a critical issue the buyer would have missed. Hard Stop Protocol triggers. The buyer exits cleanly with a prepared script, no second-guessing, no guilt spiral. They avoided a costly mistake they couldn't have seen coming. **Artifact:** Hard Stop report with documented critical findings.

2. **The Negotiation Win** — The inspection finds moderate issues on an otherwise acceptable car. The app generates a structured findings report with repair cost estimates and a suggested counter-offer. The buyer presents it. The seller accepts a reduction. The app saved the buyer more than it cost. **Artifact:** Negotiation Report exported or shared.

3. **The Confident Buy** — The inspection finds the car clean or with only minor cosmetic issues. The buyer explicitly marks the inspection as "passed" and the app generates a **Clean Inspection Summary** — a shareable document stating what was checked, what was found, and the overall verdict. The decision was informed, not hopeful. **Artifact:** Clean Inspection Summary generated.

**Emotional success markers:**
- The buyer never feels alone during the inspection — the app (and optionally a remote expert) is unequivocally on their side
- The buyer feels competent, not overwhelmed — plain-language guidance makes them effective regardless of mechanical knowledge
- The decision feels *theirs* — made with real information, not gut feeling or seller pressure

### Business Success

#### Phase 1 — Validate the Concept (0–6 months post-launch)

| Objective | Target | Signal |
|---|---|---|
| Inspections completed | 100 inspections | Core concept works — real people use it for real inspections |
| Active user growth | Positive week-over-week trend | Adoption is building organically |
| Value delivery rate | >50% of inspections result in walk-away, negotiation, or confident buy | Inspection drives real decisions, not just opened and abandoned |
| Expert session usage | >10% of inspections include a Personal Roberto | Social validation feature has traction |
| Roberto outcome impact | Measurable difference in walk-away/negotiation rate for Roberto-assisted vs. solo inspections | Social layer is a real differentiator, not just a feature |
| VIN affiliate click-through | >40% of completed inspections | Buyers trust the app enough to act on its prompts |
| Affiliate conversion | >50% of click-throughs convert to report purchase | Integration is well-placed in the inspection flow |
| Revenue per inspection | $2–5 average affiliate revenue per completed inspection | Revenue mechanism scales — at 10K inspections/month, this is $20K–$50K/month |
| Soft paywall signal | >25% of users attempt a Pro-gated feature | Willingness-to-pay exists for Phase 2 |
| Inspection-to-share rate | >20% of completed inspections shared with another person | Every share is a distribution event and network effect seed |
| User-contributed data rate | Track % of users who submit findings back to the platform | Seeds the crowd-sourced Model DNA database — the long-term data moat |
| Referral rate | >30% of users share the app or an inspection report with someone else | Organic growth engine for a single-purchase-cycle product |

**The stop signal:** No growth in active users over any 4-week period. If adoption is flat and not recovering, the core hypothesis needs revisiting — not optimizing.

**The acceleration trigger:** If inspection completion >75% AND week-over-week growth >10% for 4 consecutive weeks → double down on acquisition spend. The concept is validated and the funnel is healthy — invest in distribution.

#### Phase 2 — Build the Network (6–18 months)

| Objective | Target |
|---|---|
| Monthly active inspections | 1,000+ |
| Pro subscription conversion | >15% of active users on paid tier |
| Expert sessions | Growing month-over-month |
| Affiliate revenue | Covers operational costs |
| Crowd-sourced model data | Growing contributions per month — Model DNA database expanding beyond curated top 50 |

### Technical Success

| Metric | Target | Rationale |
|---|---|---|
| Cold start time | <2 seconds | Hermes AOT + lazy loading — buyers open the app at the car, speed matters |
| Camera launch time | <500ms | VisionCamera native initialization — no delay when entering scan mode |
| Offline inspection | 100% functional | All inspection features work without network — garages, rural areas, basements |
| Sync latency (online) | <5 seconds | PowerSync real-time sync — findings appear on shared sessions promptly |
| Photo upload success rate | >99% | Upload queue with retry logic — no lost evidence |
| Crash-free rate | >99.5% | Sentry monitoring — the app cannot fail during a live inspection |
| Cross-platform code sharing | >85% | React Native + Expo — single codebase for iOS and Android |
| MVP build-to-store | <14 weeks (solo developer) | Full feature set on both platforms |

> Detailed technical requirements and measurement criteria are specified in the Non-Functional Requirements section.

### Measurable Outcomes

**Key Performance Indicators — User Success:**

| KPI | What It Measures | Target |
|---|---|---|
| Inspection completion rate | % of started inspections fully completed | >60% |
| Walk-away rate | % of inspections ending with "do not buy" outcome | Track (no target — higher isn't better, accuracy is) |
| Negotiation report generation rate | % of completed inspections where a Negotiation Report is exported/used | >30% |
| Clean Inspection Summary rate | % of completed inspections resulting in a "passed" verdict with summary generated | Track as baseline |
| Roberto outcome delta | Difference in value-delivery rate (walk-away + negotiation + confident buy) between Roberto-assisted and solo inspections | Positive delta confirms social layer's real impact |
| Referral rate | % of users who share the app or an inspection report with another person | >30% |
| Expert session satisfaction | % of expert sessions rated positively by buyer | >80% |

**Key Performance Indicators — Business:**

| KPI | What It Measures |
|---|---|
| Total inspections completed | Primary growth health signal |
| Week-over-week active users | Adoption trajectory — stop signal if flat 4 consecutive weeks |
| Revenue per inspection | Scalable revenue signal — average affiliate revenue per completed inspection |
| VIN affiliate click-through rate | Revenue efficiency per inspection |
| Soft paywall Pro feature attempt rate | Demand signal for Phase 2 monetization |
| Inspection-to-share rate | Distribution and network effect signal |
| User-contributed data rate | Data moat signal — crowd-sourced model intelligence growing |

**Health Signals and Stop Conditions:**

| Signal Type | Metric | Threshold | Action |
|---|---|---|---|
| Leading warning | Inspection completion rate | <60% | UX or guidance is breaking — investigate before adoption flatlines |
| Growth health | Week-over-week active users | Flat for 4 consecutive weeks | Core concept needs revisiting, not optimizing |
| Value delivery | Walk-away + negotiation + confident buy rate | <50% of completed inspections | Severity calibration or guidance quality issue |
| Monetization health | Freemium → Pro conversion | <10% after 3 months (Phase 2) | Pro value proposition unclear or paywall placed incorrectly |
| **Acceleration trigger** | Completion >75% AND growth >10% w/w | 4 consecutive weeks | Double down on acquisition spend — concept validated, funnel healthy |

### Defensibility Metrics

Tracked from Phase 1 to measure long-term moat building:

| Metric | What It Proves | Why It Matters |
|---|---|---|
| User-contributed data rate | Users feed findings back to the platform | Builds crowd-sourced Model DNA database — a data asset competitors can't replicate overnight |
| Roberto outcome delta | Social layer changes real purchase decisions | Validates the trust network as a genuine differentiator, not just a feature checkbox |
| Inspection-to-share rate | Completed inspections become distribution events | Each share seeds network effects and organic acquisition — the growth loop that compounds |

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience MVP — the minimum isn't a single feature, it's a cohesive inspection experience. The features are tightly coupled; individually they are incomplete. The product must deliver one end-to-end inspection flow that feels complete, from Model DNA briefing through findings to report output.

**Resource Requirements:** Solo developer (Cristian), target <14 weeks from build to app store submission. React Native + Expo + Supabase + PowerSync stack chosen specifically for solo-developer velocity.

**Contingency scope:** Personal Roberto (WebRTC camera stream + browser viewer) is the only MVP feature that can be deferred to v1.1 without breaking the core value proposition. If week 8 arrives and Roberto implementation threatens the timeline, ship without it. The core inspection experience stands alone. Roberto is self-contained — no other feature depends on it.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Marco (First Inspection) — fully supported
- Elena (Hard Stop) — fully supported
- Sara (Clean Car) — fully supported
- Diego/Roberto (Remote Expert) — supported if Roberto ships; gracefully absent if deferred to v1.1
- Admin/Ops — Supabase dashboard, no custom UI

**Must-Have Capabilities (ship or no launch):**

| # | Capability | Free/Pro | Rationale |
|---|---|---|---|
| 1 | Severity Calibrator | Free | The engine — everything builds on this |
| 2 | Model DNA Briefing | Free | The "knows YOUR car" hook — core differentiation |
| 3 | Model DNA Coverage Confidence | Free | Every briefing shows data completeness ("12 known issues from recalls and forums" vs. "limited data" vs. "no model-specific data"). Protects against false confidence, builds trust, replaces binary data/no-data with an honest spectrum |
| 4 | Personal Risk Calibration | Free | Personalized verdicts — safety feature |
| 5 | Structural Scan Mode | Free | Text-guided checks with manual photo capture (camera overlay deferred to v1.1) |
| 6 | Hard Stop Protocol | Free | Emotional safety net — never gated behind payment |
| 7 | Basic Inspection Summary | Free | Shareable text block — findings, severity, and verdict in a format the user can copy and send via messaging apps. Not formatted or branded like Pro reports, but functional for sharing. Every share is a distribution event |
| 8 | VIN Affiliate Integration | Free | Per-click affiliate revenue regardless of user tier. Every completed inspection prompts a VIN check. Gating behind Pro leaves revenue on the table with zero strategic benefit |
| 9 | Poker Face Mode | Pro | Premium UX — dual-view social dynamic protection |
| 10 | Negotiation Report | Pro | Highest-value output artifact — natural conversion trigger |
| 11 | Clean Inspection Summary | Pro | Formatted, shareable positive-outcome document with branding and professional layout |
| 12 | Soft Paywall (Beta) | — | Pro features accessible but labeled "Pro — free during beta." Collects conversion intent data without payment infrastructure |

**Conditional MVP (ship if timeline allows):**

| # | Capability | Free/Pro | Deferral Impact |
|---|---|---|---|
| 13 | Personal Roberto | Pro | Solo inspection still delivers full value. Roberto deferred to v1.1 with no degradation to core experience. Roberto outcome delta metric deferred accordingly |

**Paywall Philosophy:** Safety is free, power is Pro. The free tier delivers a complete inspection experience that always protects the buyer — personalized severity, Model DNA intelligence with transparent coverage confidence, Hard Stop intervention, a shareable findings summary, and VIN history access. The Pro tier unlocks premium UX (Poker Face Mode), formatted professional reports (Negotiation Report, Clean Inspection Summary), and social features (Roberto). No safety feature is ever gated behind payment.

**Free Tier Strategic Purpose:** Beyond conversion, the free tier is the data collection engine for the Layer 3 defensibility moat. Every free inspection generates findings data — severity ratings, Model DNA hits, outcomes — that feeds the crowd-sourced Model DNA database in Phase 2. Free users who complete inspections and contribute data are strategically valuable regardless of conversion. The free tier is designed to maximize inspection completion rate, not just Pro conversion rate.

### Post-MVP Features

**Phase 1.1 (Fast Follow — if not shipped in MVP):**

| Feature | Rationale |
|---|---|
| Personal Roberto (if deferred) | Self-contained social layer, no dependencies on other features |
| Camera overlay for Structural Scan | UX polish layer — ships after text-guided version validates |

**Phase 2 (Growth — 6–18 months):**

| Feature | Rationale |
|---|---|
| Hard paywall + subscription billing | Soft paywall intent data informs pricing and tier structure |
| App-provided expert (paid Roberto) | Requires vetting and booking ops — validate concept first |
| Dual Assessment Engine (seller credibility) | Compelling but adds inspection complexity |
| Open mechanic marketplace | Needs buyer traction and supply network first |
| Pre-visit listing screening | High value upstream, but MVP targets buyers with visits scheduled |
| Inspection Pattern Tracker | Requires multiple inspections per user — retention feature |
| Crowd-sourced Model DNA contributions | Formalizes user data submission into structured model intelligence |

**Phase 3 (Vision — 18+ months):**

| Feature | Strategic Role |
|---|---|
| Certified Listing Badge | Turns the app from buyer tool into market infrastructure |
| Dealership B2B tier | Bulk inspection tools, branded reports, Dealer Verified badge |
| Crowd-sourced model intelligence at scale | User-submitted data trains Model DNA — the database gets smarter with every inspection |

**The 3-year vision:** car-buy-assistant is no longer just a buyer's tool. It is the trust infrastructure of the private used car market — the standard that buyers require, sellers compete to earn, and dealerships pay to operate within.

### Risk Mitigation Strategy

**Technical Risks:**

| Risk | Mitigation |
|---|---|
| WebRTC complexity (Roberto) delays MVP | Roberto is the only deferrable feature — ship without it if needed, add in v1.1 |
| Offline-first sync bugs (PowerSync) | Buyer device is authoritative for inspection state; Roberto is read-only with additive comments. Conflict-free by design. Test offline scenarios early and continuously |
| Camera performance variance across devices | VisionCamera handles native initialization; test on low-end Android devices early. Degrade gracefully (reduce resolution) rather than fail |
| Model DNA data quality at launch | Coverage confidence indicator on every briefing — transparent about data completeness. "12 known issues from recalls and forums" vs. "limited data from recalls only" vs. "no model-specific data." Prevents false confidence. Honest incomplete data beats silently incomplete data |

**Market Risks:**

| Risk | Mitigation |
|---|---|
| Category creation = no existing demand signal | SEO targets existing search intent ("how to inspect a used car"). Target post-purchase regret segment as highest-conviction acquisition channel |
| Users don't complete full inspections | Track completion rate as leading health indicator. If <60%, investigate UX before adoption flatlines |
| Poker Face Mode perceived as deceptive | Frame as "professional mode" with onboarding normalization. Track sentiment in reviews |

**Resource Risks:**

| Risk | Mitigation |
|---|---|
| Solo developer timeline overrun | Roberto is the release valve — defer to v1.1 if needed. 14-week target has one feature of slack built in |
| Burnout or context switching | Strict phase boundaries — don't start Phase 2 features during MVP build. Ship, validate, then iterate |
| Model DNA curation bottleneck | Launch with curated top 50 models. Coverage confidence indicator sets honest expectations for all coverage levels. Crowd-sourced contributions expand coverage in Phase 2 |

## User Journeys

### Journey 1: Marco's First Inspection — "The car looks great... but is it?"

**Who:** Marco, 28, software tester in Valencia. Buying his first car — a 2019 Seat León he found on Wallapop for €14,500. He's visiting the seller tomorrow evening after work. He has no mechanical knowledge and no one to bring with him.

**Opening Scene:**
It's 11pm and Marco is lying in bed scrolling through "how to inspect a used car" videos. There are dozens — 30-minute walkthroughs by mechanics speaking in jargon he half-understands. He watches two, takes some mental notes he'll forget by tomorrow, and falls asleep anxious. At 7am, a search result catches his eye: *"Car inspection companion — know what to look for on any car."* He downloads car-buy-assistant.

**Rising Action:**
Marco opens the app. It asks for the car's make, model, and year. He types "Seat León 2019." Instantly, the **Model DNA Briefing** appears: known weak points for this exact car — timing chain tensioner issues on the 1.5 TSI, common DSG mechatronic unit failures, rust-prone rear wheel arches. Marco didn't know any of this existed. He now knows what to look for *on this specific car* — before he's even left the house.

The app asks one more question: *"What's your repair budget if something comes up?"* Marco types €800. The app now knows his financial reality.

At 6:30pm, Marco arrives at the seller's apartment building. The car is parked on the street. The seller — friendly, confident, mid-40s — walks out and shakes his hand. "Nice car, right? Take your time." Marco opens the app, taps **Start Inspection**, and activates **Poker Face Mode**. The seller sees a neutral, professional-looking checklist on Marco's screen. What the seller doesn't see: Marco's private screen flagging that this is a DSG-equipped model and prompting him to check specific transmission behavior.

The app walks Marco through the exterior inspection step by step. Plain language: *"Run your fingers along the gap between the front fender and the door. Both sides should feel the same width."* Marco finds the left side noticeably wider. The app asks him to photograph it. He does. The finding is logged: **Yellow — Uneven panel gap, left front. Possible prior repair or poor reassembly. Estimated investigation cost: €150–300.**

The seller glances over. "Everything good?" Marco, reading the Poker Face prompt, says: "Just running through a few things." The seller sees a checklist with ticks. Nothing alarming.

Marco continues. Engine bay check reveals oil residue around the valve cover gasket — **Yellow, estimated repair €200–400, flagged as known León 1.5 TSI weak point from Model DNA**. The app recalculates against Marco's €800 budget: *"Two yellow findings totaling €350–700 estimated repair. This is 44–88% of your stated repair budget. Proceed with awareness."*

**Climax:**
The test drive. The app prompts Marco to pay attention to gear shifts. At 40km/h, there's a slight hesitation between 2nd and 3rd gear. Marco logs it. The app rates it: **Yellow — DSG hesitation between gears. Could indicate early mechatronic wear. This is a known León DSG weak point. Estimated repair if it worsens: €1,200–2,000.** Against Marco's €800 budget, this recalculates to **Red — Potential repair cost exceeds your repair budget.**

The **Hard Stop Protocol** does *not* trigger (the finding is potential, not confirmed critical), but the app's overall assessment shifts: *"This car has three findings. Combined worst-case repair estimate (€700–2,700) significantly exceeds your €800 budget. Consider carefully."*

**Resolution:**
The inspection ends. Marco has 3 findings, 12 photos, and a clear picture he never could have built alone. The app generates a **Negotiation Report**: documented findings, estimated costs, and a suggested counter-offer of €13,200 (€1,300 below asking). Marco shows the seller the report — professional, structured, factual. The seller hesitates, then offers €13,800. Marco accepts.

He walks away having saved €700 on a car he understands. The app didn't make the decision. Marco did — with real information, not hope. That night, he shares the app link with his friend who's also car shopping.

**Capabilities revealed:** Onboarding, VIN/make-model entry, Model DNA Briefing, Personal Risk Calibration, Poker Face Mode, guided inspection flow, photo capture, severity rating, budget recalculation, Negotiation Report generation, app sharing/referral.

---

### Journey 2: Elena and the Hard Stop — "I knew it. I knew it."

**Who:** Elena, 38, freelance translator in Milan. Two years ago she bought a Fiat 500X that turned out to have a hidden engine problem — €2,800 repair bill three weeks after purchase. She vowed never again. She's found a 2020 Volkswagen T-Roc for €18,000 from a private seller. She's already suspicious.

**Opening Scene:**
Elena has been using car-buy-assistant for two weeks. She's inspected three cars already — walked away from two (one with frame damage, one with excessive rust) and lost one she liked to another buyer while deliberating. She's learned to trust the app's ratings. Today's T-Roc is her fourth inspection.

Before leaving, she enters the VIN the seller provided. The Model DNA Briefing loads: T-Roc 2020 1.5 TSI — known issues with water pump failures and infotainment freezes. Nothing alarming, but she screenshots the briefing. Her repair budget is set at €1,500 — more generous than Marco's, but she's learned from experience.

**Rising Action:**
Elena arrives early — 15 minutes before the agreed time — to look at the car alone first. She walks around it with the app running in Poker Face Mode. The exterior check is clean. Paint readings consistent. Panel gaps even. She's surprised — and immediately suspicious. "Cars this clean usually hide something," she mutters.

She starts the interior check. Seats look good. Dashboard clean. Then the app prompts: *"Check under the floor mats and in the spare tire well for signs of water damage or unusual staining."* She lifts the rear floor mat. Damp. Not soaked, but unmistakably damp. She photographs it. The app logs: **Yellow — Moisture under rear floor mat. Possible water ingress, seal failure, or drainage blockage.**

The seller arrives. Friendly, shows her the service book. Elena continues the inspection with Poker Face active. Under the hood, the app walks her through the water pump check (flagged by Model DNA as a known weak point). She can't assess the pump visually, but the app prompts her to check the coolant reservoir level and color. The coolant is low and has a brownish tint. She photographs it. **Red — Coolant discoloration with low level. Indicates possible internal leak, head gasket degradation, or water pump failure. Estimated repair: €800–2,500.**

**Climax:**
The **Hard Stop Protocol** triggers.

The screen changes. A clear, calm message: *"Critical finding detected. Combined findings indicate potential serious mechanical issue (coolant system) alongside water ingress evidence. Estimated worst-case repair cost: €1,300–3,000 — approaching or exceeding your €1,500 repair budget. Recommendation: Do not proceed with purchase without professional mechanical inspection."*

Below it: a pre-written exit script.

Elena reads it. She doesn't have to argue with herself about whether she's being too cautious. She doesn't have to wonder if her past experience is making her paranoid. The app already made the call — based on evidence, not emotion. She feels a wave of relief.

**Resolution:**
Elena turns to the seller: "I appreciate your time. I've found a couple of things I'd need a professional mechanic to look at before I could move forward. I'll be in touch if I want to arrange that." — word for word from the exit script. The seller looks disappointed but doesn't push back. The script's professional tone leaves no opening for pressure.

Elena sits in her car afterward and exhales. Two years ago, she would have talked herself into this car. The seller was nice. The car was clean on the surface. She wanted a T-Roc. But the damp floor mat and the brown coolant — those were the same kind of signs she missed on the Fiat. This time, she didn't miss them. The app caught what she would have rationalized away.

She opens the app and marks the inspection as "Did not buy — Hard Stop." The findings are saved to her inspection history. She'll look at the next car tomorrow. The search continues, but the anxiety is manageable now. She has a system.

**Capabilities revealed:** Returning user flow, VIN pre-lookup, Model DNA known issue checking, Poker Face Mode, moisture/water damage inspection step, coolant system check, Hard Stop Protocol trigger, exit script generation, inspection history, emotional protection design.

---

### Journey 3: Roberto on the Line — "Look at that seam. That's not factory."

**Who:** Diego, 32, nurse in Seville, is inspecting a 2018 Ford Focus. His uncle Javier — a retired mechanic — is at home, 200km away. Diego invited Javier via a share link from car-buy-assistant.

**Opening Scene:**
Diego taps **Invite Expert** in the app and sends a link to Javier via WhatsApp. Javier clicks the link on his laptop — no app install, no account creation. A browser page opens showing Diego's inspection in real time: findings logged, photos captured, severity ratings updating live.

**Rising Action:**
Diego starts the inspection. Javier watches findings appear in real time on his browser. The exterior check goes smoothly — but then Diego reaches the rear quarter panel. The app prompts him to run his hand along the seam and photograph the transition between the rear door and the quarter panel.

Diego activates the **camera stream**. Javier now sees what Diego's phone camera sees, live. Diego slowly moves the camera along the rear quarter panel. Javier spots something immediately.

**Climax:**
"Stop. Go back. See that seam line above the wheel arch? Run your finger along it." Diego does. "Feel how it's rougher than the other side?" Diego confirms. "That's a repair. That panel's been welded or filled. That's not factory. Ask the seller about it."

Diego asks. The seller pauses, then admits the car was rear-ended two years ago. "Minor thing, all fixed professionally." Javier, listening through the stream, tells Diego: "Ask for the repair invoice and the insurance claim record. And check the trunk floor for alignment."

The trunk floor shows a 3mm misalignment on one side. Diego photographs it. The app logs: **Red — Structural repair evidence. Rear quarter panel repair confirmed by seller. Trunk floor misalignment indicates possible frame-level impact.** Hard Stop triggers.

**Resolution:**
Diego thanks the seller and leaves — cleanly, with documentation. In the car, Javier says: "Good car otherwise, but rear structural work is a deal-breaker at that price. You'd need €500–1,000 for the repaint, and the frame alignment is a question mark. Walk away."

Diego would never have caught the seam. The app alone might have flagged the roughness if Diego noticed it — but Javier's trained eye, watching through the camera, identified it instantly and knew exactly what follow-up questions to ask.

The inspection is saved. The findings show the Roberto outcome delta: this inspection's critical finding was identified during an expert-assisted session. Diego shares the app with two colleagues at the hospital.

**Capabilities revealed:** Expert invite via share link, browser-based real-time inspection mirror, live camera stream (WebRTC), expert voice/text communication, expert-identified findings, Roberto outcome tracking, Hard Stop from expert-confirmed finding, inspection sharing/referral.

---

### Journey 4: The Clean Car — "This one's actually good."

**Who:** Sara, 29, marketing manager in Barcelona. She's inspecting a 2021 Toyota Yaris Hybrid for €16,200. She's used the app once before (walked away from a Renault with suspension issues). This is her second inspection.

**Opening Scene:**
Sara enters the VIN before leaving home. Model DNA Briefing: Toyota Yaris Hybrid 2021 — highly reliable platform, no widespread known issues, hybrid battery typically lasts 150K+ km. The briefing is short and reassuring. She sets her repair budget at €1,000.

**Rising Action:**
At the car, the inspection runs smoothly. Exterior: even panel gaps, consistent paint, no rust. Interior: clean, no wear beyond normal for the mileage. Under the hood: all fluid levels good, no leaks, battery health indicator shows 92%. Test drive: smooth acceleration, silent EV mode at low speed, no unusual sounds.

Every check comes back green. Sara keeps waiting for the other shoe to drop — her first inspection made her cautious. But finding after finding logs as **Green — No issues detected.**

**Climax:**
The inspection completes. The app presents the summary: **18 checks completed. 17 green, 1 yellow (minor scratch on rear bumper — cosmetic only, estimated touch-up: €50–100). No red findings. No Hard Stop triggered.**

The overall verdict: *"This car is in good condition relative to its age and mileage. The single cosmetic finding does not affect safety, reliability, or value."*

Sara taps **Mark as Passed**. The app generates a **Clean Inspection Summary** — a shareable document listing every check performed, findings recorded, and the overall verdict. It's her proof: "I checked this car. Here's what I found. It's good."

**Resolution:**
Sara uses the Negotiation Report — even for a clean car. The app suggests: *"One minor cosmetic finding. Suggested discussion point: ask seller to include touch-up paint or adjust price by €50–100."* Sara mentions the bumper scratch. The seller knocks off €100. Small win, but it reinforces the habit.

Sara buys the Yaris with confidence. She has the Clean Inspection Summary saved — and shares it with her partner: "Look, I actually checked everything this time." She also submits her inspection findings back to the platform, contributing to the crowd-sourced Toyota Yaris data. The app thanks her and shows that 47 other users have inspected this model.

Two weeks later, a friend asks her about buying a used car. Sara sends the app link without hesitation.

**Capabilities revealed:** Returning user flow, VIN pre-lookup for reliable models, full guided inspection (happy path), all-green inspection flow, Clean Inspection Summary generation, minor-finding negotiation suggestion, user data contribution, inspection history, organic referral.

---

### Journey 5: Admin/Ops — Developer-Managed (MVP)

For MVP, all administrative operations are handled by Cristian directly via the Supabase dashboard and database:

- **Checklist template management** — Add/edit/reorder inspection items via Supabase table editor
- **Model DNA data curation** — Manage known-issue records for the top 50 models via database
- **User monitoring** — Supabase dashboard for auth events, active sessions, storage usage
- **Platform health** — Sentry for crash monitoring, PowerSync dashboard for sync health
- **Content moderation** — Review user-contributed data submissions via database queries

No admin UI is built for MVP. Formal admin tooling becomes a requirement when a second team member needs operational access or when content volume exceeds what's manageable via direct database interaction.

---

### Journey Requirements Summary

| Journey | Key Capabilities Revealed |
|---|---|
| **Marco (First Inspection)** | Onboarding, Model DNA Briefing, Personal Risk Calibration, Poker Face Mode, guided inspection, photo capture, severity engine, budget recalculation, Negotiation Report, referral |
| **Elena (Hard Stop)** | Returning user flow, VIN pre-lookup, known-issue checking, Poker Face Mode, moisture/water damage checks, Hard Stop Protocol, exit script, inspection history, emotional protection |
| **Roberto (Remote Expert)** | Expert invite link, browser mirror, live camera stream (WebRTC), voice/text communication, expert-identified findings, Roberto outcome tracking, Hard Stop |
| **Sara (Clean Car)** | All-green flow, Clean Inspection Summary, minor-finding negotiation, user data contribution, inspection history, referral |
| **Admin/Ops** | Supabase dashboard management, no custom admin UI for MVP |

**Critical capability gaps identified:** None — all MVP features map to at least one journey. The Clean Inspection Summary (added in Step 3 from party mode) is validated by Sara's journey as a necessary positive-outcome artifact.

## Domain-Specific Requirements

### Privacy & Data Protection (GDPR)

- **Geotagged photos** contain GPS coordinates embedded in EXIF metadata. Users must be informed and consent to location data capture. Provide option to strip GPS from shared/exported reports if desired.
- **VIN data** can be linked to vehicle owner identity in some jurisdictions. VIN data sent to affiliate APIs (Carfax, VinAudit) requires disclosure in privacy policy. Minimize VIN storage — cache locally, don't persist server-side beyond what's needed for the user's inspection history.
- **User-contributed inspection data** requires explicit opt-in consent before submission to the crowd-sourced database. Data must be anonymized (no user identity, no exact GPS, no photos) before aggregation into Model DNA.
- **WebRTC video streams** are peer-to-peer and not recorded or stored by the app. Privacy policy must state this clearly. Camera and microphone activation require explicit user action (tap to start stream).
- **Data retention** — Users can delete their account and all associated data (inspections, photos, findings). GDPR right to erasure must be implemented in Supabase via cascading deletes.
- **Cookie/tracking consent** — The browser-based Roberto viewer (web link for trusted contacts) must comply with cookie consent requirements if analytics are present.

### Liability & Legal Disclaimers

- **Not a professional inspection.** Clear, prominent disclaimer at onboarding and in Terms of Service: the app provides guidance based on user-reported observations, not a certified mechanical inspection. It does not replace a professional pre-purchase inspection (PPI).
- **Severity ratings are estimates.** Repair cost ranges are informational, sourced from aggregated data, not quotes. Disclaimer on every Negotiation Report and Clean Inspection Summary.
- **No guarantee of defect detection.** The app guides what to look for — it cannot detect issues the user doesn't observe or report. Hard Stop Protocol is a recommendation, not a binding verdict.
- **Limitation of liability** in Terms of Service — the app is not liable for purchase decisions made using its guidance.

### App Store Compliance

See Mobile App Specific Requirements > Store Compliance for full app store compliance details including soft paywall strategy, affiliate link framing, privacy policy, content moderation, and age rating. Permission justifications are documented in Mobile App Specific Requirements > Device Permissions.

### Third-Party Data Processing

- **VIN affiliate APIs** — Data processing agreements (DPAs) needed with affiliate partners who receive VIN data. Ensure partners are GDPR-compliant if serving EU users.
- **Supabase** — Acts as data processor. Supabase is GDPR-compliant and offers EU-region hosting. Use EU region for the production Supabase project.
- **TURN server provider** — Temporary credentials only, no persistent user data passes through. Low privacy risk but should be documented in privacy policy.

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Behavioral Design as Core Product Architecture**
The app's central innovation is not technological — it's the application of behavioral economics to the used car inspection moment. Existing tools provide data (VIN history) or access to experts (Lemon Squad). No tool addresses the behavioral failure mode: buyers override rational signals when emotionally invested. Poker Face Mode, Hard Stop Protocol, and Personal Risk Calibration are behavioral interventions designed into the product UX — not features bolted on.

**2. Consumer-Facing Guided Inspection (Category Creation)**
AI-powered vehicle inspection technology exists and is mature (Ravin AI, Tchek, Monk AI, Inspektlabs) — but every implementation is B2B, serving insurers, rental fleets, and dealerships. car-buy-assistant is the first consumer-facing application of guided inspection technology for private buyers. This is category creation, not category competition.

**3. Personalized Severity Calibration**
Every existing inspection tool — professional or digital — delivers universal severity ratings. A cracked engine mount is "critical" regardless of who's asking. car-buy-assistant recalibrates severity against the buyer's stated repair budget, producing *personalized verdicts*. Same car, different verdict for different buyers — because that's the truth. No market equivalent exists.

**4. Social Power Dynamic UX (Poker Face Mode)**
The dual-view UX pattern — seller sees a neutral checklist, buyer sees private severity alerts — addresses a social dynamic that every buyer experiences and no tool acknowledges. The inspection happens in the seller's territory, under the seller's observation. Poker Face Mode is the first UX pattern designed for adversarial social contexts in consumer mobile apps.

**Poker Face Mode as Organic Growth Engine:** Every activation of Poker Face Mode generates a *story*. "I was standing in front of the seller and the app was secretly showing me the car had frame damage while he thought I was just checking boxes." This is the "Did you know Uber shows you the car coming on the map?" moment for car buying. Every activation is a potential word-of-mouth event. Track Poker Face mentions in reviews and referral context as a virality indicator.

**Framing risk:** Some buyers may feel morally uncomfortable hiding information from someone they're face-to-face with. The framing must normalize it: *"Professional inspectors don't show their findings to sellers during an inspection. Neither should you."* Position as standard professional behavior, not deception. Onboarding copy and in-app microcopy must reinforce this framing consistently.

### Innovation Layers — Defensibility Analysis

Not all innovation is equally defensible. The product's innovations fall into four layers, from immediately replicable to structurally defensible:

| Layer | Innovation | Defensibility | Timeline to Moat |
|---|---|---|---|
| **Layer 1: UX Innovation** | Poker Face Mode, Hard Stop Protocol, guided inspection flow | Low — replicable with good design | Immediate value, no long-term moat |
| **Layer 2: Personalization** | Risk Calibration, severity engine | Medium — easy to build, hard to calibrate well | Moat builds with inspection data volume |
| **Layer 3: Data Network** | Model DNA from crowd-sourced inspections | High — requires thousands of real inspections | 12–24 months to meaningful data advantage |
| **Layer 4: Trust Network** | Roberto ecosystem, inspection sharing, referral loop | Highest — classic network effect | 18–36 months to critical mass |

**Strategic principle: The UX is the hook, the data is the lock.** Layer 1 and 2 get users in the door. Layer 3 and 4 make the product irreplaceable. A competitor can copy Poker Face Mode in a sprint. They cannot copy 10,000 real inspections of crowd-sourced Model DNA data or an established Roberto trust network. Measure Layer 3 and 4 from day one.

### Market Context & Competitive Landscape

Validated by comprehensive market research (2026-02-18):
- Used Car Mobile Apps market: $9.27B (2026), 9.3% CAGR
- Zero consumer-facing guided inspection apps exist globally
- Closest competitor (Lemon Squad) is a human dispatch service, not self-serve
- All six core differentiators confirmed as having no market equivalents
- The behavioral design layer (emotional guardrails) has no analogue in any automotive consumer app

### Validation Approach

| Innovation | Validation Method | Success Signal |
|---|---|---|
| Guided inspection (category) | 100 completed inspections in Phase 1 | Users complete full inspections without expert assistance |
| Behavioral guardrails | Hard Stop acceptance rate + walk-away rate | >50% of Hard Stops result in buyer actually walking away (not overriding) |
| Personalized severity | Budget-calibrated vs. universal severity comparison | Users with budget set complete inspections at higher rates and report higher confidence |
| Poker Face Mode | Activation rate during inspections | >60% of inspections activate Poker Face when seller is present |
| Poker Face virality | % of users who mention Poker Face in reviews or referral context | Poker Face becomes a word-of-mouth driver — track as virality indicator |
| Roberto social layer | Roberto outcome delta metric | Roberto-assisted inspections show measurably different outcomes than solo |

#### Hard Stop Calibration Loop

A Hard Stop that's always obeyed isn't useful — it means the bar is too low and buyers walk away from acceptable cars. A Hard Stop that's never obeyed means buyers have learned to ignore it. The optimal override rate is neither 0% nor 50% — it's likely 15–30%. Hard Stop Protocol becomes a learning system through this feedback loop:

1. Track override rate per severity category (structural, mechanical, electrical, cosmetic)
2. Track **post-purchase regret** for overridden Hard Stops — did the buyer who overrode end up with expensive repairs?
3. If override rate is high AND post-purchase regret is high → thresholds are correct, buyers need stronger emotional intervention
4. If override rate is high AND post-purchase regret is low → thresholds are too aggressive, recalibrate downward
5. If override rate is low → thresholds are well-calibrated OR too conservative (check if buyers are walking away from good cars)

This transforms Hard Stop from a static popup into a **calibrating system** that improves with every inspection.

### Risk Mitigation

| Innovation Risk | Fallback |
|---|---|
| Buyers don't trust app severity ratings | Provide transparency — show the data behind every rating. Allow manual override with "I disagree" option that logs buyer reasoning |
| Poker Face Mode feels deceptive to buyers | Frame as "professional mode" with onboarding normalization: "Professional inspectors don't share findings during inspection. Neither should you." |
| Hard Stop Protocol is ignored/overridden | Apply calibration loop: cross-reference override rate with post-purchase regret to determine if thresholds need adjustment or emotional intervention needs strengthening |
| Personalized severity adds confusion | Offer toggle: "Show universal ratings" vs. "Show my ratings." Default to personalized, allow comparison |
| Category creation means no existing demand signal | SEO targets existing demand ("how to inspect a used car"). Additionally, target **post-purchase regret** segment ("bought a car and found problems") — this is the highest-conviction acquisition channel and the most powerful evangelism source |

## Mobile App Specific Requirements

### Project-Type Overview

car-buy-assistant is a cross-platform mobile application built with React Native + Expo, targeting iOS and Android with a consistent experience across both platforms. The app is inspection-centric and field-use-first — it must perform reliably in the physical conditions where car inspections happen: outdoor lighting, intermittent connectivity, one-handed use while crouching next to a vehicle.

### Platform Requirements

- **Cross-platform:** React Native + Expo, single codebase, >85% code sharing, no platform-specific feature branching
- **Minimum OS versions:** iOS 15+, Android 11+ (covers >90% of active devices)
- **Consistent UX:** Same interaction patterns, layouts, and visual behavior on both platforms. No platform-specific UI conventions — with one exception: respect native OS back navigation and swipe gestures (iOS edge swipe, Android system back). Expo Router handles this natively; do not override platform back behavior.

### Device Permissions

| Permission | Trigger Point | Justification | Required? |
|---|---|---|---|
| **Camera** | Entering scan mode / photo capture | Inspection evidence capture, VIN barcode scanning | Yes |
| **Microphone** | Starting Roberto video call | WebRTC voice communication with trusted contact | No — only for Roberto |
| **Location** | First photo capture (runtime) | Geotagging inspection photos for evidence integrity | Optional — app functions without it |
| **Flashlight** | Manual toggle during inspection | Illumination for engine bay, wheel wells, undercarriage inspection in low-light conditions | No — convenience feature |

All permissions requested at point of use, never at app launch.

**Flashlight UX:** Accessible via a persistent utility bar on the buyer's private screen (alongside camera and note shortcuts). The utility bar is never visible on the Poker Face seller-facing view.

### Offline Mode

**Design principle:** 100% inspection functionality without network. The app assumes no connectivity during an active inspection.

**Source of truth:** The buyer's device is authoritative for all inspection state. Roberto browser sessions are read-only observers with comment capability — they can view findings and add comments, but cannot create or modify findings. This eliminates sync conflicts for the primary data model.

**Pre-cache before inspection:**
- Model DNA data for the selected make/model/year
- Full checklist templates for all inspection categories
- Severity calibration logic and repair cost reference data

**Local storage strategy:**
- Photos saved to device filesystem (app-specific directory); database stores file path pointers only
- All inspection state (findings, severity ratings, timestamps, user inputs) stored in local PowerSync database
- Single inspection estimated storage: ~50–150MB depending on photo count (target 15–25 photos per inspection at compressed resolution)

**Photo cleanup policy:** Photos for inspections where no report was generated (Negotiation Report, Clean Inspection Summary, or Hard Stop report) are eligible for automatic cleanup after 30 days. The app prompts the user before deletion, allowing them to generate a report or explicitly keep the photos.

**Sync priority order (when connectivity returns):**
1. Inspection state and findings — smallest payload, highest value
2. Roberto comments — additive-only data, no conflict risk
3. User-contributed data submissions (if opted in)
4. Photo uploads — only for inspections with a generated report. Background upload with retry queue that survives app restart
5. Model DNA cache refresh — pull updated known-issue data for previously searched models

**Photo handling:**
- Compression before upload: 80% JPEG quality, ~1–2MB per photo
- When Roberto is active and device is online: photos sync in near-real-time to the remote viewer
- Upload queue is persistent — failed uploads never block the user or lose data

### Push Notification Strategy

MVP push notifications are limited to three high-value, user-initiated triggers:

| Notification | Trigger | Timing |
|---|---|---|
| **Roberto joined** | Trusted contact opens the inspection share link | Real-time, during active inspection |
| **Roberto commented** | Trusted contact adds a comment to an active inspection finding | Real-time, in-app alert during active inspection |
| **Model DNA available** | Curated data added for a model the user previously searched with no coverage | Async, within 2 weeks of the original search — if data isn't curated within that window, the notification is not sent (the buyer has likely moved on) |

No promotional, marketing, or re-engagement notifications in MVP. All notifications are responses to user-initiated actions.

### Store Compliance

- **Soft paywall:** Pro features labeled "Pro — coming soon" with no payment infrastructure in MVP. No in-app purchase configuration required at launch
- **VIN affiliate links:** Framed as informational links to third-party vehicle history services, not in-app purchases
- **Privacy policy:** Accessible URL required before app submission, covering all data handling documented in the Domain-Specific Requirements section
- **Content moderation:** User-contributed Model DNA data is curated manually by the developer before being visible to other users — no raw user-generated content displayed without review
- **Age rating:** Standard rating expected — app provides purchase guidance, not financial transactions

### Implementation Considerations

- **Hermes AOT compilation** for <2 second cold start — buyers open the app at the car
- **VisionCamera native initialization** for <500ms camera launch — no delay entering scan mode
- **Runtime permission requests only** — no permission dialogs at first launch
- **Background upload service** — photo upload queue must continue when app is backgrounded or restarted
- **PowerSync conflict resolution** — buyer device is authoritative for inspection state; Roberto comments use additive-only sync (append, never modify). No merge conflicts by design.

## Functional Requirements

### Onboarding & Vehicle Setup

- FR1: Buyer can enter a vehicle's make, model, and year to identify the car being inspected
- FR2: Buyer can enter or scan a VIN to identify the specific vehicle
- FR3: Buyer can set a personal repair budget that persists across inspections
- FR4: Buyer can view a Model DNA Briefing showing known failure patterns, common issues, and weak points for the specific make/model/year
- FR5: Buyer can see a coverage confidence indicator on every Model DNA Briefing showing data completeness level (extensive / limited / no model-specific data)
- FR6: Buyer can view a general inspection checklist when no model-specific DNA data is available
- FR7: Buyer can create a new inspection session for a specific vehicle
- FR8: Buyer can complete first-use setup (vehicle entry + budget) without a mandatory tutorial or walkthrough
- FR9: System prompts the buyer to run a VIN history check via affiliate partner when a VIN is entered during vehicle setup, framed as pre-inspection preparation

### Inspection Engine

- FR10: Buyer can follow a step-by-step guided inspection flow organized by inspection category (exterior, interior, engine bay, test drive)
- FR11: Buyer can log a finding at any inspection step with a description
- FR12: Buyer can capture and attach photos to any finding
- FR13: System assigns a severity rating (green/yellow/red) to each finding with a plain-language explanation
- FR14: System provides a repair cost estimate range for each finding
- FR15: System flags findings that match known Model DNA weak points for the specific vehicle
- FR16: System recalculates severity ratings against the buyer's stated repair budget (Personal Risk Calibration)
- FR17: Buyer can view a running summary of all findings, severity ratings, and cumulative cost estimates during an active inspection
- FR18: Buyer can mark an inspection as complete
- FR19: Buyer can mark a completed inspection outcome (bought, did not buy — Hard Stop, did not buy — other)
- FR20: Buyer can access previous inspections and their findings from inspection history
- FR21: Buyer can toggle device flashlight during an inspection for low-light conditions

### Behavioral Guardrails

- FR22: Buyer can activate Poker Face Mode displaying a neutral, professional checklist on the primary screen while showing severity alerts and coaching on a private buyer view
- FR23: Buyer can toggle Poker Face Mode on and off during an inspection
- FR24: System triggers Hard Stop Protocol when cumulative critical findings cross a defined threshold
- FR25: Hard Stop displays a clear rationale, cumulative cost estimates, and a recommendation to not proceed without professional inspection
- FR26: Hard Stop provides a pre-written exit script the buyer can use with the seller
- FR27: Buyer can override a Hard Stop with explicit confirmation and logged reasoning
- FR28: System tracks Hard Stop override rate and post-purchase outcomes for calibration

### Reports & Output

- FR29: Buyer can generate a Basic Inspection Summary — a shareable text block with findings, severity ratings, and overall verdict (free tier)
- FR30: Buyer can copy or share the Basic Inspection Summary via messaging apps
- FR31: Buyer can generate a Negotiation Report with documented issues, estimated repair costs, and a suggested counter-offer (Pro tier)
- FR32: Buyer can generate a Clean Inspection Summary — a formatted, shareable document listing all checks performed, findings, and overall passed verdict (Pro tier)
- FR33: Buyer can export or share any generated report

### Social Inspection — Roberto Core (Conditional MVP)

- FR34: Buyer can invite a trusted contact to an inspection session via a share link
- FR35: Trusted contact can view the inspection in real time via a browser — no app install required
- FR36: Trusted contact can see findings, photos, and severity ratings as they are logged
- FR37: Trusted contact can add comments to the inspection or to specific findings
- FR38: Buyer receives a real-time notification when a trusted contact joins the inspection
- FR39: Buyer receives a real-time notification when a trusted contact adds a comment

### Social Inspection — Roberto Live (Conditional MVP, deferrable independently)

- FR40: Buyer can start a live camera stream that the trusted contact can view in real time
- FR41: Buyer and trusted contact can communicate via voice during a live stream

### Data & Sync

- FR42: Buyer can complete an entire inspection without network connectivity (offline-first)
- FR43: System stores photos on the device filesystem with database path pointers
- FR44: System syncs inspection state and findings when connectivity returns, prioritized above photo uploads
- FR45: System uploads photos only for inspections where a report was generated
- FR46: System provides a persistent upload queue that survives app restart and background state
- FR47: System pre-caches Model DNA data, checklist templates, and severity calibration data before an inspection starts
- FR48: System prompts the buyer before cleaning up photos older than 30 days for inspections without generated reports
- FR49: Buyer can opt in to contribute anonymized inspection findings to the crowd-sourced Model DNA database

### Revenue & Monetization

- FR50: System prompts the buyer to run a VIN history check via affiliate partner after inspection completion, framed as findings validation (post-inspection)
- FR51: Buyer can access Pro-labeled features during beta with an informational notice that the feature will require Pro subscription in the future
- FR52: System records which Pro features users attempt to access for conversion intent analytics

### Analytics & Tracking

- FR53: System tags each inspection as solo or Roberto-assisted and records the outcome for Roberto outcome delta analysis
- FR54: System records model searches where no DNA data was available, enabling future notification when data becomes available

### Sharing & Referral

- FR55: Buyer can share the app via an in-app referral mechanism

### Privacy & Compliance

- FR56: Buyer is informed about GPS data in photo EXIF metadata and can consent to location capture
- FR57: Buyer can use the app without granting location permission, with degraded evidence metadata
- FR58: System requests camera and microphone permissions only at point of use, never at launch
- FR59: Buyer can delete their account and all associated data (inspections, photos, findings)
- FR60: System displays a liability disclaimer at onboarding stating the app does not replace a professional inspection
- FR61: System displays cost estimate disclaimers on every generated report
- FR62: Buyer provides explicit opt-in consent before any data is submitted to the crowd-sourced database
- FR63: System anonymizes all user-contributed data before aggregation (no user identity, no exact GPS, no photos)

## Non-Functional Requirements

### Performance

| NFR | Target | Rationale |
|---|---|---|
| NFR1: App cold start time | <2 seconds | Hermes AOT — buyers open the app at the car, delay kills trust |
| NFR2: Camera launch time | <500ms | VisionCamera native init — no delay entering scan mode |
| NFR3: Severity rating calculation | <500ms after finding logged | Must feel responsive during active inspection — buyer is standing at the car |
| NFR4: Sync latency (online) | <5 seconds | PowerSync real-time sync — findings appear on Roberto sessions promptly |
| NFR5: Photo capture to saved | <1 second | Photo must confirm saved before buyer moves to next check |
| NFR6: Model DNA Briefing load | <2 seconds (cached), <5 seconds (network fetch) | Pre-inspection preparation — buyer is patient but expects responsiveness |
| NFR7: Report generation | <3 seconds | End-of-inspection moment — buyer wants the output quickly |

### Security

| NFR | Requirement | Rationale |
|---|---|---|
| NFR8: Data in transit | All network communication over TLS 1.2+ | Standard transport security for user data and API calls |
| NFR9: Authentication | Supabase Auth with email/password and social login options | User identity for inspection history, sync, and account management |
| NFR10: Data at rest (device) | OS-level device encryption sufficient — no additional app-level encryption | Device security is the user's responsibility; app does not store payment or high-sensitivity credentials |
| NFR11: Data at rest (server) | Supabase default encryption at rest | Standard database-level encryption for stored inspection data |
| NFR12: VIN data handling | VIN cached locally during active inspection only; not persisted server-side beyond inspection record | Minimize sensitive vehicle-identity data retention per GDPR data minimization |
| NFR13: WebRTC streams | Peer-to-peer, not recorded or stored by the app | Privacy by design — no server-side video retention |
| NFR14: API keys and secrets | Never embedded in client code; accessed via Supabase edge functions or environment config | Prevent credential exposure in app bundle |
| NFR15: Session management | Auth tokens expire and refresh automatically; session invalidation on account deletion | Standard session security hygiene |

### Reliability

| NFR | Target | Rationale |
|---|---|---|
| NFR16: Crash-free rate | >99.5% | Sentry monitoring — the app cannot crash during a live inspection |
| NFR17: Offline inspection reliability | 100% functional without network | All inspection features work in garages, rural areas, basements — no exceptions |
| NFR18: Photo upload success rate | >99% within 72 hours of connectivity restoration | Upload queue with retry logic — no lost evidence. Upload queue respects the 30-day photo cleanup policy — photos scheduled for cleanup are removed from the queue |
| NFR19: Data loss prevention | Zero inspection data loss across app restart, backgrounding, or crash | PowerSync local-first — data persists regardless of app state |
| NFR20: Graceful degradation | App remains functional when external services are unavailable (VIN affiliate, TURN server) | External dependency failure must not block core inspection flow |
| NFR21: Storage pressure handling | When device storage is low, system warns the buyer and reduces photo resolution automatically rather than failing silently. Inspection state (findings, text data) always prioritized over photo storage | A full filesystem during a live inspection is worse than a crash — handle gracefully |
| NFR22: Battery awareness | System warns buyer when battery drops below 15% during an active inspection. Inspection state auto-saved continuously — power-off results in zero data loss | Camera + flashlight + WebRTC + sync drains battery fast. 30–60 minute inspections on mid-range devices are a real scenario |

### Scalability

| NFR | Target | Rationale |
|---|---|---|
| NFR23: Phase 1 capacity | Support up to 1,000 concurrent users | Supabase + PowerSync handle this natively — no custom scaling needed |
| NFR24: Storage growth | Support up to 100,000 inspection records and associated photos | Supabase storage with lifecycle policies — plan for Phase 2 growth |
| NFR25: Database performance | Query response <500ms at Phase 1 scale | Supabase PostgreSQL with proper indexing — baseline for monitoring |

### Accessibility

| NFR | Requirement | Rationale |
|---|---|---|
| NFR26: Platform defaults | Follow iOS and Android platform accessibility defaults (font scaling, screen reader labels, touch targets) | Baseline accessibility without custom implementation overhead |
| NFR27: Minimum touch targets | 44x44pt minimum for all interactive elements | Field use — buyer may be wearing gloves, operating one-handed, or in awkward positions |
| NFR28: Text readability | System font with platform default scaling support | Outdoor use in varying light conditions — let the OS handle accessibility preferences |

### Integration

| NFR | Requirement | Rationale |
|---|---|---|
| NFR29: VIN affiliate API | Timeout <5 seconds with graceful fallback if unavailable | External dependency — must not block inspection flow |
| NFR30: Supabase availability | Rely on Supabase's SLA (99.9% uptime) — EU region for GDPR compliance | Core backend — choose EU region at project creation |
| NFR31: PowerSync sync | Conflict-free by design (buyer device authoritative, Roberto additive-only) | Architectural decision eliminates sync conflict handling complexity |
| NFR32: WebRTC connection | Peer-to-peer via STUN <3 seconds; fallback to TURN relay <5 seconds. Display clear connection status to both parties — stream must not fail silently | Full connection path from direct to relayed, with transparency |
| NFR33: Roberto browser viewer | Supports current and previous major version of Chrome, Safari, Firefox, and Edge. Camera stream requires minimum 1 Mbps upload (buyer) and 1 Mbps download (viewer). Display clear quality indicator when bandwidth is insufficient | Roberto viewer is a web page — must work on common browsers without app install |

### Observability

| NFR | Requirement | Rationale |
|---|---|---|
| NFR34: Analytics event reliability | Critical product analytics events (inspection started, inspection completed, Hard Stop triggered, report generated, affiliate clicked, Pro feature attempted) must fire with >99% reliability. Lost events acceptable for non-critical UI interactions but not for business KPIs | Solo developer making product decisions based on this data — analytics accuracy is the foundation of every success metric |
