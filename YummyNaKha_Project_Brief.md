# YummyNaKha!

## Personalized Multilingual Restaurant Menu Understanding & Recommendation System

## 1. Project Summary

**YummyNaKha!** is a software system that helps users understand restaurant menus and quickly identify dishes that match their dietary restrictions, allergies, dislikes, food preferences, and preferred language.

The system is designed for situations where a user visits a restaurant, especially one with a menu written in an unfamiliar language such as Thai.

Instead of requiring restaurants or organizations to register, upload menu data, maintain product information, or provide APIs, the user simply takes or uploads a photo of the existing restaurant menu.

YummyNaKha! then:

1. Extracts menu items and prices from the image.
2. Translates menu content into the user's preferred language.
3. Understands dish names and possible ingredients.
4. Compares dishes against the user's food profile.
5. Detects conflicts with dietary restrictions or allergies.
6. Ranks dishes based on the user's preferences.
7. Separates results into recommended, check-first, and conflict categories.
8. Generates restaurant-ready communication in Thai or another supported language.

The core idea is:

> **Don't just translate the menu. Find what's yummy for you.**

---

## 2. Brand Name

### YummyNaKha!

The name combines:

- **Yummy** — food, taste, enjoyment, and something delicious
- **Na Kha / นะคะ** — a recognizable Thai expression that gives the brand a playful Thailand-focused personality
- **!** — adds energy, friendliness, and a more Gen Z consumer-app feeling

The name is intended to feel:

- Friendly
- Playful
- Memorable
- Thailand-connected
- Gen Z
- Consumer-focused
- Easy to brand visually

Possible tagline:

> **What's yummy for you?**

Alternative taglines:

> **Scan it. Match it. Yum.**

> **Your taste. Your menu.**

> **Find your kind of yummy.**

---

## 3. Problem Statement

International diners and people with dietary restrictions may have difficulty choosing food from restaurant menus written in unfamiliar languages.

Translation tools can translate menu text, but translation alone does not always answer important questions such as:

- Does this dish contain something I avoid?
- Could this dish contain one of my allergens?
- Which dishes match the foods I like?
- Which dishes should I avoid?
- What are the best choices for me from this entire menu?
- How do I tell restaurant staff about my dietary requirements?
- How do I order the selected dish in the restaurant's language?

Users may currently need to translate dishes one by one, search unfamiliar dish names, remember their restrictions, investigate ingredients, compare many options, and communicate modifications manually.

YummyNaKha! aims to reduce this effort by providing a personalized menu decision-support experience.

---

## 4. Target Users

Potential users include:

- International students
- Travelers and tourists
- People with dietary restrictions
- People with food allergies
- Vegetarians or vegans
- People who avoid specific meats or ingredients
- People with strong food dislikes
- People who want recommendations based on favorite foods
- People who cannot easily read the restaurant menu language

For initial project testing, international university students are a practical target group.

---

## 5. Project Requirements

The project should satisfy the following constraints:

- Solve a real-world user problem.
- Be usable by at least 15 real users.
- Work without private university data.
- Work without restaurant databases or APIs.
- Work without restaurant registration.
- Work without QR-code setup by organizations.
- Work without administrators maintaining menu data.
- Avoid a community-data cold-start problem.
- Give value to the first user.
- Require minimal user input.
- Allow users to use natural inputs such as a menu photo.
- Let the software perform most of the analysis.
- Be more than a generic CRUD or management system.
- Provide enough technical depth for a Software Engineering project.

---

## 6. Core User Experience

### Initial Setup

The user creates a personal food profile once.

Example:

```text
ALLERGIES
- Peanuts
- Shellfish

DIETARY RESTRICTIONS
- Pork

DISLIKES
- Mushrooms
- Coconut

PREFERENCES
- Chicken
- Noodles
- Spicy food

PREFERRED LANGUAGE
- English
```

The profile should be reusable so the user does not need to enter the same information at every restaurant.

### At a Restaurant

```text
Open YummyNaKha!
      ↓
Take or upload menu photo
      ↓
Menu recognition
      ↓
Translation
      ↓
Dish understanding
      ↓
Compare with food profile
      ↓
Rank and categorize dishes
      ↓
Choose a dish
      ↓
Generate restaurant-ready order/question
```

The ideal experience is:

> **Open → Upload menu → Decide → Order**

---

## 7. Food Profile Model

The system should distinguish between different types of food preferences.

### Allergy

Something that may cause a serious reaction.

Example:

- Peanuts
- Shellfish
- Milk
- Egg

System behavior:

- Strong warning
- Do not label the dish as definitely safe
- Recommend confirmation with restaurant staff

### Dietary Restriction

