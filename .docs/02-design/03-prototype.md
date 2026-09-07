# Prototype — low-fidelity wireframes

- Date: 2026-09-04 (W4, DISCOVER)
- Fidelity: **low — layout and content only.** No production code; BUILD starts W6.
- Owner: **_TBD_ (Designer)** produces the visual version.
- Visual file: _link the Figma / Canva / scanned sketch here before W5_ →
  `TODO: <link>`

These wireframes fix *what is on each screen and why*. Colour, type, and spacing
are the Designer's call — **except the warning wording, which is fixed by
LR10 / NFR6 and may not be reworded.**

---

## S1 — Food profile · F1, F2, LR1

```
┌─────────────────────────────────┐
│  ← My food profile              │
├─────────────────────────────────┤
│  ⛔ ALLERGIES        sensitive   │
│     Peanuts        [ x ]        │
│     [ + add allergy ]           │
├─────────────────────────────────┤
│  ✗ I DON'T EAT                  │
│     Pork           [ x ]        │
│     [ + add ]                   │
├─────────────────────────────────┤
│  😐 DISLIKES                     │
│     Mushrooms      [ x ]        │
├─────────────────────────────────┤
│  ♥ I LIKE                       │
│     Chicken · Noodles · Spicy   │
├─────────────────────────────────┤
│  🌐 Show menus in  [ English ▾ ] │
│                                 │
│         [    Save profile    ]  │
└─────────────────────────────────┘
```
Four **separate** lists, not one "restrictions" box — the split is what lets an
allergy trigger a warning while a dislike only lowers a rank (F2). The
"sensitive" tag on allergies is where the LR1 opt-in lives. Nothing is
pre-ticked. Setup target: under 3 minutes (NFR8).

## S2 — Consent (first scan only) · F14, LR2, LR8

```
┌─────────────────────────────────┐
│  Before your first scan         │
├─────────────────────────────────┤
│  We send for analysis:          │
│    ✓ your menu photo            │
│    ✓ the text we read from it   │
│    ✓ your dietary flags         │
│                                 │
│  We never send:                 │
│    ✕ your name or email         │
│    ✕ your phone or device id    │
│                                 │
│  ⚠ We read the menu, not the    │
│    kitchen. We cannot tell you  │
│    a dish is allergy-free.      │
│                                 │
│  [ ] I agree to the Terms & the │
│      AI and Allergy Safety      │
│      Disclaimer                 │
│  [ ] I consent to the above     │
│      data being sent            │
│                                 │
│         [  Continue  ]          │
└─────────────────────────────────┘
```
Two **separate** checkboxes — Terms acceptance and third-party transfer consent
are different consents (LR2, LR8). The middle box is the disclaimer in one
sentence: it is the honest version of the product's limit, shown before the user
relies on anything.

## S3 — Scan · F3, NFR7

```
┌─────────────────────────────────┐
│                                 │
│     ┌───────────────────┐       │
│     │   camera preview  │       │
│     │  ┌─────────────┐  │       │
│     │  │ กะเพราหมูกรอบ 65│  │       │
│     │  │ กะเพราไก่    60│  │       │
│     │  │ ผัดไทยไก่    70│  │       │
│     │  └─────────────┘  │       │
│     └───────────────────┘       │
│   Fit the whole menu in frame   │
│                                 │
│      (  ◉  )      [ Gallery ]   │
└─────────────────────────────────┘
```
One action. No restaurant setup, no QR code, no account for the restaurant —
the menu on the table is the entire input (F3). Progress must appear within 1
second of the shutter (NFR7).

## S4 — Results · F11, F12, NFR12

```
┌─────────────────────────────────┐
│  ← 30 dishes · Somchai Kitchen  │
├─────────────────────────────────┤
│  ★ TOP MATCH                    │
│  Chicken Basil Rice      ฿60    │
│  กะเพราไก่                       │
│  ♥ chicken · ♥ spicy            │
├─────────────────────────────────┤
│  RECOMMENDED             (4)    │
│  Chicken Noodles         ฿55    │
│  ♥ chicken · ♥ noodles          │
│  Grilled Chicken Rice    ฿55  › │
├─────────────────────────────────┤
│  ⚠ CHECK BEFORE ORDERING  (6)   │
│  Chicken Pad Thai        ฿70    │
│  ♥ chicken · ⚠ peanuts may be   │
│    present — ask staff        › │
├─────────────────────────────────┤
│  ✗ CONFLICT              (9)    │
│  Crispy Pork Basil Rice  ฿65    │
│  ✗ contains pork              › │
└─────────────────────────────────┘
```
Three categories, one Top Match, a reason under every dish (F11, F12). Counts
per section let the user see the menu was fully processed. **No score, no
percentage, no "safe" badge anywhere** — the categories *are* the ranking
display (NFR6, LR10).

## S5 — Dish detail · F7, F9, F12, LR10

