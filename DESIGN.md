
# Vibecoding Project Tracker — Design

**Status:** Hackathon starter design doc · fill in the **`<TODO>`** sections before you tag `design-done`.

**Why this file exists.** This tracker is your tool. It should look like *your* tool — not a generic Kanban with default Tailwind blue. Twenty minutes of design decisions here will be visible on every screen for the next six weeks of Module 5.

**Who owns this.** Person B, during the same window the rest of the team is reviewing the PRD. By the time the team converges to start M4 (`data-model`), this file should be filled in and the colors should already be in `tailwind.config.js`.

---

## 1. Mood / vibe

One sentence that captures the feeling the tracker should leave you with.

FlowState should feel clean, organised and calm, helping users manage tasks and AI prompt context without unnecessary distractions.

Two or three references that capture the vibe (links to dribbble shots, screenshots of apps you admire, Pinterest boards — anything visual):

- https://linear.app
- https://www.notion.so
- https://trello.com

Anti-references — what we are explicitly **not** trying to look like:

- Cluttered dashboards with excessive colours, animations or too much information competing for attention.

## 2. Color palette

These are the colors the build milestones will reference. Once chosen, paste the hex values into `tailwind.config.js` so the rest of the team can use Tailwind utility classes (e.g. `bg-brand-primary`, `border-due-warning`).

### Brand

| Token | Hex | Where it shows up |
|---|---|---|
| `brand-primary` | `#1D4ED8` | Header, "+" button, focus rings |
| `brand-accent` | `#2563EB` | Highlights, hover states, links |
| `surface-page` | `#F8FAFC` | Page background |
| `surface-card` | `#FFFFFF` | Card background |
| `text-primary` | `#0F172A` | Body text |
| `text-muted` | `#475569` | Captions, dates, counts |

### Task type (M6 `tag-style`)

| Token | Hex | When used |
|---|---|---|
| `type-feature` | `#047857` | Cards tagged `feature` (accent stripe + icon) |
| `type-bug` | `#B91C1C` | Cards tagged `bug` (accent stripe + icon) |

### Due-date states (M8 `due-tint`)

| Token | Hex | When used |
|---|---|---|
| `due-safe` | `#047857` | More than 2 days out |
| `due-warning` | `#B45309` | Less than 24 hours |
| `due-overdue` | `#B91C1C` | Past due |
| `due-neutral` | `#64748B` | Done (overrides date) |

## 3. Typography

| Role | Font | Why |
|---|---|---|
| Heading | `Inter` | Clear and modern, making headings easy to scan. |
| Body | `Inter` | Readable for task descriptions and forms. |
| Monospace (tags, badges, code) | `JetBrains Mono` | Distinguishes technical content from regular text. |

Suggested sizes (override only if the design demands it):

- Page title: 24 px / semibold
- Section header: 16 px / semibold uppercase
- Card title: 14 px / medium
- Body: 14 px / regular
- Caption: 12 px / regular muted

## 4. Component principles

One short sentence per element. These set the tone for the build phase — Person A's modal and Person B's anchor board should both feel like they came from this doc.

- **Cards:** White backgrounds, subtle 1px borders, rounded corners and minimal shadows. (e.g. "Light, almost weightless; the only weight is from a 1px border, no shadow except on hover.")
- **Buttons:** Solid brand-primary fill, clear labels, rounded corners and visible focus indicators. (e.g. "Solid fill, no gradient, generous padding, rounded-md.")
- **Modal:** Centred, readable width, dark semi-transparent backdrop and clearly labelled fields. (e.g. "Centered, max-width-md, slate-900 backdrop at 50% opacity.")
- **Empty states:** Dashed borders and muted, helpful text when no tasks are present. (e.g. "Dashed border, muted text, never sad.")
- **Drag affordance (if used):** None — tasks move between columns using a status dropdown. (e.g. "None — we use a status dropdown.")

## 5. Voice / microcopy

Three lines of microcopy that capture the tone of the product. Keep it short — these are the words a stressed user reads at 11pm.

| Where | Text |
|---|---|
| "+" button label | `+ Add Task` (e.g. "+ Task" or "Add task" or "New") |
| Empty column placeholder | `No tasks here yet.` (e.g. "Nothing here yet — keep going.") |
| Toast after "Copy as Prompt Context" | `Context copied. Ready to paste into your AI tool.` (e.g. "Copied. Now paste it into the AI.") |
| Confirm-delete message | `Delete this task? This action cannot be undone.` (e.g. "Delete this task? You can't undo.") |
| Handoff toast (M7 `task-owner`) | `Task assigned to {name}.` (e.g. "Handed off to {name}. They've got it.") |

## 6. Logo / wordmark

The tracker probably doesn't need a logo, but it does need a name and a wordmark style.

- **Product name:** `FlowState` (match PRD §11 team identity)
- **Wordmark style:** `FlowState in Inter semibold, brand-primary colour, without an icon.` (e.g. "Just the name in the heading font, brand-primary color, no icon.")

## 7. Out of scope (this hackathon)

To keep design tight, the following are explicitly not part of `design-done`:

- A dark mode toggle. Pick one mode and ship it.
- Multiple themes. One brand, applied consistently.
- Animations beyond a 200 ms fade on toast notifications.
- A custom icon set. Use [Lucide icons](https://lucide.dev) via Tailwind classes if you need any.

---

*DESIGN.md version: hackathon-starter v1*
