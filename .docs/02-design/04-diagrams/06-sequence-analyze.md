# Diagram 6 — Sequence: upload menu → `/api/ai/analyze` → OCR → guide match → categories

*Added 2026-11-17.* Traced from the code on `main` (`c300afc`). Default set-up:
`NEXT_PUBLIC_OCR_PROVIDER=local` (our own OCR service). Covers F5, F6, F7, F9,
F10, F18 and LR2, LR3, LR7, LR10.

| Participant | Code |
| --- | --- |
| Browser | `lib/api/menu.ts` (`uploadMenuImage`, `analyzeMenu`), `lib/store/app-store.ts` (`useDishes`) |
| Route | `app/api/images/route.ts`, `app/api/ai/analyze/route.ts`, wrapper `route()` in `lib/server/http.ts` |
| Analyze | `lib/server/ai/analyze-menu.ts` (`analyzeMenu`) |
| Process | `lib/server/ai/process-image.ts` (`processMenuImage`) |
| OCR | `lib/server/ocr/client.ts` → `ocr-service/server.py` `POST /ocr` (PaddleOCR) |
| Guide | `lib/server/menu/parse-ocr.ts`, `lib/server/menu/build-dishes.ts`, `lib/server/thai-food/match.ts` |
| Matching | `lib/matching.ts` (`categorizeMenu` / `categorizeDish`) — runs **in the browser** |

```mermaid
sequenceDiagram
    autonumber
    actor D as Diner
    participant B as Browser (lib/api/menu.ts, app-store)
    participant R as Route handlers (route() wrapper)
    participant A as analyzeMenu (analyze-menu.ts)
    participant P as processMenuImage (process-image.ts)
    participant O as OCR service (ocr-service /ocr)
    participant G as Parser + Thai dish guide (parse-ocr, build-dishes, match)
    participant DB as PostgreSQL (Prisma)
    participant GM as Gemini (optional)

    D->>B: choose menu photo(s)
    loop each photo
        B->>R: POST /api/images (multipart "file")
        R->>R: same-origin check, requireUser(), size ≤ 8 MB
        R->>DB: create MenuImage (bytes, status UPLOADED)
        R->>DB: AccessLog row (user id, IP, path, status)
        R-->>B: 201 { image: { id, fileName } }
    end

    D->>B: tap "Find My Food"
    B->>R: POST /api/ai/analyze { imageIds }
    R->>R: requireUser(), parseJson(analyzeSchema), rateLimit 30/h
    R->>A: analyzeMenu(userId, imageIds)
    A->>DB: assertProcessingConsent — read ConsentRecord
    alt required documents not accepted
        A-->>B: 403 CONSENT_REQUIRED
    end
    A->>DB: count MenuImage owned by user
    alt any id not owned
        A-->>B: 404 photo not found
    end

    loop each image, one at a time
        A->>P: processMenuImage(userId, id)
        P->>DB: find MenuImage
        alt already PROCESSED with cached OCR lines
            P-->>A: cached lines + size
        else another request is reading it (PROCESSING < 2 min)
            P->>DB: poll every 1 s (≤ 90 s)
            P-->>A: lines, or 502 on FAILED / timeout
        else claim it
            P->>DB: updateMany status → PROCESSING (atomic claim)
            P->>O: POST /ocr (image bytes only, optional Bearer OCR_SERVICE_TOKEN)
            O-->>P: { width, height, lines[text, score, box], model, elapsedMs }
            alt no Thai / English text, timeout or service down
                P->>DB: MenuImage status FAILED + safe error
                P-->>B: 422 MENU_UNREADABLE or 502 plain-language message
            end
            P->>DB: MenuImage PROCESSED, extractedText, metadata.ocr, data = null
            P-->>A: lines + size
        end
    end

    A->>DB: getPreferenceFlags → create MenuAnalysis (PROCESSING, preferencesSnapshot)
    A->>G: parseMenuLines + placeOnPhoto (name ↔ price per row, tilt-corrected)
    A->>G: findMeatMenu(items)
    opt separate meat list AND "Menu helper" consent accepted
        A->>GM: pairDishesWithMeats (menu text only)
        GM-->>A: dish ↔ meat pairs
    end
    A->>G: buildDishes(items, analysisId, pairs)
    G->>G: matchMenuLine per line → guide dish + protein,<br/>else readWords (name read from its words, inGuide = false)
    G-->>A: ExtractedDish[] (English name, Thai name, price, ingredients, uncertainties)
    alt no dishes found
        A->>DB: MenuAnalysis FAILED
        A-->>B: 422 MENU_UNREADABLE
    end
    A->>DB: MenuAnalysis PROCESSED (model = thai-dish-guide@version, result)
    A->>DB: countUnlistedDishes → upsert UnlistedDish (anonymous)
    A-->>R: { analysisId, dishes, otherLines, summary }
    R->>DB: AccessLog row
    R-->>B: 200 JSON

    B->>R: GET /api/preferences (My Taste, when not already loaded)
    R-->>B: favs, avoid list (+ reason), spice
    B->>B: categorizeMenu(dishes, profile)
    Note over B: per dish: Avoid-list conflict (severe) → Avoid<br/>any conflict, spice too hot, uncertain or not in guide → Check First<br/>otherwise → Top Pick ("no conflicting ingredient detected")<br/>sorted Top Pick → Check First → Avoid
    B-->>D: three lists; Check First / Avoid notes say to ask restaurant staff
```

## Notes

- **Categorisation is client-side.** The server returns uncategorised
  `ExtractedDish[]`; `useDishes()` in `lib/store/app-store.ts` calls
  `categorizeMenu` from `lib/matching.ts` with the current My Taste profile, so
  editing the profile re-sorts the menu without a new scan.
- **Top Pick / Check First / Avoid** are the in-app names of 🟢 recommended /
  🟡 check before ordering / 🔴 conflict. A dish not in the guide, or with any
  uncertainty, can never be Top Pick (F10, LR12).
- **What leaves the server:** the OCR service receives image bytes only — no user
  ID, name or email (LR3). With `NEXT_PUBLIC_OCR_PROVIDER=ocrspace` step "POST /ocr"
  goes to OCR.space instead (`lib/server/ocr/ocrspace.ts`), which the consent
  screen discloses (LR2). Gemini is called only with the separate Menu helper
  consent and receives menu text only.
- **Quality record (LR10):** `MenuAnalysis.preferencesSnapshot`, `model` and
  `result` (including any Gemini pairing) stay on our server.
- **Access log (LR7):** every request through `route()` writes one `AccessLog`
  row after the handler, success or error.
- The follow-up call `POST /api/ai/describe` (Menu helper describes unlisted
  dishes) is outside this diagram.
