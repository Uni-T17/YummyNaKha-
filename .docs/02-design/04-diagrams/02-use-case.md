# Diagram 2 of 4 — Use Case

Shows the **Diner** actor and every use case they can perform, grouped into
four areas and each mapped to its `F` requirement in the spec:

- **Account & profile** — create account and sign in (F1), save a food profile
  (F2), opt in to allergies and restrictions (F3), edit or delete profile data
  (F4).
- **Menu & consent** — accept the Terms, privacy notice, and disclaimer
  (F15), upload a Thai menu photo (F5), generate the categorized menu
  (F6–F10, F27), which `«includes»` reading the photo with our own OCR service
  and matching to the Thai dish guide. *Revised 2026-10-27:* the separate
  transfer consent and the third-party AI service actor are removed; the PNG
  still shows them and must be redrawn.
- **Results & ordering** — view the basis for each result (F12), view a
  dish's detailed ingredients (F28), select dishes
  (F13), view the order in Thai (F14).
- **Data rights** — withdraw consent (F16), delete the account (F17).

![Use case diagram](<images/use-case-diagram.png>)
