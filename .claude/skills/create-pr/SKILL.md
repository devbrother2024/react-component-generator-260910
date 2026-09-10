---
name: create-pr
description: |
  현재 브랜치의 커밋을 바탕으로 GitHub PR을 생성한다. git log/diff로 변경 이력을 분석하고, 프로젝트에 맞는 PR 템플릿(한국어/영어)을 채워 `gh pr create`로 PR을 연다. 필요하면 브랜치를 원격에 푸시한다.
  이 저장소(react-component-generator)에서 실행될 때는 한국어 템플릿을, 그 외의 프로젝트에서 실행될 때는 영어 템플릿을 자동으로 선택한다.
  "PR 만들어줘", "PR 생성해줘", "pull request 열어줘", "create a PR", "open a pull request", "make a PR" 같은 요청에 활성화한다.
context: fork
---

# create-pr: GitHub Pull Request 생성

현재 브랜치의 변경사항으로 GitHub PR을 생성한다. 이 스킬이 트리거됐다는 것 자체가 PR을 열어달라는 사용자의 지시이므로, 초안을 보여주고 별도 승인을 기다리지 않고 아래 단계를 거쳐 실제로 `gh pr create`까지 실행한다.

## 1. 사전 확인

병렬로 확인한다:

- `git status` — 커밋되지 않은 변경사항이 있는지 확인한다. PR에는 커밋된 내용만 포함되므로, 남아 있다면 먼저 커밋할지 사용자에게 확인한다.
- `git branch --show-current` — 현재 브랜치가 base 브랜치(main/master)와 같으면 PR을 열 수 없으므로, 작업 브랜치를 새로 만들지 사용자에게 확인한다.
- base 브랜치 확인: `git remote show origin | grep 'HEAD branch'` (또는 저장소 상황에 맞게 `main`/`master` 판별).
- `gh auth status` — GitHub CLI 인증 여부 확인. 인증돼 있지 않으면 사용자에게 알리고 중단한다.

## 2. 변경 이력 분석

- `git log <base>..HEAD` — 이 브랜치에 포함된 커밋 전체를 확인한다 (최신 커밋 하나만 보고 판단하지 않는다).
- `git diff <base>...HEAD` — PR에 실제로 포함될 전체 변경사항을 확인한다.
- 원격에 같은 이름의 브랜치가 있는지, 있다면 로컬과 동일한 상태인지 확인한다 (ahead/behind 여부).

## 3. 템플릿 선택

`package.json`의 `name` 필드로 "이 저장소에서 실행 중"인지 "외부 프로젝트에서 실행 중"인지 판별한다:

```bash
grep -m1 '"name"' package.json
```

- 값이 `"react-component-generator"`이면 → 이 저장소에서 실행 중 → **한국어 템플릿** 사용: `references/template_ko.md`
- 그 외의 값이거나 `package.json`을 찾을 수 없으면 → 외부 프로젝트에서 실행 중 → **영어 템플릿** 사용: `references/template_en.md`

선택한 템플릿 파일을 읽고 그 섹션 구조를 그대로 따라 PR 본문을 작성한다. 섹션을 임의로 빼거나 순서를 바꾸지 않는다.

## 4. PR 제목/본문 작성

- 제목: 이 브랜치의 커밋 전체를 종합해 변경의 핵심을 한 줄로 요약한다 (최신 커밋 하나만 보고 짓지 않는다).
- 본문: 2단계에서 파악한 커밋/diff 내용을 바탕으로 템플릿의 각 섹션을 채운다.
  - 테스트 방법 체크리스트는 실제로 실행해서 통과를 확인한 항목만 체크하고, 실행하지 않았다면 미체크 상태로 남긴다.
  - 한국어 템플릿을 골랐다면 본문 전체를 한국어로, 영어 템플릿을 골랐다면 본문 전체를 영어로 작성한다 (두 언어를 섞지 않는다).

## 5. 푸시 및 PR 생성

- 현재 브랜치가 원격에 없거나 로컬보다 뒤처져 있으면 `git push -u origin <branch>`로 먼저 푸시한다.
- `gh pr create --title "<제목>" --body "$(cat <<'EOF'
<본문>
EOF
)" --base <base-브랜치>` 형태로 PR을 생성한다. 본문은 반드시 HEREDOC으로 전달해 줄바꿈과 따옴표가 깨지지 않게 한다.
- 세션에 커밋/PR용 attribution(작성자 표기) 규칙이 별도로 지정되어 있다면, PR 본문 마지막에 그 규칙을 그대로 반영한다.

## 6. 완료 보고

`gh pr create`가 성공하면 표준 출력으로 PR URL을 반환한다. 이 URL을 사용자에게 전달한다.

## 참고

- Draft PR로 열어야 하는지, 특정 리뷰어·라벨을 지정해야 하는지는 사용자 요청에 명시된 경우에만 반영한다. 임의로 추가하지 않는다.
- base 브랜치를 확신할 수 없으면 임의로 정하지 말고 사용자에게 확인한다.
