# 🧩 Pixelect

**모자이크 처리된 이미지를 보고 정답을 맞추는 캐주얼 퀴즈 게임**

> Pixel + Select = Pixelect

🔗 **[Play Now → pixelect-psi.vercel.app](https://pixelect-psi.vercel.app)**

---

## 게임 방법

1. 모자이크(픽셀화) 처리된 이미지가 출제됩니다
2. 3개의 선택지 중 정답을 고르세요
3. 제한 시간은 **5초** — 직감을 믿으세요!
4. 연속 정답(스트릭)을 쌓아 최고 기록에 도전하세요
5. 정답/오답 시 원본 이미지가 점진적으로 공개됩니다

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Vite + React |
| 이미지 소싱 | Unsplash API |
| 픽셀화 | Canvas API (클라이언트 처리) |
| 스타일링 | Vanilla CSS (Wordle 스타일, 라이트/다크 모드) |
| 배포 | Vercel (GitHub 연동 CI/CD) |
| 상태 관리 | Custom Hook (useGameState) |

---

## 주요 기능

- **Canvas 기반 실시간 픽셀화** — CSS filter가 아닌 Canvas API로 진짜 모자이크 블록 생성
- **점진적 해제 애니메이션** — 정답/오답 시 pixelSize를 16→1로 줄이며 원본 공개 (easeOutCubic 이징)
- **1,004개 키워드 풀** — 12개 카테고리 (동물, 음식, 랜드마크, 사물, 탈것, 자연, 건물, 스포츠, 과학, 예술, 직업, 기호)
- **다국어 키워드 구조** — `{"ko": "레이디 가가", "query": "Lady Gaga"}` 유저 노출용/API 검색용 분리
- **라이트/다크 모드** — `prefers-color-scheme` 미디어쿼리 자동 전환
- **모바일 퍼스트 + 반응형** — 모바일 세로 1컬럼 / PC 가로 2컬럼
- **OG 메타 태그** — 카톡/슬랙/SNS 링크 공유 시 썸네일 표시

---

## 로컬 실행

```bash
# 1. 클론
git clone https://github.com/SeungyongJasperLee/pixelect.git
cd pixelect

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
#    Unsplash 개발자 등록 후 Access Key 발급
#    https://unsplash.com/developers
echo "VITE_UNSPLASH_KEY=your_access_key" > .env

# 4. 개발 서버 실행
npm run dev
```

---

## 프로젝트 구조

```
pixelect/
├── public/
│   └── og-image.png            ← OG 썸네일
├── src/
│   ├── components/
│   │   ├── WelcomeModal.jsx    ← 최초진입 팝업
│   │   ├── GameScreen.jsx      ← 게임 중 화면
│   │   ├── RevealOverlay.jsx   ← 정답 시 (점진적 해제 + 카운트다운)
│   │   └── GameOverOverlay.jsx ← 게임종료 (점진적 해제 + 기록)
│   ├── hooks/
│   │   └── useGameState.js     ← 게임 로직 전체
│   ├── utils/
│   │   ├── unsplash.js         ← Unsplash API + 세션 캐시
│   │   └── pixelate.js         ← Canvas 픽셀화 + 해제 애니메이션
│   ├── data/
│   │   └── quizBank.json       ← 키워드 풀 (1,004개)
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── .env                        ← API 키 (Git 제외)
├── index.html
└── package.json
```

---

## 설계 결정 기록

주요 UX/기술 결정은 Notion Design Decision Log에 기록합니다.

| ID | 결정 | 요약 |
|----|------|------|
| DDL-001 | 이미지 소싱 | Google → Unsplash API (무료, 상업이용, 커버리지) |
| DDL-002 | 키워드 구조 | 키워드 풀 반자동화 (ko/query 분리) |
| DDL-003 | 난이도 설계 | 모자이크 강도가 난이도 레버 (카테고리 강제 X) |
| DDL-004 | 타이머 | 15s → 10s → 5s (직관적 판단 유도) |
| DDL-005 | UX 플로우 | 자동 전환 (버튼 클릭 X) + 원본 공개 |
| DDL-006 | 디자인 | Wordle 스타일 (세리프체, 미니멀) |
| DDL-007 | 해제 애니메이션 | Canvas pixelSize 점진 축소 + easeOutCubic |
| DDL-008 | OG 이미지 | 정적 1장 (클라이언트 구조 한계) |

---

## 라이선스

MIT

---

*Built by [@SeungyongJasperLee](https://github.com/SeungyongJasperLee)*