Something the user does not consume.

Example:

- Pork
- Beef
- Seafood

System behavior:

- Clear conflict if explicitly detected

### Dislike

Something the user prefers not to eat.

Example:

- Mushrooms
- Coconut

System behavior:

- Lower recommendation priority

### Preference

Something the user likes.

Example:

- Chicken
- Noodles
- Spicy food

System behavior:

- Increase recommendation priority

---

## 8. Menu Processing Pipeline

A possible processing pipeline is:

```text
Menu Image
    ↓
Image Preprocessing
    ↓
OCR / Text Recognition
    ↓
Language Detection
    ↓
Menu Structure Detection
    ↓
Dish Name Extraction
    ↓
Price Extraction
    ↓
Translation
    ↓
Dish / Ingredient Understanding
    ↓
Dietary Rule Engine
    ↓
Preference Ranking
    ↓
Uncertainty Analysis
    ↓
Personalized Results
```

---

## 9. Recommendation Categories

The result should be simple and understandable.

### Top Match / Recommended

Example:

```text
★ Chicken Basil Rice
฿60

Why recommended:
- Chicken matches your preference
- Spicy food matches your preference
- No explicit pork conflict detected
```

### Check Before Ordering

Example:

```text
⚠ Chicken Pad Thai
฿70

Why:
- Chicken matches your preference
- Noodles match your preference
- Peanuts may commonly be present or served with this dish

Action:
Confirm with restaurant staff before ordering.
```

### Conflict

Example:

```text
✗ Crispy Pork Basil Rice
฿65

Reason:
- Contains pork
- Pork is listed in your dietary restrictions
```

---

## 10. Important Safety Rule

YummyNaKha! must never claim that a dish is definitely allergy-safe based only on menu information.

A restaurant menu may not list:

- Hidden ingredients
- Sauce ingredients
- Garnishes
- Cooking oil
- Recipe variations
- Cross-contact
- Kitchen preparation methods

Therefore avoid messages such as:

> "Safe to eat"

Prefer:

> "No conflicting ingredient was detected from the available menu information."

For uncertain allergy-related dishes:

> "This dish may contain or commonly be served with your allergen. Please confirm with restaurant staff."

---

## 11. Ingredient Confidence Levels

The system should distinguish between different evidence levels.

### Explicit

The ingredient is directly visible in the menu text.

Example:

```text
Pork Basil Rice
```

Result:

```text
Pork detected
Confidence: High
```

### Inferred / Common

The ingredient is commonly associated with the dish but is not explicitly listed.

Example:

```text
Pad Thai
```

Possible ingredients may include:

- Peanuts
- Egg
- Fish sauce

Result:

```text
Possible peanut presence
Confirmation recommended
```

### Unknown

The system does not have enough information.

Result:

```text
Ingredient information cannot be confirmed.
Ask restaurant staff.
```

---

## 12. Restaurant Communication Feature

After choosing a dish, the user should be able to generate communication for restaurant staff.

Example:

```text
I have a peanut allergy.
Does this dish contain peanuts or peanut ingredients?
```

Thai version:

```text
ฉันแพ้ถั่วลิสง เมนูนี้มีถั่วลิสงหรือส่วนผสมที่มีถั่วลิสงไหมครับ/คะ
```

Possible actions:

- Show full-screen translation
- Copy text
- Play text-to-speech
- Switch between Thai and English
- Generate order modification

Example:

```text
Chicken Pad Thai
No peanuts
Little spicy
```

Generated order:

```text
ขอผัดไทยไก่ ไม่ใส่ถั่วลิสง และเผ็ดน้อยครับ
```

---

## 13. MVP Scope

The first version should focus on a small but complete workflow.

### In Scope

- User food profile
- Allergies
- Dietary restrictions
- Dislikes
- Preferences
- Preferred language
- Menu photo upload
- Thai menu recognition
- Dish extraction
- Price extraction
- Thai-to-English translation
- Personalized dish analysis
- Dietary conflict detection
- Recommendation ranking
- Uncertainty warnings
- Recommended / check / conflict categories
- Restaurant-ready Thai communication
- Real-user testing

### Out of Scope for MVP

- Restaurant registration
- Restaurant POS integration
- Food delivery
- Table booking
- Payment
- Exact nutrition calculation
- Guaranteed allergy safety
- Kitchen cross-contamination detection
- Restaurant kitchen verification
- Large restaurant database
- Social reviews
- Community-contributed menu database

---

## 14. Possible Technical Architecture

