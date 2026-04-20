# MildFist - AI Virtual Fitting Demo

패션 스타일 AI 분석 및 가상 피팅 웹 서비스 프로토타입.

**Live**: https://mildfist-demo.vercel.app
**데모 계정**: `demo@mildfist.com` / `demo1234` (관리자 권한 포함)

## 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router, TypeScript) |
| AI | Google Gemini API (gemini-2.5-flash, gemini-2.5-flash-image) |
| Style | Tailwind CSS + Pinterest DESIGN.md |
| DB | In-memory store (Vercel 서버리스 호환) |
| Auth | HMAC-signed cookie 기반 세션 |
| Deploy | Vercel |

## 페이지 구조 (7개)

| URL | 페이지 | 설명 |
|-----|--------|------|
| `/` | 스타일 피드 | 매이슨리 그리드, 최신순/인기순 정렬, 스타일 업로드 |
| `/login` | 로그인/회원가입 | 이메일 인증, 데모 계정 안내 |
| `/analyze` | AI 아이템 인식 | 사진 업로드 → Gemini 분석 → 카테고리별 아이템 리스트 |
| `/fitting` | 가상 피팅 | 내 사진 + 스타일 사진 → 아이템 선택 → AI 합성 (크레딧 차감) |
| `/mypage` | 마이페이지 | 내 스타일 / 피팅 히스토리 / 크레딧 (3탭) |
| `/style/[id]` | 스타일 상세 | 좋아요, 신고, 유사 상품 검색, 가상 피팅 진입 |
| `/terms` | 이용약관 | 약관 조회 |

## 관리자 페이지 (5개)

로그인 후 헤더 드롭다운 → "관리자" 클릭 (`demo@mildfist.com`만 관리자)

| URL | 페이지 | 기능 |
|-----|--------|------|
| `/admin` | 대시보드 | 가입자/DAU/크레딧 매출/피팅 이용 지표 + 최근 활동 |
| `/admin/members` | 회원 관리 | 검색, 상세 보기, 활성화/비활성화 |
| `/admin/contents` | 콘텐츠 관리 | 전체 콘텐츠 + 신고 접수 (숨김/삭제/무시) |
| `/admin/credits` | 크레딧 관리 | 패키지 설정, 충전 내역, 수동 지급/회수 |
| `/admin/payments` | 결제 관리 | 결제 내역, 환불 처리, 매출 통계 (일별/월별) |

## API Routes (29개)

### 인증 (5)
- `POST /api/auth/signup` — 회원가입 (가입 시 10크레딧 보너스)
- `POST /api/auth/login` — 로그인
- `POST /api/auth/logout` — 로그아웃
- `GET /api/auth/me` — 현재 사용자 조회
- `POST /api/auth/withdraw` — 회원 탈퇴

### AI (3)
- `POST /api/recognize` — 패션 아이템 인식 (Gemini Vision)
- `POST /api/fitting` — 가상 피팅 이미지 생성 (Gemini Image)
- `POST /api/search` — 유사 상품 검색 키워드 생성

### 스타일 (5)
- `GET /api/styles` — 피드 목록 (최신순/인기순, 페이지네이션)
- `POST /api/styles` — 스타일 업로드 + AI 자동 분석
- `GET /api/styles/[id]` — 스타일 상세
- `POST /api/styles/[id]/like` — 좋아요 토글
- `POST /api/styles/[id]/report` — 신고 접수

### 크레딧/피팅 (5)
- `GET /api/credits` — 잔액 + 거래 내역
- `POST /api/credits/charge` — 크레딧 충전 (10/30/50 패키지)
- `POST /api/credits/use` — 크레딧 차감
- `GET /api/fittings` — 피팅 히스토리
- `POST /api/fittings` — 피팅 결과 저장

### 관리자 (11)
- `GET /api/admin/stats` — 대시보드 통계
- `GET /api/admin/members` — 회원 목록 (검색/페이지네이션)
- `GET/PATCH /api/admin/members/[id]` — 회원 상세/상태 변경
- `GET /api/admin/contents` — 콘텐츠/신고 목록
- `PATCH /api/admin/contents/[id]` — 콘텐츠 숨김/삭제
- `PATCH /api/admin/reports/[id]` — 신고 처리/무시
- `GET /api/admin/credits` — 충전 내역
- `POST /api/admin/credits/manual` — 수동 크레딧 지급/회수
- `GET /api/admin/payments` — 결제 내역 + 매출 통계
- `POST /api/admin/payments/[id]/refund` — 환불 처리

## 데이터베이스

인메모리 스토어 (`src/lib/db.ts`). Vercel 서버리스 호환.

**테이블 6개**: users, styles, likes, reports, fittings, credit_transactions

**시드 데이터**: 3 데모 사용자 + 6 샘플 스타일 (매 콜드스타트 시 자동 생성)

| 계정 | 비밀번호 | 크레딧 | 관리자 |
|------|----------|--------|--------|
| demo@mildfist.com | demo1234 | 50 | O |
| fashion@mildfist.com | fashion1234 | 30 | X |
| test@mildfist.com | test1234 | 100 | X |

## 로컬 실행

```bash
cd prototypes/mildfist-demo
npm install
# .env.local에 GOOGLE_GEMINI_API_KEY 설정
npm run dev
# http://localhost:3000
```

## 프로덕션과의 차이

| 항목 | 프로토타입 | 프로덕션 (견적서 기준) |
|------|-----------|----------------------|
| DB | 인메모리 (콜드스타트 시 리셋) | PostgreSQL |
| 결제 | Mock (크레딧 즉시 적립) | 토스페이먼츠 PG 연동 |
| 인증 | 이메일 + 쿠키 | 카카오/구글 소셜 로그인 |
| 이미지 | Base64 인메모리 | AWS S3 |
| 디자인 | Pinterest DESIGN.md 기반 | 커스텀 UI/UX 디자인 |

## 디자인

Pinterest 디자인 시스템 기반 (`DESIGN.md`).

- Primary: #e60023 (Pinterest Red)
- Text: #211922 (Plum Black)
- Secondary: #e5e5e0 (Sand Gray)
- Border: #91918c (Warm Silver)
- Card radius: 16-20px, no shadow
- 매이슨리 그리드 피드, 반응형