```
┌─────────────────────────────────┐
│  ← Chicken Pad Thai      ฿70    │
│     ผัดไทยไก่                    │
├─────────────────────────────────┤
│  ⚠ CHECK BEFORE ORDERING        │
│                                 │
│  This dish may contain or       │
│  commonly be served with your   │
│  allergen. Please confirm with  │
│  restaurant staff.              │
├─────────────────────────────────┤
│  FROM THE MENU TEXT             │
│  • Chicken            ♥ liked   │
│  • Rice noodles       ♥ liked   │
│                                 │
│  COMMONLY IN THIS DISH          │
│  ~ Peanuts        ⚠ your allergy│
│  ~ Egg                          │
│  ~ Fish sauce                   │
│  (not stated on the menu)       │
├─────────────────────────────────┤
│ [ Ask about this dish ]         │
│ [ Order with changes  ]         │
└─────────────────────────────────┘
```
The two ingredient blocks are the Explicit / Inferred split made visible (F7).
"(not stated on the menu)" is the line that stops an inference from reading as a
fact. The warning sentence is fixed wording under LR10 — it is the only
permitted phrasing for an uncertain allergen, and it may not be shortened to
"may contain peanuts" or softened to "probably fine".

## S5b — A clear dish · F8, F12, LR10

```
┌─────────────────────────────────┐
│  ← Chicken Basil Rice    ฿60    │
├─────────────────────────────────┤
│  ★ TOP MATCH                    │
│                                 │
│  No conflicting ingredient was  │
│  detected from the available    │
│  menu information.              │
│                                 │
│  ♥ chicken matches your         │
│    preference                   │
│  ♥ spicy matches your           │
│    preference                   │
└─────────────────────────────────┘
```
This screen exists to fix the wording of the *best possible* outcome. Even the
Top Match does not say "safe" — it says what was and was not detected (LR10,
NFR6). Getting this sentence right is the whole safety posture of the product.

## S6 — Restaurant communication · F13, F15, F16

```
┌─────────────────────────────────┐
│  Show this to the staff         │
├─────────────────────────────────┤
│                                 │
│   ฉันแพ้ถั่วลิสง                  │
│   เมนูนี้มีถั่วลิสงหรือ            │
│   ส่วนผสมที่มีถั่วลิสงไหมคะ        │
│                                 │
├─────────────────────────────────┤
│  I have a peanut allergy. Does  │
│  this dish contain peanuts or   │
│  peanut ingredients?            │
├─────────────────────────────────┤
│  [ 🔊 Play ] [ ⧉ Copy ] [ ⛶ Full ]│
│                                 │
│  [ EN ] [ ไทย ]                  │
└─────────────────────────────────┘
```
Thai first and largest — the reader is the staff member, not the user (F13).
The English line below is for the user's own confidence. One restriction is
shown, never the full allergy list (LR4e). Full-screen and speech are the two
ways to survive a loud restaurant (F15, F16).

## S6b — Order with modifications · F13

```
┌─────────────────────────────────┐
│  ← Order                        │
├─────────────────────────────────┤
│  Chicken Basil Rice             │
│  [x] no mushrooms               │
│  [x] less spicy                 │
│  [ ] no fish sauce              │
├─────────────────────────────────┤
│   ขอกะเพราไก่ ไม่ใส่เห็ด          │
│   เผ็ดน้อยคะ                     │
├─────────────────────────────────┤
│  [ 🔊 Play ]  [ ⛶ Show staff ]   │
└─────────────────────────────────┘
```
The modification checkboxes are pre-filled from the profile's dislikes, so the
order line writes itself. This is the last step of *Open → Upload menu → Decide
→ Order* — the journey ends with food ordered, not with a list displayed.

## S7 — Extraction unavailable · F18, NFR10

```
┌─────────────────────────────────┐
│  ⚠ We couldn't read this menu   │
│                                 │
│  The analysis service isn't     │
│  responding right now.          │
│                                 │
│  [    Try again    ]            │
│  [  Use a new photo ]           │
└─────────────────────────────────┘
```
No raw error, and — just as important — **no partial dish list shown as if it
were the whole menu** (NFR10). A half-read menu is worse than no menu when the
missing half is the one with pork in it.

---

## Screen ↔ requirement map

| Screen | Requirements |
|---|---|
| S1 Food profile | F1, F2, F19, LR1, NFR8 |
| S2 Consent | F14, LR2, LR8, LR10 |
| S3 Scan | F3, LR2, LR3, NFR7 |
| S4 Results | F10, F11, F12, NFR5, NFR6, NFR12 |
| S5 Dish detail (uncertain) | F7, F9, F12, NFR6, LR10 |
| S5b Dish detail (clear) | F8, F12, LR10 |
| S6 Communication | F13, F15, F16, LR4e, LR9, NFR9 |
| S6b Order with changes | F13, F1 |
| S7 Unavailable | F18, NFR10, NFR11 |

## Fixed copy — not the Designer's call

| Situation | The only permitted wording |
|---|---|
| Nothing detected against the profile | "No conflicting ingredient was detected from the available menu information." |
| Allergen inferred or unknown | "This dish may contain or commonly be served with your allergen. Please confirm with restaurant staff." |
| Anywhere | **Never** "safe", "allergy-safe", "guaranteed", "certified", "verified", "100% free", or a safety percentage (LR10, NFR6) |

Not prototyped this phase: F17 in-place correction (Should — a small inline edit
on S4), F20 scan history (Should), F21–F23 (Could), F24–F25 (Won't).
