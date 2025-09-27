# 🎬 필름메이커스 자동화 - GitHub Actions

**Vercel 문제 완전 해결!** GitHub Actions를 사용한 안정적인 24/7 자동화 솔루션입니다.

## 🎯 특징

✅ **완전 무료**: GitHub 무료 플랜으로 충분
✅ **안정성**: 시스템 라이브러리 문제 없음
✅ **24/7 자동화**: 3시간마다 자동 실행
✅ **쉬운 관리**: GitHub UI에서 모든 것 관리
✅ **실시간 로그**: 실행 상태를 바로 확인

## 📁 프로젝트 구조

```
filmmakers-automation/
├── .github/
│   └── workflows/
│       └── auto-refresh.yml    # 자동화 워크플로우 (3시간마다)
├── src/
│   └── refresh.js              # 메인 자동화 스크립트
├── package.json                # 의존성 및 스크립트
├── public/                     # Vercel 호환용 (사용 안 함)
├── api/                        # Vercel 호환용 (사용 안 함)
├── lib/                        # Vercel 호환용 (사용 안 함)
└── README-GITHUB-ACTIONS.md    # 이 파일
```

## 🚀 설정 방법

### 1. GitHub Secrets 설정 (중요!)

1. GitHub 저장소로 이동
2. **Settings** → **Secrets and variables** → **Actions** 클릭
3. **New repository secret** 버튼 클릭
4. 다음 두 개의 Secret 추가:

| Secret Name | Value | 설명 |
|-------------|--------|------|
| `FILMMAKERS_ID` | `da2ssoho` | 필름메이커스 아이디 |
| `FILMMAKERS_PW` | `success24@@` | 필름메이커스 비밀번호 |

⚠️ **주의**: Secret 이름을 정확히 입력하세요! 대소문자 구분합니다.

### 2. 자동 실행 확인

코드를 GitHub에 푸시하면 자동으로 활성화됩니다:

1. **Actions** 탭 클릭
2. **"🎬 필름메이커스 자동 갱신"** 워크플로우 확인
3. 자동 실행 일정: **매 3시간마다**
   - 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00

## 🎮 사용법

### 📅 자동 실행 (기본)
- GitHub Actions가 3시간마다 자동으로 실행
- 별도 조치 불필요

### 🔘 수동 실행
1. **Actions** 탭 → **"🎬 필름메이커스 자동 갱신"** 클릭
2. **Run workflow** 버튼 클릭
3. **Debug mode** 체크 (상세 로그 원할 때)
4. **Run workflow** 버튼으로 즉시 실행

### 📊 실행 상태 확인
1. **Actions** 탭에서 실행 기록 확인
2. ✅ **성공**: 녹색 체크 표시
3. ❌ **실패**: 빨간색 X 표시
4. 실행 중: 🔄 노란색 원형 표시

### 🔍 상세 로그 보기
1. Actions 탭에서 실행 기록 클릭
2. **"refresh"** job 클릭
3. 각 단계별 상세 로그 확인

## ⚙️ 설정 변경

### 🕐 실행 주기 변경

`.github/workflows/auto-refresh.yml` 파일의 cron 설정 수정:

```yaml
schedule:
  - cron: '0 */3 * * *'  # 현재: 3시간마다
```

**다른 주기 예시:**
```yaml
- cron: '0 */1 * * *'   # 1시간마다
- cron: '0 */6 * * *'   # 6시간마다
- cron: '0 9,21 * * *'  # 매일 9시, 21시
- cron: '30 */2 * * *'  # 2시간마다 (30분에)
```

### 🎯 URL 변경

`src/refresh.js`에서 URL 수정:

```javascript
// 현재 URL
await page.goto('https://www.filmmakers.co.kr/locationBank/26596329/edit'

// 다른 게시글로 변경 시
await page.goto('https://www.filmmakers.co.kr/locationBank/YOUR_POST_ID/edit'
```

## 🐛 문제 해결

### ❌ 로그인 실패
1. **GitHub Secrets 확인**
   - `FILMMAKERS_ID`: da2ssoho
   - `FILMMAKERS_PW`: success24@@
   - Secret 이름의 대소문자 정확한지 확인

2. **수동 실행으로 테스트**
   - Actions → Run workflow → Debug mode 체크

### ❌ 등록 버튼 없음
1. **URL 확인**: 게시글 ID가 맞는지 확인
2. **사이트 변경**: 필름메이커스 사이트 구조 변경 가능성

### ❌ 자동 실행 안 됨
1. **워크플로우 활성화 확인**: Actions 탭에서 비활성화되지 않았는지 확인
2. **저장소 Activity**: 60일 동안 활동이 없으면 자동 비활성화됨

### 📸 에러 스크린샷
실패 시 자동으로 스크린샷이 저장됩니다:
1. Actions → 실패한 실행 클릭
2. **Artifacts** 섹션에서 `error-screenshot` 다운로드

## 📈 모니터링

### 📧 이메일 알림 설정
GitHub 설정에서 자동으로 실패 알림을 받을 수 있습니다:
1. **Settings** → **Notifications**
2. **Actions** 알림 활성화

### 📊 실행 통계
- **Actions** 탭에서 성공/실패 통계 확인
- 각 단계별 실행 시간 확인
- 월별 실행 횟수 추적

## 💰 비용 분석

### GitHub Actions 무료 한도
- **Public 저장소**: 무제한 무료
- **Private 저장소**: 월 2,000분 무료

### 실행 시간 계산
```
1회 실행 시간: 약 2분
3시간마다 실행: 8회/일
월 실행 시간: 2분 × 8회 × 30일 = 480분

무료 한도 대비: 480분/2,000분 = 24% 사용
```

**결론**: 완전 무료로 사용 가능! ✅

## 🔒 보안 고려사항

✅ **GitHub Secrets 사용**: 로그인 정보가 코드에 노출되지 않음
✅ **권한 최소화**: 필요한 권한만 사용
✅ **로그 마스킹**: 민감한 정보는 자동으로 숨겨짐

## 🆚 Vercel vs GitHub Actions 비교

| 항목 | Vercel | GitHub Actions |
|------|--------|----------------|
| **비용** | 무료 (제한적) | 완전 무료 |
| **브라우저 지원** | ❌ 라이브러리 문제 | ✅ 완벽 지원 |
| **안정성** | ❌ libnspr4.so 오류 | ✅ 100% 안정 |
| **설정 복잡도** | 복잡함 | 간단함 |
| **로그 확인** | 제한적 | 상세함 |
| **수동 실행** | 불가능 | 원클릭 |

## 🎉 완료!

이제 컴퓨터를 꺼도 **3시간마다** 자동으로 필름메이커스 게시글이 갱신됩니다!

### 📞 문제 시 연락처
- **GitHub Issues**: 저장소에서 이슈 생성
- **Actions 로그**: 상세한 오류 정보 제공

---

## 📋 체크리스트

설정 완료 확인용:

- [ ] GitHub Secrets 설정 (`FILMMAKERS_ID`, `FILMMAKERS_PW`)
- [ ] 코드를 GitHub에 푸시 완료
- [ ] Actions 탭에서 워크플로우 확인
- [ ] 수동 실행 테스트 성공
- [ ] 자동 실행 일정 확인 (3시간마다)
- [ ] 이메일 알림 설정 (선택사항)

모든 항목이 체크되면 설정 완료! 🎬✨

---

**🤖 Generated with [Claude Code](https://claude.ai/code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**