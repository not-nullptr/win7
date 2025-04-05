FROM oven/bun AS builder

WORKDIR /app

ARG VITE_WS_URL
ARG VITE_BASE_URL

ENV VITE_WS_URL=${VITE_WS_URL}
ENV VITE_BASE_URL=${VITE_BASE_URL}

COPY package.json ./

RUN bun install

COPY . ./

RUN bun run build

FROM nginx:stable-alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /usr/share/nginx/html
