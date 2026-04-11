# Home Screen UI Design — Image Generation Prompt

**Purpose:** Provide a detailed prompt for an image generation model to produce a high-fidelity mobile UI mockup of the Truvis (car-buy-assistant) Home Screen, covering the features described in Epics 11 and 12.

**Target output:** A single, vertically scrollable iPhone-style mobile screen mockup showing the complete Home Screen layout with all zones populated.

---

## Master Prompt

Generate a high-fidelity mobile app UI mockup for an iPhone 15 Pro screen (393 x 852 points, portrait orientation). The app is called **Truvis** — a used-car inspection companion app. This is the **Home Screen** — the default landing tab the buyer sees after opening the app.

### Overall Visual Style

- **Design language:** Clean, minimal, light UI. Generous whitespace. Calm and professional — not playful, not gamified. The feeling is "composed expert ally," not "fun consumer app."
- **Background:** Near-white (#FAFAFA)
- **Card backgrounds:** Light grey (#F5F5F5) with subtle shadow (shadow-sm)
- **Border radius:** 12px (rounded-xl) on all cards and containers
- **Spacing grid:** 4pt base unit. 16px standard gaps between elements. 32px screen edge padding.
- **Font:** System font (San Francisco on iOS). No custom fonts.
- **No decorative color.** Color is used only for severity indicators (green/yellow/red) and brand accents. Everything else is neutral grey tones.

### Color Tokens (exact values)

| Token | Hex | Usage |
|---|---|---|
| Background | #FAFAFA | Screen background |
| Card surface | #F5F5F5 | Card backgrounds |
| Borders | #E5E5E5 | Card borders, dividers |
| Secondary text | #A3A3A3 | Labels, metadata, timestamps |
| Primary text | #404040 | Body text, descriptions |
| Emphasis text | #171717 | Headlines, names, key data |
| Brand primary | #2E4057 | Primary CTA button, nav accents (warm indigo-slate) |
| Brand accent | #3D7A8A | Secondary actions, links (teal-slate) |
| Severity green | #22C55E (text #065F46, bg #D1FAE5) | "All clear" indicators |
| Severity yellow | #EAB308 (text #92400E, bg #FEF3C7) | "Moderate concern" indicators |
| Severity red | #EF4444 (text #991B1B, bg #FEE2E2) | "Critical finding" indicators |

### Typography Scale

| Level | Size | Weight | Usage |
|---|---|---|---|
| Headline | 20pt | Semibold 600 | Section titles, greeting name |
| Body | 16pt | Regular 400 | Descriptions, nudge text, card content |
| Body emphasis | 16pt | Medium 500 | Vehicle names, CTA text |
| Detail | 13pt | Regular 400 | Metadata, timestamps, labels, category tags |
| Caption | 11pt | Regular 400 | Secondary metadata |

---

## Screen Layout (Top to Bottom)

The Home Screen is a single vertically-scrollable view with a bottom tab navigation bar. Layout the following zones sequentially from top to bottom:

---

### Zone 1: Status Bar + Safe Area (~44pt)

Standard iOS status bar (time, signal, battery) at the very top. Leave appropriate safe area inset.

---

### Zone 2: Co-Pilot Greeting (~60pt height)

**Position:** Top of scrollable content, 32px horizontal padding.

**Content:**
- Left-aligned greeting text: **"Good morning, Cristian"** in emphasis text (#171717), 20pt semibold
- Below it, a secondary line in primary text (#404040), 16pt regular: **"You have 3 vehicles — 1 ready to inspect"**
- The greeting has a warm, companion tone — like a knowledgeable friend checking in

**Visual notes:**
- No card/container — text sits directly on the #FAFAFA background
- Generous bottom margin (24px) before the next zone

---

### Zone 3: Adaptive Primary CTA (~80pt height)

**Position:** Below greeting, full width minus 32px padding on each side.

**Content:**
- A single prominent button filling the horizontal space
- Button text: **"Start Inspection — BMW 320d"** in white (#FFFFFF), 16pt medium
- Button background: Brand primary (#2E4057), rounded-xl (12px radius)
- Button height: 56px (48pt minimum touch target with comfortable padding)
- Subtle breathing pulse animation implied — show a very faint glow/shadow around the button suggesting gentle pulsation

**Visual notes:**
- This is the single most important action on the screen
- The button should feel like the visual anchor of the entire layout
- No icon — text only

---

### Zone 4: Vehicle Shortlist Cards (~100pt height)

**Position:** Below CTA, 32px left padding, cards extend to edge (horizontal scroll implied).

**Section header:** "Your Vehicles" in detail text (#A3A3A3), 13pt regular, left-aligned, with 16px bottom margin.

**Content:** A horizontally scrollable row of 3 vehicle cards. Show them as if slightly peeking from the right edge to imply horizontal scrolling.

**Each card (width ~260px, height ~90px):**
- Card background: #F5F5F5, rounded-xl, subtle shadow
- **Card content:**
  - **Vehicle name** (top): "BMW 320d 2019" in emphasis text (#171717), 16pt medium
  - **Journey stage** (below name): "Inspected" in detail text (#A3A3A3), 13pt regular
  - **Severity indicators** (bottom-right area of card): Three small dots/shapes in a row:
    - Green circle (checkmark shape) with "4" label
    - Yellow triangle (warning shape) with "2" label  
    - Red octagon/stop shape with "1" label
  - These severity dots use distinct shapes (not just color) for accessibility

**Second card (partially visible):**
- "Audi A4 2020" — stage "Added" — no severity dots (not inspected)

**Third card (barely visible, cut off by right edge):**
- "Seat Leon 2019" — peeking from edge

**Visual notes:**
- Cards have 12px gap between them
- The horizontal scroll is implied by the third card being cut off
- Cards are ordered by most recently active

---

### Zone 5: Co-Pilot Nudge (~60pt height, conditional)

**Position:** Below vehicle cards, full width minus 32px padding.

**Content:**
- A single-line contextual nudge on a card with brand-accent (#3D7A8A) left border (3px)
- Card background: #F5F5F5, rounded-xl
- Inside: an icon (small lightbulb or speech bubble in #3D7A8A) + text
- Nudge text: **"Your BMW 320d has 2 yellow findings — review them before deciding"** in primary text (#404040), 16pt regular
- The tone is cheeky but helpful — co-pilot personality

**Visual notes:**
- Tappable — the whole card is a touch target
- Compact — single line with icon, not a tall card
- Internal padding: 12px vertical, 16px horizontal

---

### Zone 6: Help Me Decide (~120pt height, conditional)

**Position:** Below nudge, full width minus 32px padding.

**Section header:** "Help Me Decide" in detail text (#A3A3A3), 13pt regular, left-aligned.

**Content:** A comparison summary card showing severity breakdowns across inspected vehicles side-by-side.

**Card layout (background #F5F5F5, rounded-xl):**
- Two columns inside the card, each representing one inspected vehicle:
  - **Left column:** "BMW 320d" (emphasis text, 16pt medium) — below it: green circle "4" | yellow triangle "2" | red stop "1" — below that: verdict label "Negotiate" in severity-yellow background (#FEF3C7) text (#92400E), small badge
  - **Right column:** "Seat Leon 2019" (emphasis text, 16pt medium) — below it: green circle "6" | yellow triangle "1" | red stop "0" — below that: verdict label "Good condition" in severity-green background (#D1FAE5) text (#065F46), small badge
- A thin vertical divider (#E5E5E5) separates the two columns
- Internal padding: 16px

**Visual notes:**
- This card is the quick comparison — not a full report, just a glanceable summary
- Severity indicators use shapes + color (circle/triangle/octagon), not just color
- The comparison makes it obvious at a glance which vehicle is in better condition

---

### Zone 7: Buyer Education Carousel (~200pt height)

**Position:** Below Help Me Decide, 32px left padding, cards extend to right edge.

**Section header:** "Tips & Insights" in detail text (#A3A3A3), 13pt regular, left-aligned, with 16px bottom margin.

**Content:** A horizontally scrollable carousel of education cards. Show 1.5 cards visible to imply scrolling.

**First card (width ~280px, height ~180px):**
- Card background: #F5F5F5, rounded-xl, subtle shadow
- **Top area:** A subtle illustration placeholder (abstract car silhouette or checklist icon) in muted tones (#E5E5E5 / #A3A3A3)
- **Category tag:** "Pre-Inspection" in a small pill badge, brand-accent (#3D7A8A) text on a light teal background
- **Title:** "5 Things to Check Before You Leave Home" in emphasis text (#171717), 16pt medium
- **Description:** "Preparation makes the difference between..." (truncated) in primary text (#404040), 13pt regular

**Second card (partially visible, ~60% showing):**
- Similar layout, different content
- Category tag: "Model Specific" in a small pill badge
- Title: "BMW 320d: Timing Chain — What to Know"
- This is a Model DNA teaser card mixed into the carousel

**Visual notes:**
- Cards have tactile feel — subtle shadow suggesting they can be swiped
- 12px gap between cards
- The partial visibility of the second card strongly implies horizontal scrolling
- No visible section dividers between general and model-specific content — single mixed feed

---

### Zone 8: Bottom Tab Navigation Bar (~80pt including safe area)

**Position:** Fixed at bottom of screen, full width.

**Tabs (left to right):**
1. **Home** — house icon, label "Home", active state (brand primary #2E4057 tint)
2. **Vehicles** — car icon, label "Vehicles", inactive (#A3A3A3)
3. **Inspections** — checklist icon, label "Inspections", inactive (#A3A3A3)
4. **Profile** — person icon, label "Profile", inactive (#A3A3A3)

**Visual notes:**
- The Home tab is selected/highlighted with the brand primary color (#2E4057)
- Standard iOS tab bar styling with icons above labels
- Thin top border (#E5E5E5) separating tab bar from content
- Safe area padding at the bottom for iPhone home indicator

---

## Global Visual Rules

1. **No emojis anywhere in the UI.** Use simple geometric icons or SF Symbols style icons only.
2. **No gradients.** Flat colors only.
3. **No decorative illustrations.** Keep it professional and minimal. Placeholder areas for illustrations are acceptable as grey boxes with subtle icons.
4. **Severity colors appear ONLY on severity-related data** (finding counts, verdict badges). Never as decorative elements.
5. **All interactive elements are at least 48x48pt** in touch target size.
6. **The overall feeling is: calm, trustworthy, professional, personal.** Like a polished fintech app (think Revolut's clean UI) but warmer — a knowledgeable friend, not a cold dashboard.
7. **Single column layout.** No complex multi-column grids except inside the Help Me Decide comparison card.
8. **Dark mode is NOT shown.** This is light mode only.
9. **Show this as a realistic iPhone mockup** — with device frame, status bar, and home indicator area.

---

## What This Screen Communicates

When a buyer opens Truvis, this Home Screen should instantly communicate:
- "I know who you are" (personalized greeting with name and vehicle count)
- "Here's what to do next" (single clear CTA)
- "Here's where you stand" (vehicle cards with severity at a glance)
- "I'm looking out for you" (co-pilot nudge highlighting what needs attention)
- "I help you decide" (comparison card for multi-vehicle buyers)
- "I make you smarter" (educational carousel building confidence)

The screen should feel like opening a conversation with a knowledgeable friend — not like opening a dashboard.
