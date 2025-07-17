# SK-Final-2: Domain Specific GenAI Front-end

이 프로젝트는 "Domain Specific GenAI"를 위한 프론트엔드 애플리케이션입니다. [Next.js](https://nextjs.org/)를 기반으로 구축되었으며, 최신 웹 기술을 활용하여 빠르고 효율적인 개발을 지향합니다.

## 🚀 시작하기

프로젝트를 로컬 환경에서 실행하기 위한 안내입니다.

### 사전 준비

- [Node.js](https://nodejs.org/en/) (버전 20.x 이상 권장)
- `npm` 또는 `yarn`

### 설치 및 실행

1.  **저장소 복제**
    ```bash
    git clone <repository-url>
    cd front
    ```

2.  **의존성 설치**
    ```bash
    npm install
    ```

3.  **개발 서버 실행**
    ```bash
    npm run dev
    ```

    이제 브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 애플리케이션을 확인할 수 있습니다.

## 📜 주요 스크립트

`package.json`에 정의된 주요 스크립트는 다음과 같습니다.

-   `npm run dev`: Turbopack을 사용하여 개발 서버를 실행합니다.
-   `npm run build`: 프로덕션용으로 애플리케이션을 빌드합니다.
-   `npm run start`: 빌드된 프로덕션 서버를 시작합니다.
-   `npm run lint`: ESLint를 사용하여 코드 스타일 문제를 확인합니다.

## 🛠️ 기술 스택

이 프로젝트는 다음의 기술들을 중심으로 구성되어 있습니다.

-   **Framework**: [Next.js](https://nextjs.org/) 15
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4
-   **UI/Component Library**: [React](https://react.dev/) 19
-   **Linting**: [ESLint](https://eslint.org/)
-   **Formatting**: [Prettier](https://prettier.io/)

## ⚙️ 코드 스타일 및 품질

-   **ESLint**: `next/core-web-vitals` 설정을 기반으로 코드 품질을 관리합니다. 코드 문제를 확인하려면 `npm run lint`를 실행하세요.
-   **Prettier**: `.prettierrc` 파일에 정의된 규칙에 따라 코드 형식을 일관되게 유지합니다.

## 📂 디렉토리 구조

```
/
├── public/           # 정적 에셋 (이미지, 폰트 등)
├── src/
│   └── app/          # Next.js 앱 라우터
│       ├── layout.tsx  # 전역 레이아웃
│       └── page.tsx    # 메인 페이지
├── .eslintrc.mjs     # ESLint 설정
├── next.config.ts    # Next.js 설정
├── postcss.config.mjs # PostCSS 설정 (Tailwind)
├── tailwind.config.ts # Tailwind CSS 설정
└── tsconfig.json     # TypeScript 설정
```