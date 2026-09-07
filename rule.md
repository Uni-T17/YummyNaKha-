**5-Idiots — Legal & Compliance Rules (rule.md)**

6631503089  Tay Zar Tun
6631503052  Aike Paung Bra
6631503055  Chan Nyein Thu
6631503093  Thiri Kyaw Khaing
6631503099  Yoon Nadi

**Product: YummyNaKha!** — Thai menu image upload, dish & price extraction,
Thai → English translation, ingredient inference, personalized recommendation
against a saved food profile, and selected dishes shown back in Thai for
ordering.

These rules apply to every requirement and every agent behaviour. When a
requirement spec is written, the Must-have rules below are folded into it as
numbered legal requirements (LR1, LR2, LR3…). `rule.md` is not left as a
standalone file only.

---

## PDPA (Personal Data Protection Act)

**What it is:** Thailand's law on how personal data is collected, used, and
disclosed, giving individuals rights over their own data. Data that reveals
health — and certain other categories — is *sensitive* data with stricter
conditions (Section 26).

**What it requires:** lawful basis / consent · purpose limitation · data
minimisation · access / correct / delete · extra care for sensitive data ·
disclosure of transfers to third parties.

**Rules for the agent:**

- Treat ordinary food-preference data — spicy level, soft / hard food, favourite
  foods, dislikes — as **normal personal data** when it is linked to an
  identifiable user. It is not automatically sensitive health data.

- Treat **allergies, medical conditions, and doctor-advised food restrictions**
  separately, as **potentially sensitive health data**. Collect them only under
  an appropriate Section 26 basis (explicit consent), never as a silent default,
  and keep them editable and deletable by the user.

- Before any profile or menu data is sent to a third-party OCR / AI provider,
  **tell the user** what data is processed and that an external provider
  receives it.

- Send **only the data necessary** to produce a recommendation — dish / menu
  text and the relevant profile flags. Do not send the account email, real name,
  or other identifiers the recommendation does not need.

- Use profile and menu data **only for the purposes disclosed** to the user
  (menu understanding and personalized recommendation) — not for advertising,
  resale, or profiling — unless the user opts in separately.

- Provide **deletion and account-deletion handling**: on account deletion,
  remove the food profile, uploaded menu images, extracted results, and history
  within the stated retention window.

- **Protect authentication credentials.** If social or email login is used,
  store only a verification token, never the provider password.

*Testable examples:* a new account has no allergy / medical flag set until an
explicit opt-in record exists; the outbound request to the AI provider carries
no account email or real name; delete account → no profile / image / history
rows remain.

---

## Computer Crime Act §26

**What it is:** A Thai law that can require service providers to keep computer
traffic data so the origin of an online action can be traced if a competent
authority requests it.

**What it requires:** where the obligation applies — keep traffic data ≥ 90
days, plus the user-identification information needed for attribution.

**Rules for the agent:**

- If YummyNaKha! falls within the applicable service-provider obligations,
  **maintain the required computer traffic data for at least 90 days**, and the
  relevant user-identification information for the required period.

- Traffic logging may include appropriate connection / access information —
  timestamps, IP / network information, and the identifiers needed to attribute
  an action to an account.

- Keep this traffic log **separate from the content** it describes.

- **Do not** automatically retain food profiles, menu images, scan history, or
  selected dishes for 90 days *merely because of §26*. Their retention follows
  their actual purpose and the PDPA requirements above — not the traffic-log
  rule.

*Testable example:* a login / upload action has a matching traffic-log row with
account identifier, IP, and timestamp, stored apart from the menu image itself;
deleting the menu image does not delete that row before its retention period
ends.

---

## Electronic Transactions Act (§9 / 26 / 28)

**What it is:** A Thai law giving electronic records and electronic signatures
legal standing when they reliably link to the signer and can be retained and
reproduced.

**What it requires:** electronic records that can be **retained and retrieved**;
valid e-signature conditions (identification, intention, reliability); no false
certification claims.

**Rules for the agent:**

- Design the electronic acceptance of the **Terms, privacy notice, and the
  AI & Accuracy Disclaimer** so the record can be retained and retrieved when
  needed: store the user / account identifier, the document and version
  accepted, the timestamp, and the acceptance action. Store a **withdrawal** of
  consent the same way.

- If the product relies on **electronic signatures** for any step, apply the
  Act's conditions on identification of the signer, the signer's intention, and
  the reliability of the method.

- Keeping **AI-processing records** — model / version, OCR result, translation,
  profile snapshot, timestamp, and the recommendation shown — is useful for
  auditability and troubleshooting and is recommended as an internal quality
  measure. Do **not** state that §§9 / 26 / 28 specifically mandate an AI audit
  log.

- **Avoid unsupported product claims.** The UI must not say "certified safe",
  "nutritionist approved", "doctor approved", "100% accurate", or similar,
  unless a real certifying party or professional is actually involved.

*Testable examples:* fetch by user ID returns the version and timestamp for each
Terms / disclaimer acceptance and for any withdrawal; a UI copy scan finds no
"certified" / "100% accurate" claims.

---

## Product safety rule (applies with the laws above)

YummyNaKha! must **never state that a dish is safe** for a user's allergy or
medical restriction based only on menu information. A menu image may not show
hidden ingredients, sauces, garnishes, cooking oil, or preparation and
cross-contact in the kitchen.

- The only permitted phrasing for a clear result is that **no conflicting
  ingredient was detected from the available menu information**.
- Never show a safety score or percentage. Use the three categories only:
  🟢 recommended · 🟡 check before ordering · 🔴 conflict.
- Every 🟡 and 🔴 result tells the user to **confirm with restaurant staff**.
