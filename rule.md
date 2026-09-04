**YummyNaKha! — Legal & Compliance Rules (rule.md)**

Aike Paung Bra(6631503052) - Project Owner
Tay Zar Tun(6631503089) - QA / Tester
Chan Nyein Thu(6631503055) - AI Lead
Thiri Kyaw Khaing(6631503093) - Tech Lead
Yoon Nadi(6631503099) - Designer

**Product: YummyNaKha!** 
YummyNaKha! is a personalized restaurant menu assistant. Users take or upload a menu photo, and the system:
- Translates the menu into their preferred language
- Identifies possible allergy or dietary conflicts
- Recommends dishes based on favorite foods and dislikes
- Generates translated questions or ordering messages for restaurant staff

**PDPA (Personal Data Protection Act)**

**What it is:** Thailand's law governing how personal data is collected, used,
and disclosed, giving individuals rights over their own data — including data
that reveals health, religion, or belief, which is *sensitive* data needing
explicit consent.

**What it requires:** consent · purpose limit · minimise · access/correct/delete
· sensitive data · disclosure to third parties / cross-border transfer

**Rules for the agent:**

\- If the system stores an allergy list or a dietary restriction that can reveal
health or religion (peanut/shellfish allergy, coeliac, diabetic, halal, no pork,
no beef, vegetarian on religious grounds), it must treat it as **sensitive
personal data** and collect it under explicit, separate opt-in consent — never
as a silent default and never pre-ticked.

\- If the system sends a menu photo, extracted menu text, or the user's dietary
flags to a third-party OCR, translation, or AI service, it must disclose that
transfer, obtain consent before the first scan, and send the **minimum** fields
needed (the menu image or extracted text \+ dietary flags) — never the account
email, real name, phone number, or device identifiers.

\- If the menu photo incidentally captures other people's faces, a receipt, a
name card, or any bystander's personal data, the system must not use that data
for any purpose, must not retain the raw image longer than needed to extract the
menu, and must let the user delete the raw image while keeping the extracted
dish list.

\- If the system stores a scan history, it must use it only for showing the user
their own past scans and for improving extraction accuracy — not for
advertising, resale, restaurant profiling, or building a public menu database —
unless the user opts in separately.

\- If the system stores geolocation or a restaurant name alongside a scan, that
is optional data, must be off by default, and must be deletable independently of
the scan itself.

\- If the user deletes their account, the system must delete the food profile,
allergy list, saved scans, menu images, and generated communication history, and
must not retain them in backups beyond the stated retention window (access logs
excepted — see CCA §26).

\- If the system uses a social or email login, it must store only a verification
token, never the provider password or credential.

\- If the user shares a result or a generated order (e.g. sends it to a dining
companion or shows it to staff), the shared output must not reveal the user's
full allergy list or other profile data beyond the single dish and the single
restriction being communicated.

**Computer Crime Act §26**

**What it is**: A Thai law requiring service providers to keep traffic/access
logs so the origin of an online action can be traced if authorities request it.

**What it requires**: keep an access/traffic log ≥90 days, tied to a real user

**Rules for the agent:**

\- If the system lets a user create or upload content (a menu photo, a corrected
dish name, a saved scan, a custom communication phrase, a feedback report on a
wrong classification), it must log the account ID, IP address, and timestamp
separately from the content itself.

\- If the system has an edit or delete action on a food profile, a saved scan, a
corrected dish, or a generated phrase, it must log actor identity, IP, and
timestamp, kept for ≥90 days even if the item is later deleted.

\- If a competent authority requests extended retention on a specific record
(for example a menu image involved in a complaint), the system must support
flagging that record to keep it up to 1 year without altering its content.

\- If a menu scan or generated phrase is taken down (an offensive OCR artefact,
a complaint from a restaurant, an unsafe recommendation report), the system must
still retain the original content and its log internally for the required
period.

\- If the system stores logs on third-party cloud infrastructure, it must
configure retention to ≥90 days, since default cloud settings are often shorter.

**Electronic Transactions Act §9 / 26 / 28**

**What it is:** A Thai law giving electronic records the same legal standing as
paper writing, and recognizing e-signatures as valid when they reliably link to
the signer.

**What it requires**: valid e-signature test (§9) · presumed-reliable signature
(§26) · CA duties (§28)

**Rules for the agent:**

\- If the user clicks "I agree" on the Terms of Use / **AI & Allergy Safety
Disclaimer**, the system must record the user ID, timestamp, and terms version
as a retrievable acceptance record.

\- If the user gives explicit consent for sensitive allergy/dietary data or for
sending menu images and dietary flags to a third-party AI service, the system
must store that consent as a retrievable, timestamped, versioned record — and
store its withdrawal the same way.

\- If the system shows a personalized menu analysis, it must store the exact
extracted menu text, the translation shown, the ingredient inferences with their
evidence level (Explicit / Inferred / Unknown), the category assigned to each
dish, the food-profile snapshot used, the model/version, and the timestamp, so
the exact result shown to the user can be reproduced in a later dispute — for
example if a user reports an allergic reaction after ordering.

\- If the system generates restaurant communication text (an allergy question or
an order with modifications), it must store the generated text, its language,
the dish it referred to, and the timestamp as a retrievable record, since that
text is what the user relied on at the table.

\- If the system sends a confirmation (e.g. "profile saved", "scan complete"),
it must store that confirmation as a retrievable record, not just a transient UI
notice.

\- If a moderator or admin removes or overrides a result (e.g. a dish wrongly
marked Recommended that contains a declared allergen), the system must record
the decision, reasoning, timestamp, and approving admin in unalterable form, and
must not allow silent edits afterward.

\- If the system displays any "certified", "allergy-safe", "guaranteed",
"verified by a nutritionist", or CA-backed signature language, it must not use
that language unless a licensed Certification Authority or a real certified
professional is actually involved. Because the system analyses a photographed
menu and cannot inspect a kitchen, **no wording that asserts allergy safety is
permitted at all** — the only permitted phrasing is that no conflicting
ingredient was detected from the available menu information, and that the user
should confirm with restaurant staff.