```text
                 User
                   │
                   ▼
            Web / Mobile App
                   │
        ┌──────────┴──────────┐
        │                     │
   Food Profile            Menu Image
        │                     │
        │                     ▼
        │              Image Processing
        │                     │
        │                     ▼
        │                    OCR
        │                     │
        │                     ▼
        │              Menu Extraction
        │                     │
        └──────────┬──────────┘
                   ▼
            Dish Understanding
                   │
                   ▼
           Ingredient Analysis
                   │
                   ▼
           Dietary Rule Engine
                   │
                   ▼
        Recommendation Engine
                   │
                   ▼
          Uncertainty Analysis
                   │
                   ▼
              Translation
                   │
                   ▼
          Personalized Results
                   │
                   ▼
      Restaurant Communication
```

---

## 15. Possible Technology Stack

### Frontend

Possible options:

- Next.js
- React
- Flutter

### Backend

Possible options:

- Go with Fiber
- Node.js
- Python with FastAPI

### Database

Possible option:

- PostgreSQL

Possible stored data:

- User profile
- Allergies
- Dietary restrictions
- Dislikes
- Preferences
- Preferred language
- Optional scan history
- User feedback

### AI / Processing Components

Possible components:

- OCR
- Vision-language model
- NLP
- Translation model or API
- Ingredient knowledge base
- Rule-based dietary engine
- Recommendation algorithm
- Text-to-speech

---

## 16. Avoid Making It Only an AI API Wrapper

A weak implementation would be:

```text
Upload Image
    ↓
Send everything to an AI API
    ↓
Ask AI to recommend food
    ↓
Display response
```

The project should contain software logic developed by the team.

A stronger architecture is:

```text
AI / OCR
    ↓
Extract structured menu information

Team-developed backend
    ↓
Normalize dishes and ingredients

Dietary rule engine
    ↓
Detect restrictions and allergy concerns

Recommendation engine
    ↓
Rank dishes

Uncertainty logic
    ↓
Choose warning level

Translation / communication layer
    ↓
Generate restaurant-ready output

Frontend
    ↓
Present personalized decision clearly
```

---

## 17. Recommendation Logic

A conceptual scoring model could include:

```text
Preference Match      → increase rank
Dislike Match         → decrease rank
Dietary Restriction   → conflict
Possible Allergen     → warning / confirmation
Unknown Ingredients   → uncertainty penalty
```

A conceptual formula:

```text
Preference Score
- Dislike Penalty
- Uncertainty Penalty
= Recommendation Priority
```

Hard restrictions and allergy warnings should not be treated as ordinary preference weights.

---

## 18. Example User Scenario

User profile:

```text
ALLERGY
Peanuts

DIETARY RESTRICTION
Pork

DISLIKE
Mushrooms

PREFER
Chicken
Spicy food
Noodles

LANGUAGE
English
```

Restaurant menu:

```text
กะเพราหมูกรอบ     65
กะเพราไก่         60
ผัดไทยไก่         70
ข้าวผัดหมู        60
ก๋วยเตี๋ยวไก่      55
```

Possible result:

```text
★ TOP MATCH

Chicken Basil Rice
฿60

- Chicken preference matched
- Spicy preference matched


RECOMMENDED

Chicken Noodles
฿55

- Chicken preference matched
- Noodle preference matched


CHECK BEFORE ORDERING

Chicken Pad Thai
฿70

- Chicken preference matched
- Noodle preference matched
- Peanut confirmation recommended


CONFLICT

Crispy Pork Basil Rice
฿65

- Contains pork


CONFLICT

Pork Fried Rice
฿60

- Contains pork
```

---

## 19. Differentiation from Existing Tools

### Google Translate

Google Translate can translate menu text.

YummyNaKha! should provide:

```text
Menu
+
Food Profile
+
Dish Understanding
+
Restriction Detection
+
Preference Matching
+
Uncertainty
+
Ranking
+
Ordering Communication
```

The main question is not only:

> "What does this menu mean?"

It is:

> "Which dishes on this menu fit me?"

### Generic AI Assistants

A user can potentially upload a menu to a generic AI assistant and explain their restrictions manually.

YummyNaKha! should offer a specialized workflow:

```text
Generic AI:
Upload
→ Explain restrictions
→ Write prompt
→ Read response
→ Ask follow-up
→ Translate order

YummyNaKha!:
Profile already saved
→ Upload menu
→ See personalized categories
→ Select dish
→ Show restaurant
```

The project must validate whether this specialized experience is meaningfully easier and more useful.

---

## 20. User Validation

Before full development, interview potential users.

Important questions include:

