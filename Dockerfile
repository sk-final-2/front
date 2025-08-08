# STAGE 1 : Builder
FROM node:22.18.0-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# next.config.js에 output: 'standalone' 설정이 되어 있어야 합니다.
RUN npm run build

# STAGE 2 : Production Runner
FROM node:22.18.0-alpine AS runner

WORKDIR /app

# 빌드 스테이지에서 생성된 독립 실행 파일들을 복사합니다.
COPY --from=builder /app/.next/standalone ./
# 정적 파일 및 public 폴더를 복사합니다.
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 애플리케이션은 3000번 포트를 사용합니다.
EXPOSE 3000

# 독립 실행 모드의 서버 파일을 실행합니다.
CMD ["node", "server.js"]