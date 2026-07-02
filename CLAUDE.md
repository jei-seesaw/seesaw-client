# Seesaw (시소)

A/B voting platform. Users create polls with two opposing options, vote, accumulate
participation tokens, and discuss in real-time. The product metaphor is a **seesaw** —
the A/B ratio visually tips like a seesaw as votes come in.

## Domain Glossary

| Term (KR)     | Term (EN)    | Meaning                                                            |
| ------------- | ------------ | ------------------------------------------------------------------ |
| 투표          | vote / poll  | A topic with exactly two options (A vs B).                         |
| 진행중인 투표 | active vote  | A vote whose deadline has not passed.                              |
| 완료된 투표   | closed vote  | A vote past its deadline; results are revealed.                    |
| 핫한 투표     | hot vote     | The single most-engaged active vote, featured on main.             |
| 토큰          | token        | Participation points accumulated across votes.                     |
| 토론          | talk         | Real-time chat attached to a vote (WebSocket).                     |
| 밸겜          | balance game | A vote category (밸런스게임).                                      |
| 현황판        | stats board  | Main-page summary: active count, total participants, total tokens. |

### Categories

A vote always belongs to exactly one category: `업무` (work), `일상` (daily),
`밸겜` (balance game), `스포츠` (sports).

### Business Rules

- A vote's deadline is **always 24 hours** after creation. Do not expose a
  custom-duration input in the create flow.
- A vote has **exactly two options**, A and B. Never model three or more.
- Each option has a **name (label)** and an **optional image**. The image is
  uploaded at create time; model it as a URL on the option (`imageUrl?: string`).
- Results stay hidden until the user has voted (some votes are "투표 후 결과 공개").
  Treat result visibility as gated by the current user's participation.
- talk is gated the same way: "투표에 참여하면 토론을 볼 수 있어요".

### Timer Display Rules

Centralize this in `shared/lib` — never reimplement per component.

- **Hot vote (featured):** `hh:mm:ss` countdown.
- **Vote list / card:**
  - remaining < 1 hour → `mm:ss 후 종료`
  - remaining ≥ 1 hour → `N시간 후 종료`
- **Closed vote:** show closed state, not a countdown.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4 (via `@tailwindcss/vite`, configured in `vite.config.ts`;
  there is **no** `tailwind.config.js` or `postcss.config.js`)
- React Router
- TanStack Query (server state)
- WebSocket (real-time talk)
- MSW (API + WebSocket mocking)

## Architecture — Feature-Sliced Design (FSD)

```txt
src
├─ app        # init, router, providers, query client, global styles
├─ pages      # one component per route, thin, composes lower layers
├─ widgets    # large UI blocks composed from features/entities
├─ features   # user actions & business interactions
├─ entities   # domain models (api / model / ui)
├─ shared     # domain-agnostic reusable code
└─ mocks      # MSW setup, handlers, mock data
```

### Import Direction

```txt
app → pages → widgets → features → entities → shared
```

Lower layers must never import from higher layers. Allowed: `features → entities, shared`;
`entities → shared`. Not allowed: `shared → entities`, `entities → features`,
`features → widgets`, etc.

### Module Boundaries

Expose every slice through an `index.ts` public API. Import from the slice root,
never from internal segments.

```ts
// Good
import { VoteCard } from "@/entities/vote";
import { CreateVoteModal } from "@/features/create-vote";

// Avoid
import { VoteCard } from "@/entities/vote/ui/vote-card";
```

### Slice Structure

Prefer `api` / `model` / `ui` segments. Add others only when necessary. Avoid deep nesting.

## Planned Slices

These reflect the current product scope. Add slices as features land; keep names stable.

### entities

```txt
entities/vote          # the poll model
├─ api                 # fetch active/closed/hot votes, vote detail
├─ model               # types, queries.ts, query-keys.ts, timer-derived state
└─ ui                  # VoteCard, VoteOptionPair (A vs B), CategoryBadge

entities/user
├─ api                 # current user, nickname availability
├─ model               # User type, auth queries/keys
└─ ui                  # (domain-specific user UI if needed)

entities/talk
├─ api                 # message history fetch
├─ model               # Message type, websocket connection hook
└─ ui                  # MessageItem, MessageList
```

### features