- Have you had difficulty understanding restaurant menus in Thailand?
- How do you currently solve this problem?
- Do you use Google Translate, ChatGPT, friends, or restaurant staff?
- Do you have foods you avoid?
- Do you have allergies, dietary restrictions, dislikes, or strong preferences?
- Have you ever accidentally ordered something containing an ingredient you avoid?
- How long does choosing food from a Thai-only menu usually take?
- What is difficult about asking restaurant staff about ingredients?
- Would automatically sorted menu recommendations be useful?
- What information would you need before trusting a recommendation?

Do not lead users toward the proposed solution during initial problem interviews.

---

## 21. Evaluation

### Technical Evaluation

Possible metrics:

- OCR accuracy
- Dish extraction accuracy
- Price extraction accuracy
- Translation quality
- Dietary conflict detection precision
- Dietary conflict detection recall
- Ingredient classification accuracy
- Recommendation relevance
- Processing time

### User Evaluation

Possible metrics:

- Task completion time
- Number of interactions
- Successful identification of suitable dishes
- User confidence
- Perceived usefulness
- Ease of use
- Recommendation usefulness
- System Usability Scale (SUS)

Possible comparison:

```text
Existing method
vs.
YummyNaKha!
```

Measure whether YummyNaKha! reduces effort and improves decision-making.

---

## 22. Possible Research Questions

### RQ1

Can a personalized menu analysis system accurately identify restaurant dishes that conflict with users' stated dietary restrictions from menu images?

### RQ2

Does personalized menu ranking reduce the time required for users to choose suitable dishes from unfamiliar-language restaurant menus?

### RQ3

Does uncertainty-aware dietary information help users recognize when restaurant confirmation is required?

---

## 23. Project Objectives

### General Objective

To develop **YummyNaKha!**, a personalized multilingual restaurant menu understanding and recommendation system that assists users in selecting dishes based on dietary restrictions, allergies, dislikes, food preferences, and language needs.

### Specific Objectives

1. Develop a menu-image processing component for extracting dish names and prices.
2. Translate restaurant menu information into the user's preferred language.
3. Develop a dietary-rule mechanism for identifying conflicts.
4. Develop a recommendation mechanism for ranking dishes according to user preferences.
5. Represent uncertain ingredient information clearly.
6. Generate restaurant-ready multilingual communication.
7. Evaluate system accuracy, usability, and usefulness with real users.

---

## 24. Major Risks

### Hidden Ingredients

Menus do not show every ingredient.

**Mitigation:** Use uncertainty warnings and restaurant confirmation.

### AI Hallucination

A model may incorrectly infer ingredients.

**Mitigation:** Separate explicit, inferred, and unknown information.

### Existing Tool Competition

ChatGPT, Gemini, Claude, and Google Translate can perform parts of the workflow.

**Mitigation:** Validate whether the saved profile, automatic ranking, structured warnings, and restaurant communication provide a significantly better user experience.

### False Confidence

Percentage scores such as "94% safe" may imply certainty that the system cannot support.

**Mitigation:** Prefer understandable labels such as:

- Top Match
- Recommended
- Check Before Ordering
- Conflict

---

## 25. Why This Project Fits the Team's Criteria

| Requirement | Status |
|---|---|
| Real-world problem | Yes |
| 15+ potential users | Yes |
| No MFU database required | Yes |
| No MFU API required | Yes |
| No restaurant system integration required | Yes |
| No restaurant data entry required | Yes |
| No QR infrastructure required | Yes |
| No administrator maintenance required | Yes |
| No community cold-start problem | Yes |
| First user receives value | Yes |
| Minimal input | Yes |
| Natural input via menu photo | Yes |
| Software performs meaningful processing | Yes |
| Deployable and testable | Yes |
| Software Engineering depth | Yes |
| Measurable evaluation | Yes |
| Clear differentiation from existing AI tools | Needs validation |

---

## 26. Core Value Proposition

> **Take a photo of any restaurant menu and quickly discover which dishes best match your dietary needs and food preferences in your preferred language.**

Brand version:

> **YummyNaKha! — What's yummy for you?**

---

## 27. Product Principle

The project should remain focused on simplicity:

```text
Open YummyNaKha!
 ↓
Upload menu
 ↓
Understand
 ↓
Choose
 ↓
Order
``

Avoid unnecessary features that make the experience more complicated.

---

## 28. Current Project Status

**Project Name:** YummyNaKha!

**Stage:** Idea / Problem Validation

Before implementing the full system, the team should validate the problem with at least 15–20 potential users.

The most important question to validate is:

> **Do users experience enough difficulty with restaurant menu understanding, dietary matching, and ordering that they would prefer YummyNaKha! over their current solutions such as Google Translate, ChatGPT, asking friends, or asking restaurant staff?**

If user research confirms this problem strongly, the project can move into requirements analysis, UX design, technical prototyping, and implementation.
