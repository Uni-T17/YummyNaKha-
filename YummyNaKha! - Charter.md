**Project Charter: YummyNaKha!**

*Personalized Multilingual Restaurant Menu Understanding & Recommendation System*

> **What's yummy for you?**

# **1\. Project Overview**

YummyNaKha! is a mobile-first platform that helps a diner understand a restaurant menu written in an unfamiliar language and, more importantly, decide **which dishes on that menu fit them**. The user saves a food profile once — allergies, dietary restrictions, dislikes, preferences, and preferred language. At the restaurant they take a photo of the printed menu. The system extracts dish names and prices, translates them, infers likely ingredients, checks each dish against the saved profile, and returns the menu split into three plain categories: **Recommended**, **Check Before Ordering**, and **Conflict**. Once the user picks a dish, the system generates restaurant-ready Thai text so they can ask about an ingredient or order with a modification.

The system requires **no restaurant registration, no restaurant API, no QR-code infrastructure, no administrator maintaining menu data, and no community-contributed database**. The first user gets full value on their first scan. The only input is a photo of a menu that already exists on the table.

The product principle is one line: **Open → Scan → Decide → Order.**

# **2\. Problem Statement**

International students, travellers, and anyone with a dietary restriction can struggle to order food from a menu written in a language they cannot read. Translation alone does not solve the decision. Users face four obstacles:

* **Unreadable Menu:** A Thai-only menu is opaque. Even a correct translation of a dish name ("Pad Kaphrao") does not tell the user what is in it.

* **Hidden Ingredient Risk:** Menus do not list sauces, garnishes, cooking oil, or common accompaniments. A user avoiding pork or allergic to peanuts cannot tell from the menu text alone whether a dish is a problem, and a wrong guess has real consequences.

* **Slow, One-by-One Decision Effort:** Translating dishes one at a time, searching unfamiliar dish names, remembering one's own restrictions, and comparing a dozen options is slow and is repeated at every new restaurant.

* **Communication Barrier at the Table:** Even after choosing, the user still cannot ask staff "does this contain peanuts?" or order "no peanuts, less spicy" in the restaurant's language.

The result is that people order defensively — the same safe dish every time, or whatever a friend orders — or they avoid unfamiliar restaurants entirely.

# **3\. Project Goals & Objectives**

The main goal is to reduce the effort and the risk of choosing a dish from an unfamiliar-language menu, without ever implying a safety guarantee the system cannot support. The objectives are:

* **Make the Menu Readable:** Extract dish names and prices from a menu photo and translate them into the user's preferred language.

* **Understand the Dish, Not Just the Words:** Map each dish to likely ingredients, separating what the menu states explicitly from what is only commonly true.

* **Match Against the Person:** Apply the saved food profile — allergies, dietary restrictions, dislikes, preferences — to every dish on the menu automatically.

* **Be Honest About Uncertainty:** Present three categories (Recommended / Check Before Ordering / Conflict) instead of a false confidence score, and never label a dish allergy-safe.

* **Close the Loop at the Table:** Generate restaurant-ready Thai text for asking about ingredients and for ordering with modifications.

* **Reduce Decision Effort Measurably:** Achieve a measurable before/after reduction in the time and number of steps a real user needs to choose a suitable dish from a Thai-only menu.

# **4\. Key Stakeholders**

| Role | Name | Responsibilities |
| :---- | :---- | :---- |
| Project Owner | Aike Paung Bra - 6631503052 | Owns the project vision, defines requirements, and manages scope, priorities, and timeline. |
| QA / Tester | Tay Zar Tun - 6631503089 | Verifies specs against the backlog, checks traceability and legal requirements, and tests acceptance criteria — including the allergy-safety copy rules. |
| AI Lead | Chan Nyein Thu - 6631503055 | Owns the OCR / translation / dish-understanding pipeline, the agents and skills, AI disclosure, and governance. |
| Tech Lead | Thiri Kyaw Khaing - 6631503093 | Oversees the GitHub repository, code standards, and technical decisions. |
| Designer | Yoon Nadi - 6631503099 | Creates the scan → results → order experience, including how warnings are shown without causing false confidence. |
| Target Users | International students & travellers in Thailand | Scan real restaurant menus, use the personalized categories to choose a dish, and use the generated Thai text to order. |


