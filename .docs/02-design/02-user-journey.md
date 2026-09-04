# User Journey — the one core workflow

- Date: 2026-09-04 (W4, DISCOVER)
- Persona: **Mya**, an international student in Chiang Rai. Allergic to peanuts,
  does not eat pork, dislikes mushrooms, likes chicken and noodles, reads
  English only. She eats out five times a week and orders the same two dishes
  because they are the only ones she is sure about (P1, P2, P3, P4).
  *Illustrative — replace with a real interviewee once interviews are done.*
- Workflow: **food profile in → menu photo → extraction & translation →
  dietary matching → three categories → restaurant-ready order out**
- Product line: **Open → Scan → Decide → Order**

---

## Step-by-step

| # | Screen | Mya does | System does | Traces | Pain relieved |
|---|--------|----------|-------------|--------|---------------|
| J1 | Sign-up / Terms | Creates an account, accepts Terms + the AI & Allergy Safety Disclaimer | Stores acceptance: user id, timestamp, version. States plainly that the app reads a menu photo, cannot inspect a kitchen, and cannot determine allergy safety | F14, LR8, LR10 | — (trust) |
| J2 | Food profile | Adds peanuts as an **allergy**, pork as a **restriction**, mushrooms as a **dislike**, chicken / noodles / spicy as **preferences**, English as her language — about 2 minutes | Stores allergy and restriction under a separate explicit opt-in as sensitive data; keeps the four categories distinct; nothing pre-ticked | F1, F2, LR1, NFR8 | **P3** |
| J3 | Scan — consent | At the restaurant, opens the app and taps **Scan menu** for the first time | Asks consent to send the menu image and dietary flags to the analysis services; lists what is sent and what is never sent | F14, LR2, LR8 | — (trust) |
| J4 | Camera | Photographs the laminated Thai menu on the table | Accepts the photo; no restaurant registration, QR code, or menu upload was ever needed | F3 | **P1** |
| J5 | Processing | Waits ~9 seconds, watching progress | Extracts dish names and prices, detects the language, translates into English, maps each dish to likely ingredients tagged Explicit / Inferred / Unknown | F4, F5, F6, F7, NFR2, NFR3, NFR7 | **P1** |
| J6 | Processing (invisible) | — | Rule engine runs: *กะเพราหมูกรอบ* → pork **Explicit** → **Conflict**. *ผัดไทยไก่* → peanuts **Inferred** → **Check Before Ordering**, never Recommended. Ranks the rest by preference minus dislike minus uncertainty. Stores the whole analysis for reproduction | F8, F9, F10, LR9, NFR5, NFR6 | **P2** |
| J7 | Results | Reads three sections instead of 30 dish names | Shows **★ Top Match — Chicken Basil Rice ฿60** with "chicken matches your preference · spicy matches your preference", then Recommended, then Check Before Ordering, then Conflict — each with a reason line | F11, F12, NFR12 | **P1, P2, P3** |
| J8 | Dish detail | Opens Chicken Pad Thai, which sits under Check Before Ordering | Shows: *"This dish may contain or commonly be served with your allergen. Please confirm with restaurant staff."* — no safety claim, no percentage | F9, F12, NFR6, LR10 | **P2** |
| J9 | Communication | Taps **Ask about this dish** | Generates Thai: *"ฉันแพ้ถั่วลิสง เมนูนี้มีถั่วลิสงหรือส่วนผสมที่มีถั่วลิสงไหมคะ"* — reveals the one restriction, not her whole profile | F13, LR4e, NFR9 | **P4** |
| J10 | Show staff | Turns the phone around full-screen; staff reads it and confirms | Full-screen display, copy, and text-to-speech; stores the generated phrase, language, dish, and timestamp | F15, F16, LR9 | **P4** |
| J11 | Order | Picks the Top Match instead and taps **Order this** | Generates the order line with her modifications: *"ขอกะเพราไก่ ไม่ใส่เห็ด เผ็ดน้อยคะ"* | F13 | **P4** |
| J12 | Done | Eats | Saves the scan to history so the next visit to this restaurant needs no rescan | F20 | P3 |

**Total: one profile setup (once, ~2 min) + one photo + about 30 seconds of
reading.** That is the claim NFR1 has to prove against Google Translate and a
generic AI assistant.

## Alternate & failure paths

| # | Trigger | System behaviour | Traces |
|---|---------|------------------|--------|
| A1 | OCR, translation, or analysis unavailable at J5 | Within 5 seconds, a plain-language notice and a retry — never a raw error, and never a partial dish list presented as a complete menu | F18, NFR10 |
| A2 | Free-tier cap reached (40 scans/month) | Blocks server-side, explains the cap | NFR11 |
| A3 | The photo is too blurry / angled to extract | Says extraction failed and asks for another photo, rather than returning a short, wrong dish list | F3, NFR2 |
| A4 | A dish name is misread ("ไก่" read as "ไข่") | Mya edits the dish name in place; the analysis re-runs for that dish only, no rescan | F17 |
| A5 | Every dish on the menu conflicts | Shows the Conflict list honestly with reasons, plus the generated Thai question so she can ask for an off-menu modification — it does not manufacture a recommendation | F12, F13 |
| A6 | Mya withdraws AI-transfer consent later | Scanning is disabled; the withdrawal is stored the same way the consent was | LR8 |
| A7 | Mya deletes her account | Profile, allergy list, saved scans, menu images, and generated phrases deleted; access logs retained ≥90 days by law | LR4c, LR6 |
| A8 | The menu photo caught a diner's face in the background | The raw image is deleted within 24h of extraction; incidental data is never used; she can delete the image immediately | LR3, NFR13 |
| A9 | A dish with an **explicitly** named allergen slipped into Recommended | Release blocker — NFR5 recall is 100%, not a target; the stored analysis record makes the failure reproducible | NFR5, LR9 |

## Drop-off risks

| Risk | Where | Mitigation | Traces |
|---|---|---|---|
| **Profile setup feels like a form wall before any value** — the user has to give before they get | J2 | Under 3 minutes, four short lists, and the payoff is immediate on the very first scan | NFR8, F1 |
| **A bad photo produces a bad menu, and the user blames the app once** | J4, J5 | ≥90% extraction on real photographed menus, in-place correction (F17), and an honest "try again" rather than a silent partial result | NFR2, F17, A3 |
| **Warnings become noise** — if half the menu says "check with staff", the user stops reading warnings | J7, J8 | Evidence levels keep *Check Before Ordering* to genuinely inferred allergens; conflict precision ≥85% so the tool does not rule out most of the menu | NFR5, NFR6, F7 |
| **The user does not trust a recommendation they cannot see the reason for** | J7 | Every dish carries a plain reason line; the dish detail shows which ingredients were Explicit and which were Inferred | F12, F7 |
| **The at-the-table moment is socially awkward** — turning a phone around at a busy counter | J10 | Full-screen large Thai text and text-to-speech, so the phrase can be shown or heard in one action | F15, F16 |
| **A generic AI assistant is good enough** — the real competitive risk | whole journey | The saved profile (J2) removes the re-explaining step, and J7's three categories replace reading a paragraph. NFR1 measures whether that is actually faster | NFR1 |

## Pain coverage check

- **P1 (H)** (unreadable menu) → J4, J5, J7
- **P2 (H)** (hidden ingredient risk) → J6, J7, J8
- **P3 (H)** (slow one-by-one effort) → J2, J7, J12
- **P4 (H)** (communication barrier) → J9, J10, J11

Every pain is relieved at a named step. Every pain is still a hypothesis —
that is the gap the W5 interviews have to close.
