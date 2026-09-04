# Diagram 1 of 4 — Context

What we build versus what we call. One box for the system, everything else
outside it.

```mermaid
flowchart TB
    diner(["👤 Diner<br/>(primary user)"])
    staff(["👤 Restaurant Staff<br/>(reads the generated Thai text — F13)"])
    admin(["👤 Admin / Moderator<br/>(LR10 overrides)"])

    subgraph SYS["YummyNaKha!"]
        core["Food Profile · Menu Extraction · Translation<br/>Dish Understanding · Dietary Rule Engine<br/>Ranking · Restaurant Communication<br/>+ Consent &amp; Audit layer"]
    end

    ocr["🔤 OCR / Vision Service<br/>menu text extraction<br/>LR2: image + dietary flags only"]
    llm["🤖 Translation / Language Model<br/>dish names, ingredient inference<br/>LR2: no identifiers"]
    tts["🔊 Text-to-Speech Service<br/>F16 (Should)"]
    auth["🔑 Identity Provider<br/>LR4d: token only, never a credential"]
    authority["⚖️ Thai Authority<br/>CCA §26 log request — LR7"]

    diner -->|"food profile, menu photo,<br/>dish choice (F1,F3)"| SYS
    SYS -->|"three categories with reasons,<br/>Thai order text (F11,F12,F13)"| diner
    SYS -.->|"user shows the phone —<br/>outside the software boundary"| staff
    admin -->|"override a wrong result (LR10)"| SYS

    SYS -->|"menu image /<br/>extracted text"| ocr
    ocr -->|"raw text + layout"| SYS
    SYS -->|"dish names +<br/>dietary flags"| llm
    llm -->|"translations,<br/>candidate ingredients"| SYS
    SYS -->|"phrase text"| tts
    SYS <-->|"verification token"| auth
    authority -.->|"retention request<br/>(≥90 days, up to 1 yr)"| SYS

    style SYS fill:#E4F2F0,stroke:#2A9D8F,stroke-width:2px
    style ocr fill:#FBEAE2,stroke:#D9542B
    style llm fill:#FBEAE2,stroke:#D9542B
    style authority fill:#FFF4E0,stroke:#E1972B
```

## What this diagram settles

| Boundary decision | Why |
|---|---|
| **The restaurant is not an actor that feeds the system** | Staff appear only as the *reader* of generated text, over a dotted line — they never register, upload a menu, install a QR code, or maintain data. That is the project's founding constraint, and the diagram has to show it or the constraint is just a claim. |
| OCR and the language model are **outside** the box | We call third-party services; we do not train or host them. This is what makes LR2 (transfer disclosure + minimisation) necessary at all. |
| The **dietary rule engine, ranking, and uncertainty logic are inside** the box | They are ours, and they are the answer to "is this just an AI API wrapper?". The models return *candidates*; the verdict is computed by our code. |
| Identity is **outside** the box | We never store a password — only a verification token (LR4d). |
| The consent & audit layer is **inside** the box | Compliance is our system's job, not a vendor's. |
| The Thai authority is an actor, not a user | CCA §26 makes log retention a real external interface, not an internal nicety (LR7). |

**Data leaving the system:** the menu image (or the text extracted from it),
dish names, and dietary flags — and nothing else. No name, email, phone number,
or device identifier crosses the boundary to any third-party service (LR2). The
raw image is deleted within 24 hours of successful extraction (LR3, NFR13),
because a photo of a restaurant table is rarely a photo of only the menu.
