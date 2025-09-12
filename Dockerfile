# syntax=docker/dockerfile:1.6   # ← 중요! secret mount 쓰려면 필요

# STAGE 1 : Builder
FROM node:22.18.0-alpine AS builder

WORKDIR /app

# 더 빠른 캐시를 위해 deps 먼저
COPY package*.json ./
RUN npm ci

# 앱 소스 복사
COPY . .

# 빌드 시에만 .env.production을 시크릿 파일로 주입
# 이미지 레이어/히스토리에 남지 않음
RUN --mount=type=secret,id=envfile,target=/app/.env.production \
    npm run build

# STAGE 2 : Production Runner
FROM node:22.18.0-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# standalone 산출물 복사
COPY --from=builder /app/.next/standalone ./
# 정적 파일 & public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
