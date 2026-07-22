# Portfolio Viewer

이미지 기반 슬라이드 포트폴리오를 보여주는 정적 웹 뷰어입니다. 프레임워크 없이 순수 HTML/CSS/JS로 만들어졌고, GitHub Pages에 그대로 배포할 수 있습니다.

## 폴더 구조

```
portfolio-viewer/
├── index.html
├── config.json          # 파일명, 다운로드 파일 경로 등 설정
├── css/style.css
├── js/app.js
├── images/               # 슬라이드 PNG를 여기에 추가
│   └── manifest.json     # (선택) 이미지 목록을 직접 지정할 때만 사용
├── files/                 # 다운로드용 원본 파일(PDF 등)
└── scripts/generate-manifest.js  # (선택) manifest.json 자동 생성 스크립트
```

## 슬라이드 이미지 추가하기

`images/` 폴더에 순서대로 번호를 매겨 PNG 파일을 넣으면 됩니다.

```
images/01.png
images/02.png
images/03.png
...
```

- 첫 로드 시 `01.png`부터 순서대로 존재 여부를 확인해서 자동으로 슬라이드 개수를 인식합니다. 이미지 개수를 코드에 하드코딩할 필요가 없습니다.
- 2자리(`01`), 3자리(`001`), 무패딩(`1`) 넘버링을 모두 자동 인식합니다. 파일명 폭은 통일해서 사용하세요.
- 이미지를 추가/삭제한 뒤 별도 빌드 과정 없이 새로고침만 하면 반영됩니다.

### (선택) manifest.json으로 직접 지정하기

파일명이 순차 번호 규칙을 따르지 않거나, 매 요청마다 존재 여부를 확인하는 과정을 건너뛰고 싶다면 `images/manifest.json`에 파일명 배열을 직접 적어도 됩니다. 이 파일이 있으면 자동 탐색보다 우선 적용됩니다.

```json
["01.png", "02.png", "03.png"]
```

Node.js가 있다면 아래 스크립트로 `images/` 폴더를 스캔해 자동 생성할 수도 있습니다.

```bash
node scripts/generate-manifest.js
```

## 다운로드용 원본 파일

헤더 좌측의 다운로드 버튼은 `config.json`의 `downloadFile` 경로를 가리킵니다. `files/` 폴더에 원본 포트폴리오 파일(PDF 등)을 넣고 `config.json`을 아래처럼 맞춰주세요.

```json
{
  "fileName": "KimMinji_Portfolio.pdf",
  "downloadFile": "files/KimMinji_Portfolio.pdf",
  "imageFolder": "images",
  "imageExtension": "png",
  "paddingWidths": [2, 3, 1]
}
```

- `fileName`: 헤더에 표시될 이름 + 다운로드 시 저장될 파일명
- `downloadFile`: 실제 다운로드 대상 파일 경로

## 로컬에서 미리보기

브라우저 보안 정책상 `index.html`을 파일로 직접 열면 이미지 자동 탐색이 막힐 수 있습니다. 로컬 서버로 열어주세요.

```bash
npx serve .
# 또는
python3 -m http.server 8000
```

## GitHub Pages 배포

1. 이 폴더를 GitHub 저장소에 푸시합니다 (이미 연결된 저장소가 있다면 해당 저장소로).
2. GitHub 저장소 페이지에서 **Settings → Pages**로 이동합니다.
3. **Build and deployment → Source**를 `Deploy from a branch`로 설정합니다.
4. Branch를 `main` (또는 사용 중인 브랜치), 폴더를 `/ (root)`로 선택하고 저장합니다.
5. 몇 분 후 `https://<사용자명>.github.io/<저장소명>/` 에서 확인할 수 있습니다.

별도의 빌드 단계가 없는 순수 정적 사이트이므로 GitHub Actions 없이 위 설정만으로 배포됩니다. 이후 `images/` 폴더에 새 슬라이드를 추가하고 커밋·푸시만 하면 자동으로 반영됩니다.

## 조작 방법

- 방향키 ↓ / → : 다음 슬라이드
- 방향키 ↑ / ← : 이전 슬라이드
- 좌우 화살표 버튼 클릭 또는 모바일 좌우 스와이프로도 이동 가능
- 좌측 상단 메뉴 버튼: 썸네일 패널 열기/닫기 (기본값: 닫힘)
- 우측 상단 +/- : 확대/축소, 페이지 번호 입력 후 Enter로 특정 슬라이드 이동
