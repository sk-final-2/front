# STAGE 1
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm run build

# STAGE 2
FROM nginx:1.25-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 단계(builder)에서 생성된 빌드 결과물을 복사합니다.
COPY --from=builder /app/.next/standalone ./
# 정적 파일(public, .next/static)을 복사합니다.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

USER nginx

CMD ["nginx", "-g", "daemon off;"]