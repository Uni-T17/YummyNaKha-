**Project Charter: YummyNaKha!**

# **1. Project Overview**

YummyNaKha! is a personalized menu application for people who cannot easily read
Thai restaurant menus. A user saves a food profile once — favorite foods,
allergies, and doctor-advised food restrictions — then uploads a photo of a
Thai-language menu. The system extracts each dish name and its price, translates
the menu from Thai into English, infers the likely ingredients of each dish,
checks every dish against the user's profile, and presents the menu split into
three categories: **🟢 recommended**, **🟡 check before ordering**, and
**🔴 conflict**. The user selects dishes and opens a separate selected-menu page
that shows those dishes back in Thai, so they can order by showing the screen to
restaurant staff. By joining translation, personalization, and an allergy /
restriction check in one place, the system helps a diner decide faster and with
more confidence than translating a menu line by line.

# **2. Problem Statement**

People who cannot read Thai struggle to choose suitable food from a Thai-only
menu. Basic translation is not enough on its own:

- **Language barrier at the table:** A Thai-only menu is unreadable to many
  international students and foreigners, so ordering depends on guesswork,
  pointing, or asking staff across a language gap.

- **Translation without personal fit:** A translation app shows what a dish is
  called, but not whether it matches the diner's favorite foods or which of the
  many unfamiliar dishes are worth trying.

- **Allergy and medical uncertainty:** Diners with allergies or doctor-advised
  restrictions cannot tell from a translated name whether a dish is likely to
  contain something they must avoid, and checking dish by dish is slow and
  error-prone.

As a result, diners fall back on a few familiar dishes, avoid unfamiliar
restaurants, or risk ordering something that conflicts with a restriction.

# **3. Project Goals & Objectives**

The main goal is to help a diner understand a Thai menu and choose a suitable
dish quickly. The objectives are:

- **Make the menu readable:** Extract and translate every dish and price from an
  uploaded Thai menu image into English.

- **Choose faster:** Reduce the time and number of steps a user needs to find
  and select suitable dishes, compared with their current method.

- **Personalize the result:** Rank and recommend dishes using the user's saved
  favorite foods.

- **Warn, do not certify:** Flag dishes that may conflict with the user's
  allergies or doctor-advised restrictions as items to check with restaurant
  staff — never as a guarantee that a dish is safe.

- **Make ordering easy:** Show the user's selected dishes back in Thai on a
  separate page for ordering.

# **4. Key Stakeholders**

| Role          | Name                                                                                                       | Responsibilities                                                                                                            |
| :------------ | :--------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| Product Owner | Tay Zar Tun (6631503089)                                                                                   | Owns the project vision, defines requirements, and manages scope, priorities, and timeline.                                 |
| QA / Tester   | Aike Paung Bra (6631503052)                                                                                | Verifies specs against the backlog, checks traceability and legal requirements, and tests that acceptance criteria are met. |
| AI Lead       | Chan Nyein Thu (6631503055)                                                                                | Owns the team's AI tooling, builds the agents and skills, the spec and backlog, and handles AI disclosure and governance.   |
| Tech Lead     | Thiri Kyaw Khaing (6631503093)                                                                             | Oversees the GitHub repository, code standards, and technical decisions.                                                    |
| Designer      | Yoon Nadi (6631503099)                                                                                     | Creates user-friendly, visually appealing, and intuitive digital experiences.                                               |
| Target Users  | Foreigners & international students in Thailand; people with food allergies or doctor-advised restrictions | Set a food profile, upload Thai menus, and use the categorized results and Thai order page to eat with less guesswork.      |

# **5. Scope and Key Features**

The system focuses on one core workflow: **profile in → menu photo → extract +
translate → match → three categories → order in Thai.** Anything outside that
chain is Should / Could / Won't for this phase.

|     | Feature                                 | Description                                                               | Priority |
| :-- | :-------------------------------------- | :------------------------------------------------------------------------ | :------- |
| 1   | **Food Profile**                        | Save favorite foods, allergies, and doctor-advised food restrictions.     | Core     |
| 2   | **Thai Menu Image Upload**              | Upload a photo of a Thai-language menu; no live camera scanning.          | Core     |
| 3   | **Dish & Price Extraction**             | Pull each dish name and its price from the image.                         | Core     |
| 4   | **Thai → English Translation**          | Translate the extracted menu text.                                        | Core     |
| 5   | **Ingredient Inference**                | Infer the likely ingredients of each dish to enable matching.             | Core     |
| 6   | **Personalized Recommendations**        | Rank dishes against the saved profile.                                    | Core     |
| 7   | **Three-Category Result**               | Label every dish 🟢 recommended / 🟡 check before ordering / 🔴 conflict. | Core     |
| 8   | **Dish Selection & Selected-Menu Page** | Select dishes and view them on a separate page.                           | Core     |
| 9   | **Order in Thai**                       | Show the selected dishes in Thai on that page for ordering.               | Core     |
| 10  | **Multiple Menu Images**                | Upload more than one menu image in a session.                             | Should   |

# **6. Constraints & Risks**

- **Extraction Accuracy:** Dish and price extraction depends on image quality —
  lighting, angle, handwriting, and menu layout can all reduce accuracy.

- **Incomplete Menu Information:** A menu image rarely shows every ingredient;
  sauces, cooking oil, garnish, and recipe variations are often invisible, so a
  match can never be based on a complete ingredient list.

- **AI Inference Errors:** The system infers ingredients from a dish name and
  image; that inference can be wrong, which is why allergy and restriction
  results are warnings to verify, not conclusions.

- **Unverifiable Preparation:** Actual restaurant preparation and kitchen
  cross-contact cannot be checked from a photo and are outside the system's
  knowledge.

- **Safety Wording:** Allergy and medical-restriction output must be phrased so
  the user always confirms with restaurant staff; the product must not use
  "safe", "guaranteed", or "certified" language.

- **AI Cost & Availability:** Extraction, translation, and inference depend on
  third-party AI services with usage costs and rate limits; the app must degrade
  gracefully when a service is unavailable.

- **Measurement Difficulty:** The core metric is task time and step count, so
  the before/after comparison must be defined carefully to stay credible.

# **7. Timeline & Milestones**

| Phase    | Milestone / Deliverable                                                                                                                                                                                                                                                                                          | Weeks       |
| :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------- |
| Discover | Problem validation; user survey / interviews; requirement spec + backlog; initial UX (4 diagrams + prototype sketch); **User Validation Gate (pass/fail)**                                                                                                                                                       | **W1–W5**   |
| Build    | Develop the YummyNaKha! MVP; **Alpha Demo** — a user creates a food profile with allergies, favorite foods, and doctor-advised restrictions, uploads a Thai menu image, receives an English menu with personalized recommendations / warnings, selects dishes, and sees the selected dishes in Thai for ordering | **W6–W8**   |
| Test     | Test with **15+ real users**; evaluate extraction / translation accuracy and usability; **Beta Review** — YummyNaKha! reduces the time to find and select suitable dishes versus the user's current method, plus feedback-driven improvements                                                                    | **W9–W11**  |
| Deliver  | Final improvements; working deployed system; tested final version; user-evaluation results; technical / project documentation; source code; **final presentation / demo**                                                                                                                                        | **W12–W14** |

# **8. Authorization**

**Team 5-Idiots:** Tay Zar Tun, Aike Paung Bra, Chan Nyein Thu, Thiri Kyaw
Khaing, Yoon Nadi