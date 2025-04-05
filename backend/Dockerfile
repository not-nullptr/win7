FROM oven/bun AS builder

WORKDIR /app

ARG PORT

ENV PORT=${PORT}

COPY package.json ./

RUN bun install

COPY . ./

CMD ["bun", "run", "."]
