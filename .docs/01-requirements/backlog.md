# Backlog — YummyNaKha!

Prioritised by MoSCoW. Every row traces to a requirement ID and an interview
pain (or a legal requirement). Source spec:
[20260904-01-menu-scan-personalization.md](01-spec/20260904-01-menu-scan-personalization.md).

Pains: **P1 (H)** unreadable menu · **P2 (H)** hidden ingredient risk ·
**P3 (H)** slow one-by-one decision effort · **P4 (H)** communication barrier at
the table.

> **(H) = hypothesis, not yet validated.** Every Must row below rests on a pain
> that has not yet been confirmed by a real user interview. This is the single
> biggest open risk before the W5 User Validation Gate.

## Must

| # | Item | Traces to |
|---|------|-----------|
| B1 | Food profile: allergies, dietary restrictions, dislikes, preferences, preferred language | F1, P3 |
| B2 | Keep the four profile categories structurally distinct — an allergy is never handled as a dislike | F2, P2 |
| B3 | Menu photo capture / upload from the device | F3, P1 |
| B4 | Dish name extraction from the menu image (OCR + menu structure detection) | F4, P1 |
| B5 | Price extraction, attached to the correct dish | F5, P1 |
| B6 | Dish name translation into the user's preferred language | F6, P1 |
| B7 | Dish → ingredient mapping with evidence level: Explicit / Inferred / Unknown | F7, P2 |
| B8 | Dietary rule engine: explicit restricted ingredient → **Conflict**, with the reason | F8, P2 |
| B9 | Allergen uncertainty rule: inferred or unknown allergen → **Check Before Ordering**, never Recommended | F9, P2 |
| B10 | Preference / dislike ranking score across the whole menu | F10, P3 |
| B11 | Three-category results screen: Recommended (with Top Match) / Check Before Ordering / Conflict | F11, P1, P3 |
| B12 | Plain-language reason line under every dish in every category | F12, P2, P3 |
| B13 | Restaurant-ready Thai text: allergen question and order-with-modifications | F13, P4 |
| B14 | Terms + AI & Allergy Safety Disclaimer gate before the first scan | F14, P2 |
| B15 | Explicit separate opt-in for allergy / dietary restriction data; editable and deletable | LR1 (PDPA) |
| B16 | Third-party transfer disclosure + consent; payload carries menu image/text and dietary flags only, no identifiers | LR2 (PDPA) |
| B17 | Raw menu image deleted within 24h of extraction, user-deletable immediately; incidental bystander data never used | LR3 (PDPA), NFR13 |
| B18 | Purpose limit on profile/scan data; optional restaurant name & geolocation off by default; full delete on account deletion; login stores token only; shared phrase reveals one restriction, not the profile | LR4 (PDPA) |
| B19 | Creation/upload log: account ID + IP + timestamp, separate from content | LR5 (CCA §26) |
| B20 | Edit/delete log retained ≥90 days after the content is deleted | LR6 (CCA §26) |
| B21 | Extended-retention hold flag (up to 1 year); retain removed content internally | LR7 (CCA §26) |
| B22 | Retrievable acceptance & consent records, including withdrawal (user ID, timestamp, version) | LR8 (ETA §9/26) |
| B23 | Reproducible analysis record: extracted text, translation, inferences + evidence levels, categories, profile snapshot, model version, timestamp, generated phrase | LR9 (ETA §9/26) |
| B24 | Append-only admin override store; automated copy scan blocking all safety/certification wording | LR10 (ETA §26/28), NFR6 |

## Should

| # | Item | Traces to |
|---|------|-----------|
| B25 | Full-screen + copy the generated Thai text for showing staff | F15, P4 |
| B26 | Text-to-speech playback of the generated phrase | F16, P4 |
| B27 | Manually correct a misread dish name or price without rescanning | F17, P1 |
| B28 | Degraded-mode notice + retry when OCR / translation / analysis is unavailable | F18, P1, P3 |
| B29 | Edit / delete profile, saved scans, and uploaded menu photos | F19, P2 |
| B30 | Scan history: reopen a previous restaurant's results | F20, P3 |

## Could

| # | Item | Traces to |
|---|------|-----------|
| B31 | Report a wrong classification (missed conflict / false conflict) | F21, P2 |
| B32 | Robust extraction for angled, glossy, or low-light menu photos | F22, P1 |
| B33 | Languages beyond Thai → English | F23, P1 |

## Won't (this phase)

| # | Item | Traces to |
|---|------|-----------|
| B34 | Restaurant registration, restaurant accounts, POS integration, booking, delivery, payment | F24 |
| B35 | Nutrition / calorie calculation, maintained restaurant-menu database, social reviews, community-contributed menus | F25 |
| B36 | Any allergy-safety guarantee, certification claim, or cross-contamination / kitchen verification | LR10, NFR6 |
