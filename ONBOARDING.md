# MildFist 프로토타입 — 인턴 온보딩 가이드

## 이 문서의 목적

이 프로젝트를 받아서 Claude Code로 개선/고도화하기 위한 컨텍스트 문서입니다.
코드를 읽기 전에 이 문서를 먼저 읽어주세요.

---

## 1. 프로젝트 개요

패션 스타일 AI 분석 + 가상 피팅 웹 서비스 프로토타입입니다.

- **고객**: 마일드피스트 (김병수 대표) — 가상 피팅 서비스 사업화 검증 중
- **견적**: 2,800만원 / 10주 (풀스택, 기획+디자인 포함)
- **현재 상태**: 프로토타입 완성, 고객 내부 테스트 후 계약 진행 예정

**핵심 기능 3가지**:
1. 패션 아이템 자동 인식 — 사진 올리면 AI가 착용 아이템 전체 분석
2. 유사 상품 탐색 — 인식된 아이템 → 구글 쇼핑 검색 링크
3. 가상 피팅 — 내 사진 + 다른 사람 스타일 사진 → AI가 합성

---

## 2. 로컬 실행 방법

```bash
git clone https://github.com/IanKim1208/mildfist-virtual-fitting.git
cd mildfist-virtual-fitting
npm install
```

`.env.local` 파일 생성:
```
GOOGLE_GEMINI_API_KEY=여기에_API_키_입력
```

> API 키는 별도로 전달받으세요. Google AI Studio (aistudio.google.com)에서 무료 발급 가능합니다.

```bash
npm run dev
# http://localhost:3000 접근
```

**데모 계정**: `demo@mildfist.com` / `demo1234` (관리자 권한 포함)

---

## 3. 기술 스택

| 구분 | 기술 | 비고 |
|------|------|------|
| Framework | Next.js 16 (App Router) | TypeScript |
| AI | Google Gemini API | Nano Banana Pro (gemini-3-pro-image-preview) |
| Style | Tailwind CSS | Pinterest DESIGN.md 참조 |
| DB | 인메모리 스토어 | Vercel 서버리스 호환용. 프로덕션에서는 PostgreSQL |
| Auth | HMAC 쿠키 기반 세션 | 프로덕션에서는 소셜 로그인 |
| Deploy | Vercel | https://mildfist-demo.vercel.app |

---

## 4. 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              ← 홈 (스타일 피드, 매이슨리 그리드)
│   ├── login/page.tsx        ← 로그인/회원가입
│   ├── analyze/page.tsx      ← AI 아이템 인식
│   ├── fitting/page.tsx      ← 가상 피팅
│   ├── mypage/page.tsx       ← 마이페이지 (3탭)
│   ├── style/[id]/page.tsx   ← 스타일 상세 (좋아요, 신고)
│   ├── terms/page.tsx        ← 이용약관
│   ├── admin/                ← 관리자 (5페이지)
│   │   ├── page.tsx          ← 대시보드
│   │   ├── members/          ← 회원 관리
│   │   ├── contents/         ← 콘텐츠 관리
│   │   ├── credits/          ← 크레딧 관리
│   │   └── payments/         ← 결제 관리
│   └── api/                  ← API Routes (29개)
│       ├── auth/             ← 인증 (5개)
│       ├── recognize/        ← AI 아이템 인식
│       ├── fitting/          ← 가상 피팅
│       ├── search/           ← 유사 상품
│       ├── styles/           ← 스타일 CRUD
│       ├── credits/          ← 크레딧
│       ├── fittings/         ← 피팅 기록
│       └── admin/            ← 관리자 API (11개)
├── components/
│   ├── AuthContext.tsx        ← 인증 상태 관리
│   └── Header.tsx             ← 네비게이션
└── lib/
    ├── gemini.ts              ← Gemini API 클라이언트 + 프롬프트
    ├── db.ts                  ← 인메모리 DB (914줄, SQL 패턴매칭)
    ├── auth.ts                ← 세션/쿠키 관리
    └── image-utils.ts         ← 이미지 리사이즈 (업로드 전 압축)
