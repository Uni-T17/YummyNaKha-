# Data Sources and Permissions — YummyNaKha!

Every piece of data the system or our tests use, where it came from, and what
we are allowed to do with it. **TO CONFIRM** means the repository does not
record the licence or permission. The team must check it before saying the use
is allowed.

## 1. Data inside the app

| Data | Source | How we use it | Licence / permission | Where |
|---|---|---|---|---|
| Thai dish guide: dish names, Thai spellings, English names, descriptions, spice, ingredients | Written by the team | Matches menu lines to dishes and their ingredients | Our own work. **Draft** until a Thai-literate team member reviews it | [`lib/server/thai-food/`](../../YummyNaKha_App/lib/server/thai-food) |
| Extra dish **names**, romanizations, regions | Kaggle "Thai food" list (`thailand_foods.csv`, 324 dishes) | Names only, to fill gaps in the guide (`dishes-datasets.ts`) and as a benchmark list. Its ingredient lists are **not** used, because they leave out allergens | **TO CONFIRM**: the Kaggle dataset's licence and link are not recorded in the repo | [`dishes-datasets.ts`](../../YummyNaKha_App/lib/server/thai-food/dishes-datasets.ts), [`kaggle-thai-dishes.txt`](../../YummyNaKha_App/scripts/test-menus/kaggle-thai-dishes.txt) |
| Prepared-dish **names** | Thai Food Composition Tables 2015, INMU, Mahidol University, via Hugging Face `BaoWio/Thai_Nutrition_Dataset` | Names only, for the guide and a benchmark list | **CC BY-SA 4.0**, as stated in the benchmark file's header. Attribution is given there. **TO CONFIRM** whether INMU's own terms allow this | [`inmu-prepared-dishes.txt`](../../YummyNaKha_App/scripts/test-menus/inmu-prepared-dishes.txt) |
| Ingredient allergen groups | Written by the team | Avoid-list matching | Our own work, draft | [`ingredients.ts`](../../YummyNaKha_App/lib/server/thai-food/ingredients.ts) |

## 2. Third-party software and services

| Component | Used for | When data is sent | Licence / terms |
|---|---|---|---|
| PaddleOCR 3.7.0 / PaddlePaddle 3.3.1, models `PP-OCRv5_mobile_det` and `th_PP-OCRv5_mobile_rec` | Reading menu photos on our own server (default) | Never: it runs on our machine | Apache 2.0 (PaddleOCR project). **TO CONFIRM** for the model files |
| OCR.space API | Optional photo reader (`NEXT_PUBLIC_OCR_PROVIDER=ocrspace`) | Photo only, after the user agrees on the consent screen (LR2) | OCR.space terms of service, free tier |
| Google Gemini API | Optional "Menu helper": pairs dishes with a meat list and describes unlisted dishes | Menu text only, and only with the separate Menu helper consent | Google Gemini API terms |
| Google sign-in (OAuth) | Optional sign-in | We receive name, email and Google account ID only, and store no Google tokens (LR6) | Google OAuth terms |
| Vercel, Neon/PostgreSQL | Hosting the live app and database | All stored app data | Provider terms. See [DEPLOY.md](../../YummyNaKha_App/DEPLOY.md) and [DEPLOY-FREE.md](../../YummyNaKha_App/DEPLOY-FREE.md) |

## 3. Test and evaluation data

| Data | Source | Permission | Where |
|---|---|---|---|
| 6 generated Thai menus (96 dishes) | Made by the team | Our own work | [v1-vs-v2 evidence](../03-testing/evidence/2026-11-16-v1-vs-v2/README.md) |
| 1 real 2-page café menu (26 dishes) | Photo of a real café menu | **TO CONFIRM**: the repo does not record the café's name or permission to publish the photo. Remove or blur the photo if there is no permission | same folder, `images/real-cafe-menu.jpg` |
| Synthetic menu images rendered from HTML | Made by the team | Our own work | [API and sweep evidence](../03-testing/evidence/2026-11-17-api-and-sweep/README.md) (`fx/`) |
| Survey (n = 6, Sep 2026) | Our survey | Respondents' answers, summarised as pains P1–P5. The raw export is not in the repo | [spec §1](../01-requirements/01-spec/20260907-01-menu-scan-personalization.md) |
| Real-user test (n = 16, 16 Nov 2026) | Our Google Form "YummyNaKha! — Tester survey" | Every participant agreed in the form that their answers are anonymous and used only for this course project, that they used a fictional preference card and not their own health data, and that they could stop at any time. Coded U01–U16, with no names or emails | [user-test/README.md](../03-testing/user-test/README.md), [sessions.csv](../03-testing/user-test/sessions.csv) |
| Test accounts | `@example.test` (test runs) and `tester@yummynakha.test` (seed script) | Test-only, with no real people | [02-test-results.md](../03-testing/02-test-results.md), [seed-test-user.ts](../../YummyNaKha_App/scripts/seed-test-user.ts) |

## 4. Personal data the system stores

These are covered by the PDPA rules in [rule.md](../../rule.md) (LR1–LR12 in
the [spec](../01-requirements/01-spec/20260907-01-menu-scan-personalization.md)).
The full table list is in the [ER diagram](../02-design/04-diagrams/05-er-diagram.md).

- **Ordinary personal data:** account name and email, Favourites, ordinary dislikes, spice level.
- **Sensitive health data:** Avoid items with reason *allergy* or *doctor*. These are stored only after the separate `health-data` opt-in and deleted when that consent is withdrawn (LR1).
- **Menu photos:** the bytes are deleted once OCR succeeds (LR5).
- **Access logs:** account ID, IP, method, path, status and time, kept separate from content (LR7). The code sets a 120-day retention.
- **Account deletion** removes all user content (LR5).
