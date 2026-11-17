# Lean Canvas — YummyNaKha!

Built **only** from the [Charter](../../YummyNaKha!%20-%20Charter.md) and the
[Project Brief](../../YummyNaKha_Project_Brief.md). No new claims: where neither
document says anything, the box says so. Section references are given in brackets.

> *Don't just translate the menu. Find what's yummy for you.* (Brief, tagline)

| | |
|---|---|
| **1. Problem** | • A Thai-only menu is unreadable to many international students and foreigners, so ordering depends on guesswork, pointing or asking staff across a language gap.<br>• A translation app gives a dish's name, not whether it fits the diner's favourite foods.<br>• Diners with allergies or doctor-advised restrictions can't tell from a translated name whether a dish may contain something they must avoid; checking dish by dish is slow and error-prone. (Charter §2, Brief §3) |
| **Existing alternatives** | Translation apps, guesswork, pointing, asking staff; falling back on a familiar dish or avoiding unfamiliar restaurants. (Charter §2, Brief §3) |
| **2. Customer segments** | • **Primary:** people who can't easily read Thai menus — especially international students and foreigners in Thailand.<br>• **Secondary:** people with food allergies or doctor-advised restrictions who need to check a menu before ordering. (Brief §2, Charter §4) |
| **Early adopters** | *Not stated in the Charter or Brief.* |
| **3. Unique value proposition** | One app that joins translation, personalisation and an allergy / restriction check, so a diner decides faster and with more confidence than translating a menu line by line. (Charter §1) |
| **High-level concept** | *Not stated in the Charter or Brief.* |
| **4. Solution** | • Save a food profile once: favourites, allergies, doctor-advised restrictions.<br>• Upload a photo of a Thai menu; extract each dish and price; translate Thai → English; infer likely ingredients.<br>• Check every dish against the profile → 🟢 recommended / 🟡 check before ordering / 🔴 conflict.<br>• Select dishes and show them back in Thai to order. (Charter §1, §5; Brief §1, §5) |
| **5. Channels** | *Not stated in the Charter or Brief.* (The Charter's Deliver phase names a "working deployed system", not a channel to users.) |
| **6. Revenue streams** | *Not stated in the Charter or Brief* — this is a course project (SE Case Studies, 1305493, 1/2569). |
| **7. Cost structure** | Third-party OCR / language-model services with usage costs and rate limits; the app must degrade gracefully when a service is unavailable. (Charter §6 "AI Cost & Availability", Brief §6) |
| **8. Key metrics** | Time to find and select suitable dishes — the user's current method vs. YummyNaKha! — with real users (**15+**); secondary: number of steps to a decision. Also extraction / translation accuracy and usability in the Test phase. (Brief §7, Charter §3, §7) |
| **9. Unfair advantage** | *Not stated in the Charter or Brief.* |

## Boundaries the canvas must respect (Brief §8, Charter §5–6)

- Thai-language menus only, Thai → English only, upload rather than live camera, no
  restaurant-side setup, and no voice output.
- Results are warnings to confirm with restaurant staff, **never** a guarantee that a
  dish is safe; no "safe", "guaranteed" or "certified" wording.
- Risks: extraction accuracy depends on image quality; menus hide ingredients; AI
  inference can be wrong; kitchen preparation and cross-contact can't be verified.

*Note:* both source documents still describe the September design (AI-inferred
ingredients, third-party AI). Later decisions, such as the reviewed Thai dish guide and
the narrowed voice rule, are in the
[spec's team decisions](01-spec/20260907-01-menu-scan-personalization.md) and are
deliberately **not** added here.