```

---

## 5. AI 기술 검증 결과 (PoC) — 반드시 읽을 것

PoC로 확인된 Gemini API의 한계입니다. 이 프로토타입 코드를 수정할 때 이 한계를 인지하고 있어야 합니다.

### 잘 되는 것
- **아이템 자동 인식**: 6개 카테고리 전부 정확 (반지까지 잡음). 상용 수준
- **유사 상품 검색 쿼리 생성**: 잘 됨
- **텍스트 기반 스타일링**: "검정 가죽 자켓 입혀줘" 같은 텍스트 지시 → 매우 좋음
- **단일 아이템 사진 간 전이**: B의 상의 1개만 → A에 적용 → 됨 (전신 사진 기준)

### 안 되는 것 (주의)
- **다중 아이템 동시 합성**: B의 상의 + C의 하의 같은 조합 → 실패 (1개만 반영되거나 무시)
- **헤어스타일 전이**: 사진 간 전이 시 헤어 변경 안 됨
- **액세서리 전이**: 소스에서 "가져오는" 게 아니라 AI가 새로 "생성"함 (정확한 복제 불가)
- **클로즈업 소스**: 전신이 안 보이는 소스 사진은 실패율 높음

### 현재 프로토타입에서의 대응
- 모델: `gemini-3-pro-image-preview` (Nano Banana Pro) 사용 중
- 프롬프트: 카테고리 포함 구조화 프롬프트 (영어)
- 아이템 선택 시 카테고리 정보 함께 전달 (`상의: 블랙 크롭 자켓` 형태)

### 개선 방향
- 다중 아이템은 **순차 합성** (1개씩 적용 후 결과를 다시 입력)으로 우회 가능
- 프롬프트 튜닝으로 품질 개선 여지 있음
- Gemini API가 빠르게 발전 중이라 새 모델 나오면 재테스트 권장

---

## 6. 현재 프로토타입 상태 + 개선 포인트

### 정상 동작하는 기능
- 회원가입/로그인/로그아웃/탈퇴
- 스타일 피드 (매이슨리 그리드, 최신순/인기순)
- 스타일 상세 (좋아요 토글, 신고)
- AI 아이템 인식 (사진 업로드 → Gemini → 결과 카드)
- 가상 피팅 (내 사진 + 스타일 사진 → 합성)
- 유사 상품 검색 (구글 쇼핑 링크)
- 크레딧 시스템 (충전/차감/내역)
- 관리자 (대시보드/회원/콘텐츠/크레딧/결제)

### 개선이 필요한 부분

**우선순위 높음**:
1. **가상 피팅 품질**: 합성 결과가 불안정함. 프롬프트 튜닝 + 순차 합성 로직 필요
2. **디자인 퀄리티**: Pinterest DESIGN.md 기반이지만 세부 UI 다듬기 필요 (간격, 정렬, 모바일 최적화)
3. **이미지 처리**: 현재 base64 인메모리 저장 → 프로덕션에서는 S3 업로드로 전환

**우선순위 중간**:
4. **에러 처리 UX**: Gemini API 실패/타임아웃 시 사용자 안내 개선
5. **로딩 UX**: 피팅 생성 중 프로그레스 표시 (현재 스피너만)
6. **피드 이미지**: 시드 데이터가 SVG 플레이스홀더 → 실제 패션 사진으로 교체
7. **반응형**: 모바일에서 관리자 사이드바, 피팅 듀얼 업로드 등 레이아웃 개선

**우선순위 낮음 (프로덕션 전환 시)**:
8. **DB 전환**: 인메모리 → PostgreSQL (Vercel Marketplace에서 Neon 등)
9. **결제 연동**: Mock → 토스페이먼츠 PG
10. **인증 전환**: 이메일+쿠키 → 카카오/구글 소셜 로그인
11. **이미지 저장소**: base64 → AWS S3 또는 Vercel Blob

---

## 7. 디자인 가이드

프로젝트 루트의 `DESIGN.md`에 Pinterest 디자인 시스템이 정의되어 있습니다.
새 UI 작업 시 이 파일을 참조하세요.

**핵심 컬러**:
- `#e60023` — 빨강 (CTA 버튼, 좋아요, 액센트)
- `#211922` — 진한 텍스트 (Plum Black)
- `#62625b` — 보조 텍스트 (Olive Gray)
- `#e5e5e0` — 보조 버튼, 배경 (Sand Gray)
- `#91918c` — 테두리, 비활성 (Warm Silver)

**규칙**:
- 카드: 16-20px radius, 그림자 없음
- 버튼: 16px radius, 패딩 8px 20px
- 피드: CSS columns로 매이슨리 그리드
- 전체적으로 따뜻한 톤 (cool gray 사용 금지)

---

## 8. Claude Code 작업 팁

이 프로젝트에서 Claude Code를 쓸 때 참고:

1. **DESIGN.md 참조 시키기**: "DESIGN.md를 읽고 그 스타일대로 만들어줘" 라고 지시하면 일관된 디자인 나옴
2. **db.ts 수정 시 주의**: SQL 패턴매칭 방식이라 새 쿼리 추가 시 패턴도 추가해야 함
3. **Gemini 프롬프트 수정**: `src/lib/gemini.ts`에 모든 프롬프트 집중. 여기만 수정하면 됨
4. **배포**: `vercel deploy --prod --yes`로 즉시 배포. 환경변수는 이미 설정됨
5. **테스트**: 로컬에서 `npm run dev` 후 데모 계정으로 로그인해서 확인

---

## 9. 참고 링크

| 자료 | 링크 |
|------|------|
| GitHub | https://github.com/IanKim1208/mildfist-virtual-fitting |
| Vercel (라이브) | https://mildfist-demo.vercel.app |
| 견적서/기능명세서 (노션) | 별도 전달 |
| Google AI Studio | https://aistudio.google.com |
| Gemini API 문서 | https://ai.google.dev/gemini-api/docs |
| Pinterest DESIGN.md | 프로젝트 루트의 DESIGN.md |
