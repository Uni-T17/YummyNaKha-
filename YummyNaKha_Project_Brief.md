# YummyNaKha! — Project Brief

- Course: SE Case Studies, 1305493, 1/2569
- Phase: **DISCOVER** (W1–W5) — no production code yet
- Status: draft brief; source material for the Charter and the requirement spec

> Don't just translate the menu. Find what's yummy for you.

## 1. Product overview

YummyNaKha! is a personalized menu app. A user saves a food profile once —
favorite foods, allergies, and doctor-advised food restrictions — then uploads a
photo of a Thai-language restaurant menu. The app extracts each dish name and its
price, translates the menu from Thai into English, infers likely ingredients,
checks every dish against the profile, and presents the menu split into three
categories: **🟢 recommended**, **🟡 check before ordering**, **🔴 conflict**.
The user selects dishes and opens a selected-menu page that shows those dishes
back in Thai, so they can order by showing the screen to restaurant staff.

## 2. Target users

- **Primary:** People who cannot easily read Thai restaurant menus — especially
  international students and foreigners in Thailand.
- **Secondary:** People with food allergies or doctor-advised food restrictions
  who need to check a menu before ordering.

## 3. Problem statement

People who cannot read Thai struggle to choose suitable food from a Thai-only
menu. Basic translation shows what a dish is called, but it does not tell the
diner which dishes match their favorite foods or which ones may conflict with
their allergies and medical food restrictions. Working this out dish by dish —
with a translation app, guesswork, or by asking staff across a language barrier —
is slow and error-prone, so diners fall back on a familiar dish or avoid
unfamiliar restaurants.

## 4. Goals & objectives

- Help users understand a Thai menu in English.
- Help users choose a dish faster than their current method.
- Recommend dishes based on the user's saved favorite foods.
- Warn about potential conflicts with the user's allergies and doctor-advised
  restrictions.
- Show the chosen dishes back in Thai so ordering is easy.

## 5. Scope & key features

| Feature | Description | Priority |
|---------|-------------|----------|
| Food profile | Save favorite foods, allergies, and doctor-advised food restrictions | Core |
| Thai menu image upload | User uploads a photo of a Thai-language menu (not live scanning) | Core |
| Dish & price extraction | Pull each dish name and its price from the image | Core |
| Thai → English translation | Translate the extracted menu text | Core |
| Ingredient inference | Infer likely ingredients for each dish, to enable matching | Core |
| Personalized recommendations | Rank dishes against the saved profile | Core |
| Three-category result | Label every dish 🟢 recommended / 🟡 check before ordering / 🔴 conflict | Core |
| Dish selection | User selects dishes from the categorized menu | Core |
| Selected-menu page | A separate page listing the user's chosen dishes | Core |
| Order in Thai | Show the selected dishes in Thai on that page for ordering | Core |
| Multiple menu images | Upload more than one menu image in a session | Should |
| History & feedback | Keep past scans; let users rate recommendations | Could |

## 6. Constraints & risks

- A menu image may not show every ingredient — sauces, cooking oil, garnish, and
  recipe variations are often invisible in the photo.
- Image quality (lighting, angle, handwriting, layout) affects extraction
  accuracy.
- The AI may infer ingredients incorrectly.
- Restaurant preparation and kitchen cross-contact cannot be verified from a
  photo.
- Allergy and medical-restriction results must be phrased as a warning to check
  with restaurant staff — never as a guarantee that a dish is safe.
- Third-party OCR / language-model API rate limits and costs.

## 7. Success metric

Time to find and select suitable dishes from a Thai menu — the user's current
method versus YummyNaKha! — measured with real users. Secondary measure: number
of steps to reach a decision.

## 8. Fixed decisions (MVP boundaries)

- Thai-language menu images only.
- Translation direction is Thai → English only.
- Users upload images; there is no live camera scanning.
- No restaurant-side setup, registration, or menu data — value comes from the
  user's first upload.
- The profile stores allergies, favorite foods, and doctor-advised restrictions.
- No voice output.
- Selected dishes are shown in Thai on a separate page for ordering.