```txt
features/cast-vote            # select A/B and submit; reveals results + talk
features/create-vote          # 투표 만들기 modal (category + A/B; deadline fixed 24h)
features/vote-filter-tabs     # 진행중인 투표 / 완료된 투표 tabs
features/share-vote           # 공유하기
features/talk-socket      # WebSocket chat send/receive
features/sign-up              # nickname dup-check, random nickname, password rules
features/sign-in              # login; success → main, failure → modal
```

### widgets

```txt
widgets/header                # logo, active/closed tabs, search, login button
widgets/stats-board           # 현황판: active count, total participants, total tokens
widgets/hot-vote              # featured vote with hh:mm:ss timer + seesaw ratio animation
widgets/active-vote-list      # list + "다른 투표" carousel
widgets/create-vote-fab       # floating "투표 만들기" button
```

### pages

```txt
pages/main          # stats board, hot vote, tabs, vote list, create FAB
pages/vote-detail   # vote, A/B ratio animation, share, gated talk chat
pages/sign-up
pages/sign-in
```

## Feature Requirements

### Main page

- Stats board: active vote count, total participants, cumulative tokens.
- Exactly one hot vote featured with `hh:mm:ss` timer.
- `진행중인 투표` / `완료된 투표` tabs.
- Active vote list using the timer display rules above.
- Floating `투표 만들기` button.

### Vote detail page

- Share action.
- Real-time talk via WebSocket — **gated** until the user has voted.
- On entry, animate the A/B ratio: a seesaw-style tip / push animation reflecting
  the current split. Keep the animation in `widgets/hot-vote` or a shared UI primitive,
  driven by ratio props.

### Create-vote modal

- One of four categories: 업무 / 일상 / 밸겜 / 스포츠.
- Title (투표 제목).
- Two options (A and B). For **each** option:
  - a name/label (`A안`, `B안`)
  - an optional image upload (이미지 추가)
- Deadline is fixed at 24h — not user-editable.

Upload handling: send images to the upload endpoint (mocked via MSW), store the
returned URL on the option. Validate type/size client-side in `shared/lib` and reuse
the same image preview primitive from `shared/ui`.

### Sign-up page

- Nickname duplicate check (calls availability API).
- Random nickname suggestion.
- Password: **8자 이상** (그 외 제약 없음). Put this validator in `shared/lib` and reuse it.

### Sign-in page

- Success → navigate to main.
- Failure → show a modal.

## Query Rules

- TanStack Query for all server state.
- Query hooks live in the slice's `model` layer; keep `query-keys.ts` beside them.
- Components consume query hooks, **never** API functions directly.

## API & Real-time Rules

- Keep request functions in the owning slice's `api` segment.
- No `fetch`/client calls inside UI components.
- Define explicit TS types for every request and response.
- Mock all HTTP and WebSocket traffic with MSW under `mocks/`.
- WebSocket connection logic lives in `entities/talk/model`; UI components
  subscribe via a hook, they do not open sockets themselves.

## Styling Rules

- Tailwind CSS utility classes; avoid custom CSS and inline styles.
- Use design tokens via CSS variables / Tailwind theme — no hardcoded colors when a
  token exists. (Existing tokens live in `src/index.css`: `--text`, `--text-h`,
  `--bg`, `--border`, …)
- Primary font: **Pretendard**.

## State Management

- Server state → TanStack Query.
- Simple UI state → local React state.
- Do not add a global state library unless a real need appears.

## Component Rules

- Functional components, small and focused.
- Reusable primitives → `shared/ui`; domain UI → `entities/*/ui`.
- Prefer composition over prop drilling. Avoid unnecessary abstractions.
- Keep components and hooks close to the slice that owns them.

## Conventions

- Path alias `@/` → `src/` (configure in `vite.config.ts` + `tsconfig`).
- Run `npm run lint` and `npm run build` before considering a change done.

### File Naming

- **Component files (`.tsx`) use PascalCase**, matching the component name:
  `ErrorPage.tsx`, `LoadingSpinner.tsx` — not `error-page.tsx`.
- Non-component files (`.ts` — utilities, hooks, api, model, config) use
  camelCase: `useCountdown.ts`, `queryKeys.ts`, `auth.ts`.
- Public-API barrels are always `index.ts`.
