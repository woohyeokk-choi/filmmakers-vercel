# 필름메이커스 자동화 - Vercel 서버리스

🎬 필름메이커스 게시글을 **24/7 자동으로 갱신**하는 서버리스 솔루션입니다.
**Vercel + Make.com**으로 서버 없이 완전 자동화!

## 🏗️ 프로젝트 구조

```
filmmakers-vercel/
├── api/
│   └── refresh.js          # 서버리스 API 엔드포인트
├── lib/
│   └── filmmakers.js       # 핵심 자동화 함수들
├── package.json           # 의존성 설정
├── vercel.json            # Vercel 배포 설정
├── .env.example           # 환경변수 템플릿
└── README.md              # 이 파일
```

## 🚀 배포 방법

### Step 1: GitHub 저장소 생성

1. GitHub에 새 저장소 생성
2. 이 폴더 내용을 저장소에 푸시

```bash
cd filmmakers-vercel
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/사용자명/filmmakers-vercel.git
git push -u origin main
```

### Step 2: Vercel 배포

1. [Vercel 계정 생성](https://vercel.com/signup) (GitHub 연동 추천)
2. **New Project** → GitHub 저장소 선택
3. **Import** 클릭하면 자동으로 배포 시작

### Step 3: 환경변수 설정

Vercel Dashboard에서 프로젝트 선택 → **Settings** → **Environment Variables**

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `FILMMAKERS_ID` | `da2ssoho` | 필름메이커스 아이디 |
| `FILMMAKERS_PW` | `success24@@` | 필름메이커스 비밀번호 |
| `AUTH_TOKEN` | `your_secret_123` | API 보안 토큰 (선택사항) |

⚠️ **Environment** 설정에서 **All (Production, Preview, Development)** 체크

### Step 4: 재배포

환경변수 설정 후 **Deployments** 탭에서 **Redeploy** 클릭

## 🔗 API 사용법

배포 완료 후 다음 URL로 API 호출 가능:

```
POST https://your-project.vercel.app/api/refresh
```

### 직접 테스트

```bash
curl -X POST https://your-project.vercel.app/api/refresh \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_secret_123"
```

### 응답 형태

**성공 시:**
```json
{
  "success": true,
  "message": "갱신 완료",
  "timestamp": "2024-01-15T12:30:45.123Z",
  "executionTime": "2024-01-15 오후 9:30:45"
}
```

**실패 시:**
```json
{
  "success": false,
  "message": "로그인 실패",
  "timestamp": "2024-01-15T12:30:45.123Z",
  "executionTime": "2024-01-15 오후 9:30:45"
}
```

## 🤖 Make.com 연동

### Step 1: Make.com 시나리오 생성

1. [Make.com](https://www.make.com) 로그인
2. **Create a new scenario**
3. **Schedule** 모듈 추가 (30분마다 실행)
4. **HTTP** → **Make a request** 모듈 추가

### Step 2: HTTP 모듈 설정

```
URL: https://your-project.vercel.app/api/refresh
Method: POST
Headers:
  Content-Type: application/json
  Authorization: Bearer your_secret_123

Body Type: Raw
Content Type: application/json
Request content: {}
```

### Step 3: 알림 설정 (선택사항)

**Email** 모듈 추가하여 성공/실패 알림 받기:

```
Subject: [{{2.success}}] 필름메이커스 자동 갱신
Content:
실행 시간: {{2.executionTime}}
결과: {{2.message}}
```

## 📊 모니터링

### Vercel 로그 확인

1. Vercel Dashboard → **Functions** 탭
2. **View Function Logs** 클릭
3. 실시간 실행 로그 확인 가능

### Make.com 실행 기록

1. Make.com → **History** 탭
2. 각 실행의 상세 결과 확인
3. 에러 발생 시 원인 파악 가능

## ⚡ 성능 최적화

- **리전 설정**: `vercel.json`에서 `icn1` (서울) 사용
- **타임아웃**: 60초로 설정 (브라우저 실행 시간 고려)
- **메모리**: 헤드리스 브라우저 최적화됨

## 💰 비용 분석

### Vercel (무료 플랜)

- **함수 실행시간**: 월 100GB-시간
- **30분마다 실행**: ~60초 × 48회/일 × 30일 = **24시간/월**
- **여유분**: 76시간 남음 ✅

### Make.com (무료 플랜)

- **Operations**: 월 1,000회
- **30분마다 실행**: 48회/일 × 30일 = **1,440회/월**
- ⚠️ 무료 한도 초과 → **45분마다 실행** 권장 (960회/월)

## 🛠️ 문제 해결

### 자주 발생하는 오류

#### 1. 로그인 실패
```
❌ 해결법: 환경변수 FILMMAKERS_ID, FILMMAKERS_PW 확인
```

#### 2. 타임아웃 오류
```
❌ 해결법: vercel.json에서 maxDuration 증가 (최대 300초)
```

#### 3. 브라우저 실행 실패
```
❌ 해결법: Vercel 재배포 또는 Puppeteer 버전 확인
```

### 디버깅 방법

1. **Vercel 로그 확인**
2. **직접 API 테스트** (`curl` 명령어)
3. **환경변수 재설정** 후 재배포

## 🔄 업데이트 방법

1. 코드 수정 후 GitHub에 푸시
2. Vercel이 자동으로 재배포
3. Make.com에서 새 API URL 사용

## 📝 추가 기능

- **Slack 알림**: Make.com에서 Slack 모듈 추가
- **Google Sheets 로그**: 실행 기록을 스프레드시트에 저장
- **다중 계정**: 여러 필름메이커스 계정 자동화

---

## ✅ 성공 체크리스트

- [ ] GitHub 저장소 생성 및 코드 푸시
- [ ] Vercel 배포 완료
- [ ] 환경변수 설정 (ID, PW, TOKEN)
- [ ] API 직접 테스트 성공
- [ ] Make.com 시나리오 생성
- [ ] 30분/45분마다 자동 실행 확인
- [ ] 로그 모니터링 설정

## 🎉 완료!

이제 컴퓨터를 꺼도 **24/7 자동으로** 필름메이커스 게시글이 갱신됩니다!

문제가 있으면 **Vercel Functions 로그**와 **Make.com History**를 확인해보세요.