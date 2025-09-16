# Re:AI (Rehearse with AI & Reinforce with AI)

![REAI Logo](./public/REAI.png)

**REAI는 AI 기술을 활용하여 사용자의 면접 능력을 향상시키는 개인 맞춤형 면접 연습 플랫폼입니다.** 
사용자는 실제와 유사한 면접 환경에서 AI 아바타와 함께 인터뷰를 진행하고, 종료 후에는 심층적인 분석과 피드백을 통해 자신의 강점과 약점을 파악할 수 있습니다.

## ✨ 주요 기능

- **🤖 AI 아바타와 함께하는 실전 면접 시뮬레이션**: 3D AI 아바타와 음성으로 대화하며 실제 면접과 같은 긴장감 속에서 연습할 수 있습니다.
- **🎯 다양한 면접 유형 지원**: 직무별(기술, 인성) 및 종합 면접 등 다양한 시나리오를 선택하여 집중적으로 대비할 수 있습니다.
- **📊 심층 분석 및 피드백**: 면접 종료 후, 답변 내용, 사용 어휘, 음성 톤, 시선 처리 등을 종합적으로 분석하여 상세한 리포트를 제공합니다.
- **📱 크로스 플랫폼 지원**: 웹(PC) 환경뿐만 아니라 모바일 앱(Android, iOS)을 통해서도 언제 어디서든 면접을 연습할 수 있습니다.

## 🛠️ 기술 스택

### Frontend (Web)

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Redux](https://img.shields.io/badge/Redux-764ABC?style=for-the-badge&logo=redux&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Shadcn/UI](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge) ![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white) ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

### Mobile

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

### Infra & Deployment

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white) ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

## 📁 프로젝트 구조

```
.
├── mobile/         # React Native (Expo) 모바일 앱 프로젝트
├── public/         # 정적 에셋 (이미지, 3D 모델 등)
├── src/            # Next.js 웹 애플리케이션 소스 코드
│   ├── app/        # App Router 기반 페이지 및 API 라우트
│   ├── components/ # 공통 컴포넌트
│   ├── hooks/      # 커스텀 훅
│   ├── lib/        # 유틸리티 및 라이브러리 설정
│   └── store/      # Redux 상태 관리
├── Dockerfile      # 웹 애플리케이션 Docker 이미지 빌드 설정
├── nginx/          # Nginx 설정
└── ...
```
