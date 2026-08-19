# Google Play — Data Safety 설문지 초안

이 문서는 Play Console의 "앱 콘텐츠 → Data Safety" 섹션을 채울 때 그대로 참고하는 용도입니다.
아래 매핑은 2026-08-19 기준 실제 코드(Firestore 스키마, Firebase Analytics 이벤트,
`functions/api/analyze.ts`, `functions/api/create-checkout.ts`)를 직접 확인해서 작성했습니다.
코드가 바뀌면 이 문서도 같이 업데이트해야 합니다 (특히 신규 서드파티 연동이나 신규 수집 필드 추가 시).

Google Play Console 실제 UI 문구/카테고리명은 시점에 따라 조금씩 달라질 수 있으니, 설문지
진행하면서 이 문서의 "데이터 유형 → 처리 방식" 매핑만 정확히 참고하고, 화면에 뜨는 정확한
문구·순서는 Console에서 확인하세요.

---

## 1. 데이터를 수집/공유하나요?

**예.** 앱은 사용자 데이터를 수집합니다.

## 2. 모든 사용자 데이터가 암호화되어 전송되나요?

**예.** 모든 통신은 HTTPS입니다 (Firebase SDK, Cloudflare Pages Functions 경유 Anthropic/Polar
API 호출 포함).

## 3. 사용자가 데이터 삭제를 요청할 수 있는 방법을 제공하나요?

**예.** 앱 내 계정 삭제 기능(또는 `contact@phtlab.org` 이메일 요청)을 통해 가능 — 개인정보처리방침
7항에 명시.

---

## 4. 데이터 유형별 매핑

### 개인정보 (Personal info)

| 항목 | 수집 여부 | 공유 여부 | 목적 | 비고 |
|---|---|---|---|---|
| 이름 (Name) | ✅ 수집 | ❌ 공유 안 함 | 계정 관리, 앱 기능 | Google 로그인 시 표시 이름, 또는 이메일 가입 시 선택 입력 |
| 이메일 주소 (Email address) | ✅ 수집 | ✅ **공유함** (Polar) | 계정 관리, 앱 기능 | Pro 구독 결제 시에만 Polar로 전달 (`customer_email`) — Free 사용자는 공유 없음 |
| 사용자 ID (User IDs) | ✅ 수집 | ❌ 공유 안 함 | 계정 관리, 앱 기능 | Firebase Auth UID |

### 건강 및 피트니스 (Health and fitness)

| 항목 | 수집 여부 | 공유 여부 | 목적 | 비고 |
|---|---|---|---|---|
| 건강 정보 (Health info) | ✅ 수집 | ✅ **공유함** (Anthropic) | 앱 기능 | 통증·피로도 점수, 증상 메모, 트리거, 생리주기 데이터. AI 분석 요청 시에만 Anthropic Claude API로 전송(일시적 처리, 모델 학습 미사용) — 사용자가 "분석하기"를 누르지 않으면 전송 안 됨 |

### 앱 활동 (App activity)

| 항목 | 수집 여부 | 공유 여부 | 목적 | 비고 |
|---|---|---|---|---|
| 앱 상호작용 (App interactions) | ✅ 수집 | ❌ 공유 안 함 | 분석(Analytics) | Firebase Analytics — 화면 조회, 체크인 완료 여부(`checkin_saved`), AI 분석 요청 여부, 보고서 생성 여부, 가입 완료 여부. **통증/피로 실제 점수는 전송 안 함** — 예/아니오 플래그만(`has_pain`, `has_fatigue`) |

### 금융 정보 (Financial info)

| 항목 | 수집 여부 | 공유 여부 | 목적 | 비고 |
|---|---|---|---|---|
| 구매 내역 (Purchase history) | ✅ 수집 | ❌ 공유 안 함 | 앱 기능 | 구독 상태(`plan: free/pro`, 만료일)만 Firestore에 저장. **카드 정보는 전혀 수집 안 함** — Polar가 전적으로 처리 |

### 수집하지 않는 항목 (명시적으로 "수집 안 함"으로 표시할 것)

- 위치 정보 (Location) — **코드 확인 결과 수집 안 함.** `LogEntry.weather` 필드가 타입 정의에는
  존재하지만, 실제로 값을 채우는 구현이 어디에도 없음 (날씨 자동 연동 기능은 아직 구현되지 않음).
  GPS/정밀 위치 API 호출 없음. 이에 맞춰 개인정보처리방침의 "날씨" 트리거 예시도 "환경 요인"으로
  수정함 (2026-08-19) — 나중에 날씨 자동 연동 기능을 실제로 추가하면, 이 문서와 개인정보처리방침
  Section 1.2, Data Safety 위치 정보 항목을 모두 다시 "수집함"으로 업데이트해야 함
- 사진/동영상 (Photos or videos)
- 오디오 (Audio files)
- 연락처 (Contacts)
- 캘린더
- 문자메시지
- 통화 기록

---

## 5. ⚠️ 배포 전 재확인 필요한 항목

1. **광고 ID(Advertising ID) 미사용 여부** — 광고를 안 쓰므로 수집 안 함이 맞겠지만, Firebase
   Analytics SDK가 기본적으로 광고 ID를 요청하는 경우가 있어 Console 설정에서 명시적으로 꺼야 함.
2. **미성년자 대상 여부** — 개인정보처리방침 8항("만 14세 미만 미대상")과 Play Console의
   "Target age" 설정이 일치해야 함.

---

## 6. 참고 — 이 문서의 근거가 된 코드 위치

- Firestore 스키마: `src/types/index.ts` (`LogEntry`, `UserProfile`)
- Analytics 이벤트: `src/lib/trackEvent.ts` 호출부 (`HomePage.tsx`, `InsightsPage.tsx`,
  `ReportPage.tsx`, `OnboardingPage.tsx`)
- Anthropic API 전송 데이터: `functions/api/analyze.ts`
- Polar 전송 데이터: `functions/api/create-checkout.ts`
- 개인정보처리방침: `src/content/privacy-en.md` / `-ko.md` / `-es.md`