# **5\. Scope and Key Features**

The system focuses on one core workflow: **food profile in → menu photo → personalized categories → restaurant-ready order out.** The main features include:

|  | Feature | Description | Priority |
| :---- | :---- | :---- | :---- |
| 1 | **Food Profile** | Save allergies, dietary restrictions, dislikes, preferences, and preferred language once, and reuse them everywhere. | Core |
| 2 | **Menu Scan** | Take or upload a photo of a printed restaurant menu. | Core |
| 3 | **Menu Extraction** | Detect dish names and prices from the image and structure them as a dish list. | Core |
| 4 | **Translation** | Translate dish names into the user's preferred language. | Core |
| 5 | **Dish Understanding** | Map a dish to likely ingredients, tagged Explicit / Inferred / Unknown. | Core |
| 6 | **Dietary Rule Engine** | Detect conflicts with restrictions and allergen concerns per dish. | Core |
| 7 | **Preference Ranking** | Rank dishes by preference match, dislike penalty, and uncertainty penalty. | Core |
| 8 | **Three-Category Results** | Present Recommended / Check Before Ordering / Conflict, each with reasons. | Core |
| 9 | **Restaurant Communication** | Generate a Thai question or order (with modifications) to show or speak to staff. | Core |
| 10 | **Manual Correction** | Fix a misread dish name or price without rescanning the whole menu. | Support |

# **6\. Constraints & Risks**

* **Hidden Ingredients:** A menu never lists everything — sauces, oil, garnishes, cross-contact, and kitchen variation are invisible. The system must therefore never claim a dish is allergy-safe; it may only say that no conflicting ingredient was detected from the available menu information. This is a product-defining constraint, not a caveat.

* **AI Hallucination:** A model may invent an ingredient or mistranslate a dish. Mitigation: keep Explicit, Inferred, and Unknown evidence levels structurally separate, and never let an Inferred ingredient produce a "no conflict" verdict on an allergen.

* **OCR Quality on Real Menus:** Real menus are photographed at an angle, in low light, laminated and glossy, handwritten, or stylised. Extraction accuracy is the single biggest technical risk to the whole pipeline.

* **False Confidence:** A score like "94% safe" implies certainty the system cannot support. Mitigation: labels (Top Match / Recommended / Check Before Ordering / Conflict), never percentages of safety.

* **Existing Tool Competition:** Google Translate, ChatGPT, Gemini, and Claude already do parts of this workflow. The project must validate that a saved profile + automatic ranking + structured warnings + ready-made ordering text is meaningfully better than a generic assistant, rather than assuming it.

* **Third-Party AI Cost & Availability:** OCR, translation, and dish understanding depend on external services with usage costs and rate limits; the app must degrade with a clear notice instead of a raw error.

* **Measurement Difficulty:** Decision time and confidence are partly self-reported, so the before/after comparison must be defined carefully — same user, same menu class, existing method vs YummyNaKha!.

# **7\. Timeline & Milestones**

| Phase | Milestone / Deliverable | Weeks |
| :---- | :---- | :---- |
| Discover | Company Charter; requirement spec \+ backlog; 4 diagrams \+ prototype sketch; **User Validation Gate (pass/fail)** | **W1–W5** |
| Build | Scope locked \+ Sprint 0; **Alpha Demo** – a user saves a food profile, photographs a Thai menu, receives the three categories with reasons, and generates a Thai order line end-to-end | **W6–W8** |
| Test | **Beta Review** – before/after metric (time-to-decide and confidence) on real Thai menus \+ at least 3 feedback-driven fixes (Impact Report) | **W9–W11** |
| Deliver | Real-user sign-off; **Final Showcase** (10-min pitch); portfolio pack (case study, demo video, evidence log, impact metrics, role statements) | **W12–W14** |

# **8\. Authorization**

**Team Members:** Ai Paung Bra_6631503052,Chan Nyein Thu_6631503055, Tay Zar Tun_6631503089,Thiri Kyaw Khaing_6631503093, Yoon Nadi_6631503099
