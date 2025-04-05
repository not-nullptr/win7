FROM oven/bun:1.2.2 AS builder

WORKDIR /app

ARG VITE_WS_URL
ARG VITE_BASE_URL

ENV VITE_WS_URL=${VITE_WS_URL}
ENV VITE_BASE_URL=${VITE_BASE_URL}

COPY package.json ./

RUN mkdir -p /app/shared
COPY shared/package.json ./shared/package.json
RUN bun install --cwd ./shared

RUN bun install

COPY . ./

RUN bun run build

FROM nginx:stable-alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html
