# 시소 (Seesaw)

> **A/B 투표 플랫폼** — 하나의 주제에 두 개의 선택지(A vs B)를 두고 투표하며 참여자끼리 실시간으로 토론하는 웹 서비스.

> **이 저장소는 프론트엔드(클라이언트)입니다.** 서버 로직은 별도의 **seesaw-api**(NestJS · MariaDB · MikroORM · Socket.IO · Cloudinary) 저장소가 담당합니다.
> 클라이언트는 **화면 구성과 사용자 상호작용**을 소유하고, 서버는 **인증, 투표 완료 판정, 결과 공개 기준, 포인트 배팅 정산, 채팅 이력 저장, 이미지 업로드 권한 발급** 같은 도메인 규칙과 데이터 일관성을 책임집니다. 이 경계는 [§5 클라이언트 · 서버 책임 경계](#클라이언트--서버-책임-경계)에서 자세히 정리합니다.

---

## 1. 프로젝트 소개

**시소**는 "A vs B, 다들 어떻게 생각해?"라는 순간을 가볍게 투표로 만들고 토론하는 서비스입니다.

- **문제** — 상품 로고 시안, 팀 회식 메뉴, 밸런스 게임처럼 "둘 중 하나"를 정해야 하는 상황은 많지만, 의견을 모으고 결과를 한눈에 보기는 번거롭습니다.
- **목적** — 최대 24시간짜리 A/B 투표를 누구나 몇 번의 탭으로 만들고, 참여하고, 결과와 소속별 분포까지 즉시 확인하게 합니다.
- **사용자 가치**
  - 투표에 **참여해야** 결과와 토론이 열리는 구조 → 눈팅보다 참여를 유도
  - **실시간 토론**으로 단순 투표를 넘어 의견 교환까지

---

## 2. 주요 기능

### 투표

- **진행중 / 완료 투표 목록** — 카테고리 필터, 정렬(최신/마감임박/참여순), 커서 기반 **무한 스크롤**(하단 도달 시 다음 페이지 자동 로드, `IntersectionObserver` + `useInfiniteQuery`)
- **핫한 투표(대표 투표)** 메인 노출 — 남은 시간 실시간 카운트다운(마감 10분 이내는 강조)
- **투표 상세** — 카테고리, 참여자 수, 남은 시간, A/B 선택지(이미지 포함), 시소 비율 그래픽
- **투표 참여** — A/B 선택 후 제출. 참여 전에는 결과·토론이 잠김
- **결과 확인** — 참여했거나 마감된 투표는 A/B 비율 + **소속별 통계** 표시. 결과는 내가 투표한 순간(또는 페이지 재진입 시) 서버에서 다시 불러와 갱신되며, 다른 사람의 투표가 실시간으로 푸시되지는 않습니다 — 실시간 푸시는 토론(채팅)에만 적용됩니다.
- **내가 만든 / 참여한 투표** 조회 (로그인 시)

### 투표 생성

- 4개 카테고리 선택: **업무 / 일상 / 밸런스 / 배팅**
- 제목 + A/B 선택지 입력, 선택지별 **이미지 첨부**
- 이미지는 **서명 기반 업로드**로 Cloudinary에 직접 올리고 URL만 저장
- 마감 시간은 휠 피커로 **정각 단위, 최대 24시간** 내 선택

### 배팅 (토큰 내기)

- 배팅 카테고리는 참여 시 **토큰을 걸고** 투표
- **주최자**가 승자(A/B)를 확정 → 되돌릴 수 없음
- 확정 후 **참여자는 보상 토큰 수령**(정산 배율에 따라), 수령 시 폭죽 효과

### 실시간 토론

- 투표별 채팅(Socket.IO) — **참여한 사용자만** 열람/작성 가능
- 이전 메시지 **무한 스크롤**, 같은 사람 연속 메시지 그룹핑(닉네임·시간 중복 제거)

### 계정 · 기타

- **로그인 / 회원가입** (모달) — 닉네임 중복 확인, 랜덤 닉네임 추천, 소속 선택, 비밀번호 8자 이상, 가입 시 1,000 토큰 지급
- **현황판** — 진행중 투표 수, 참여자 수, 내 보유 토큰 요약
- 모바일 우선 **반응형 UI**(바텀시트, 휠 피커 등 모바일 친화 컴포넌트)

---

## 3. 사용자 흐름

```txt
                       ┌─ (미로그인) 로그인 / 회원가입 모달
메인 페이지 ────────────┤
 (현황판·핫한 투표·목록)     └─ 투표 만들기 (카테고리 → 제목·선택지·이미지·마감시간)
      │
      ▼
투표 상세 (/votes/:id)
      │
      ├─ 참여 전:  A/B 선택 → 투표  (배팅이면 토큰 걸기)
      │                 │
      │                 ▼
      └─ 참여 후:  결과(A/B 비율·소속별 통계) 확인  +  실시간 토론 참여
                        │
              (배팅) 주최자 승자 확정 → 참여자 토큰 수령 가능
```

---

## 4. 아키텍쳐 구조 — Feature-Sliced Design (FSD)

레이어는 위에서 아래로만 의존합니다. 각 슬라이스는 `index.ts` 공개 API로만 노출/소비합니다.

```txt
app → pages → widgets → features → entities → shared
```

| 레이어     | 역할                                       | 예시                                                                                               |
| ---------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `app`      | 앱 초기화, 라우터, 프로바이더, 전역 스타일 | `RootLayout`, `router`, `QueryProvider`                                                            |
| `pages`    | 라우트별 페이지(얇게, 하위 조합)           | `main`, `vote-detail`                                                                              |
| `widgets`  | 큰 UI 블록                                 | `header`, `home-hero`, `featured-vote`, `vote-event-board`, `create-vote-fab`                      |
| `features` | 사용자 액션·비즈니스 상호작용              | `auth`, `create-vote`, `cast-vote`, `discussion`, `claim-betting-reward`, `confirm-betting-result` |
| `entities` | 도메인 모델(api / model / ui)              | `vote-event`, `chat`, `user`, `affiliation`, `home`                                                |
| `shared`   | 도메인 비종속 재사용 코드                  | `api`(httpClient), `lib`(auth·타이머 등), `ui`(공용 컴포넌트)                                      |

**라우팅** (`src/app/router/router.tsx`, `createBrowserRouter`)

| 경로         | 화면             | 비고                     |
| ------------ | ---------------- | ------------------------ |
| `/`          | 메인             | 공통 `Header` + 레이아웃 |
| `/votes/:id` | 투표 상세        | 자체 헤더(뒤로가기)      |
| `*`          | `/`로 리다이렉트 |                          |

- 인증은 **컴포넌트/쿼리 단에서 게이팅**(로그인 필요 쿼리는 `enabled: isAuthenticated()`, 비로그인 시 생성 대신 로그인 모달 노출)하고, 실제 인가는 서버가 강제합니다.
- 페이지는 `React.lazy` + `Suspense`로 코드 스플리팅.

---

## 5. API 통신 처리

모든 서버 상태는 **TanStack Query**로 관리합니다. 컴포넌트는 API 함수를 직접 부르지 않고 슬라이스 `model`의 쿼리/뮤테이션 훅을 소비합니다.

**HTTP 클라이언트** (`src/shared/api/httpClient.ts`)

- **Base URL**: `/api/v2` (상대경로 → dev 프록시 / 배포 rewrite가 백엔드로 전달, 클라이언트에 백엔드 주소 노출 없음)
- **인증**: 요청 시 `Authorization: Bearer <accessToken>` 자동 첨부, `credentials: "include"`
- **토큰 갱신**: `401` 응답 시 `POST /auth/refresh`(HttpOnly refreshToken 쿠키 기반)로 accessToken 재발급 후 원 요청 1회 재시도. 동시 401은 갱신 요청을 **공유(dedupe)**
- **응답 언래핑**: 서버 공통 봉투 `{ data }`를 벗겨 호출부에 `data`만 반환
- **에러**: 비정상 응답은 `HttpError(status)`로 throw → 각 기능이 상태코드별 메시지로 변환

**주요 엔드포인트** (전부 `/api/v2` 하위)

| 도메인    | 메서드 · 경로                                                                          |
| --------- | -------------------------------------------------------------------------------------- |
| 인증      | `POST /auth/login`, `POST /auth/refresh`, `POST /register`                             |
| 홈/현황판 | `GET /home`                                                                            |
| 소속      | `GET /affiliations`                                                                    |
| 닉네임    | `GET /users/nickname-availability`, `GET /users/nickname-suggestion`                   |
| 투표 목록 | `GET /ongoing-vote-events`, `GET /completed-vote-events`                               |
| 내 투표   | `GET /me/created-vote-events`, `GET /me/participated-vote-events`                      |
| 투표 상세 | `GET /vote-events/{id}`                                                                |
| 투표 생성 | `POST /vote-events`, `POST /image-uploads`(이미지 서명)                                |
| 투표 참여 | `POST /vote`                                                                           |
| 채팅      | `GET /vote-events/{id}/chat-messages`                                                  |
| 배팅      | `POST /vote-events/{id}/betting-result`, `POST /vote-events/{id}/betting-reward/claim` |

**실시간(Socket.IO)** (`src/entities/chat/model/useChatSocket.ts`)

- 네임스페이스 `/api/v2/chats`, path `/api/v2/socket.io`, 핸드셰이크 `auth.accessToken`
- 진입 시 api로 토론 히스토리(최대 50개, 그 이후는 무한 스크롤)를 먼저 확보한 뒤 소켓 연결
- 이벤트: 송신 `chat:join` / `chat:message:send`, 수신 `chat:message:new`
- `id` + `clientMessageId`로 중복 제거(내 메시지 에코 방지), 커서로 이전 메시지 prepend

**인증 토큰** (`src/shared/lib/auth.ts`) — accessToken은 `localStorage`(`seesaw_token`)에 저장, `getNickname()`은 JWT 페이로드를 디코드해 닉네임을 읽습니다. refreshToken은 JS가 접근 못 하는 HttpOnly 쿠키.

### 클라이언트 · 서버 책임 경계

도메인 규칙의 **최종 판정은 서버(Seesaw API)** 가 하고, 클라이언트는 응답을 그대로 신뢰해 렌더링합니다. 아래 규칙들은 화면 표시 정책이 아니라 서버 비즈니스 규칙이므로 클라이언트에서 임의로 재계산·재해석하지 않습니다.

| 규칙              | 서버(Seesaw API)가 강제하는 것                                                                               | 클라이언트가 하는 것                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| **진행중 / 완료** | 저장된 마감 시각 + 배팅 결과 확정 여부로 판정 (클라이언트 시간 아님)                                         | 목록을 진행/완료로 나눠 보여주고, 남은 시간은 표시용 카운트다운으로만 사용 |
| **결과 공개**     | 진행중·미참여 → 숨김 / 진행중·참여 → 공개 / 완료 → 로그인·참여 무관 공개                                     | 서버가 내려준 결과 필드 유무에 따라 그대로 노출 (자체 게이팅 로직 없음)    |
| **투표 참여**     | 1인 1회, 마감·확정된 투표 재참여 차단, 배팅은 포인트 확인·차감·집계를 한 트랜잭션에서 처리                   | A/B 선택·토큰 걸기 UI 제공, 실패 응답을 상태코드별 메시지로 변환           |
| **배팅 정산**     | 결과 확정은 상태만 기록, 실제 지급은 **수령 요청 시** 승자 풀·패자 풀 비례로 계산 (멱등 — 중복 수령 안전)    | 주최자 승자 확정 UI, 참여자 보상 수령 트리거 + 수령 성공 시 폭죽 효과      |
| **이미지 업로드** | Cloudinary 직접 업로드용 **서명(제한 권한)만 발급**, 바이너리는 저장하지 않고 URL만 도메인 데이터로 보관     | 서명을 받아 Cloudinary에 직접 업로드하고, 반환된 URL을 선택지에 실어 전송  |
| **채팅 저장**     | 투표 이벤트를 하나의 대화 공간으로 취급, 메시지 영속 저장 후 실시간 전달, `clientMessageId`로 중복 저장 방지 | 참여자에게만 패널 노출, 소켓 구독·전송, 에코/중복 메시지 클라이언트단 제거 |

---

## 6. 로컬 실행 방법

**요구 사항**: Node.js 22+, npm

```bash
# 1) 의존성 설치
npm install

# 2) 환경변수 설정 (아래 7번 참고)
echo "VITE_API_URL=http://your-backend-host" > .env

# 3) 개발 서버 (http://localhost:5173)
npm run dev

# 그 외
npm run build     # 타입체크(tsc -b) + 프로덕션 빌드
npm run preview   # 빌드 결과 로컬 미리보기
npm run lint      # ESLint
```

개발 서버는 `vite.config.ts`의 프록시로 `/api`(HTTP)와 `/socket.io`(WebSocket, `ws:true`) 요청을 `VITE_API_URL`로 전달합니다. → CORS 없이 same-origin으로 개발.

---

## 7. 환경변수 설정

프로젝트 루트 `.env`:

```bash
# 백엔드 호스트 (도메인까지만 — 뒤 슬래시·/api 없이)
VITE_API_URL=http://your-backend-host
```

- **개발**: Vite dev 프록시의 타깃으로 사용
- **배포(Vercel)**: `vercel.ts`가 **빌드 시점에** 이 값을 읽어 `/api/*` rewrite 대상으로 사용. Vercel 프로젝트 **Settings → Environment Variables**에 동일하게 등록해야 함
- 클라이언트 코드는 API를 항상 `/api/v2` **상대경로**로 호출하므로 이 주소가 브라우저 번들에 직접 박히지 않습니다.

---

## 8. 배포 방식 (Vercel)

- 라우팅 설정은 **`vercel.ts`(programmatic config)** 로 관리합니다. (`vercel.json` 미사용 — 정적 파일이라 환경변수 주입이 안 되기 때문)
- rewrite 규칙:
  - `/api/(.*)` → `${VITE_API_URL}/api/$1` (백엔드 프록시)
  - `/(.*)` → `/index.html` (SPA fallback)
- **실시간 채팅 주의**: Vercel rewrite는 WebSocket 업그레이드를 프록시하지 못하므로, Socket.IO는 **polling 전송**으로 동작하도록 고정되어 있습니다.

---

## 9. 폴더 구조

```txt
src
├─ app                      # 앱 초기화
│  ├─ providers             # QueryProvider, queryClient
│  ├─ router                # createBrowserRouter 설정
│  ├─ RootLayout / MainLayout / app.tsx
│  └─ (전역 스타일 index.css)
├─ pages
│  ├─ main                  # 현황판 + 핫투표 + 목록 + 생성 FAB
│  └─ vote-detail           # 투표 상세(결과·토론·배팅)
├─ widgets
│  ├─ header                # 로고, 닉네임/토큰, 로그인/로그아웃
│  ├─ home-hero             # 현황판
│  ├─ featured-vote         # 핫한 투표
│  ├─ vote-event-board      # 진행중/완료 목록·필터
│  └─ create-vote-fab       # 투표 만들기 플로팅 버튼
├─ features
│  ├─ auth                  # 로그인/회원가입 모달
│  ├─ create-vote           # 투표 만들기(카테고리→상세)
│  ├─ cast-vote             # A/B 투표·토큰 배팅
│  ├─ discussion            # 실시간 채팅 패널
│  ├─ confirm-betting-result# (주최자) 승자 확정
│  └─ claim-betting-reward  # (참여자) 보상 토큰 수령
├─ entities
│  ├─ vote-event            # 투표 도메인(api/model/ui, 시소 그래픽)
│  ├─ chat                  # 채팅(api + useChatSocket)
│  ├─ user                  # 닉네임 확인/추천
│  ├─ affiliation           # 소속 목록
│  └─ home                  # 홈 현황판 요약
└─ shared
   ├─ api                   # httpClient, HttpError, 공통 타입
   ├─ lib                   # auth(JWT), useLiveRemaining(타이머), 검증기 등
   └─ ui                    # Modal, BottomSheet, WheelPicker, Confetti, Select …
```

---

## 10. 기술 스택과 선택 이유

| 기술                      | 선택 이유                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **React 19 + TypeScript** | 컴포넌트 기반 UI + 타입 안정성. 모든 요청/응답에 명시적 타입                                                  |
| **Vite 8**                | 빠른 dev 서버·HMR, 간단한 프록시 설정, 경량 빌드                                                              |
| **Feature-Sliced Design** | 기능이 늘어도 의존 방향과 경계를 강제해 유지보수성 확보                                                       |
| **TanStack Query**        | 서버 상태(캐싱·무효화·페이지네이션)를 선언적으로 관리. 별도 전역 상태 라이브러리 불필요                       |
| **React Router 7**        | SPA 라우팅 + `lazy`/`Suspense` 코드 스플리팅                                                                  |
| **Tailwind CSS v4**       | 유틸리티 기반 빠른 스타일링, `@theme` 디자인 토큰으로 색·폰트 일관성 (`--color-primary`, `--color-canvas` 등) |
| **Socket.IO**             | 양방향 실시간 채팅. polling 폴백으로 배포 환경 제약(Vercel WS 미지원) 대응                                    |
| **Radix UI (Select)**     | 접근성 갖춘 헤드리스 컴포넌트를 토큰 스타일로 감싸 사용                                                       |
| **Pretendard**            | 한글 가독성이 좋은 기본 폰트                                                                                  |

### 코드 컨벤션

- 경로 별칭 `@/` → `src/`
- 서버 상태 → TanStack Query, 단순 UI 상태 → 로컬 state (전역 상태 라이브러리 미사용)
- 파일명: 컴포넌트(`.tsx`) PascalCase, 그 외(`.ts`) camelCase, 공개 배럴은 `index.ts`
- 스타일은 Tailwind 유틸리티 + 디자인 토큰(하드코딩 색상 지양)
- 커밋 전 `npm run lint` · `npm run build` 통과 확인
