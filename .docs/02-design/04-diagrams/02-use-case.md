# Diagram 2 of 4 — Use Case

Shows the **Diner** actor and every use case they can perform, grouped into
four areas and each mapped to its `F` requirement in the spec:

- **Account & profile** — create account and sign in (F1), save a food profile
  (F2), opt in to allergies and restrictions (F3), edit or delete profile data
  (F4).
- **Menu & consent** — upload a Thai menu photo (F5), give transfer consent
  before anything leaves the app (F15), generate the categorized menu
  (F6–F10), which `«calls»` the third-party AI service.
- **Results & ordering** — view the basis for each result (F12), select dishes
  (F13), view the order in Thai (F14).
- **Data rights** — withdraw consent (F16), delete the account (F17).

![Use case diagram showing the diner actor and twelve use cases in four grouped areas — account and profile, menu and consent, results and ordering, and data rights — with the include relationship into menu generation and the call out to the third-party AI service](../../images/diagrams/use-case-diagram.png)
